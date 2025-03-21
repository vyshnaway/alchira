import { generateKeyPairSync, publicEncrypt, privateDecrypt } from 'crypto';

// Generate RSA key pair (run once, store securely)
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// Utility to pad to desired length
function padToLength(data, targetLength, padChar = '0') {
    if (data.length > targetLength) throw new Error('Data exceeds target length');
    return data.padEnd(targetLength, padChar);
}

// Client-side encryption: Encrypts [key, message] with server's public key
export function encryptClient(key, message, serverPublicKey, n = 16) {
    if (typeof key !== 'string' || typeof message !== 'string') {
        throw new TypeError('Key and message must be strings');
    }
    if (!Number.isInteger(n) || n < 16) {
        throw new TypeError('n must be an integer >= 16');
    }

    const payload = JSON.stringify([key, message]);
    const encryptedBuffer = publicEncrypt(serverPublicKey, Buffer.from(payload));
    const encryptedHex = encryptedBuffer.toString('hex');

    // Ensure length = payload.length + n
    const targetLength = payload.length + n;
    return padToLength(encryptedHex, targetLength, 'f');
}

// Server-side decryption and encryption (edge function)
export async function handler(request) {
    try {
        const encryptedData = await request.text();

        // Decrypt with private key
        const decryptedBuffer = privateDecrypt(privateKey, Buffer.from(encryptedData, 'hex'));
        const [key, message] = JSON.parse(decryptedBuffer.toString());

        // Verify key in database (mocked)
        const isValidKey = await verifyKeyInDatabase(key);
        if (!isValidKey) {
            return new Response(JSON.stringify({ error: 'Invalid key' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Process message
        const processedMessage = message.toUpperCase();

        // Encrypt response with symmetric key (XOR for simplicity)
        const textEncoder = new TextEncoder();
        const messageBytes = textEncoder.encode(processedMessage);
        const keyBytes = textEncoder.encode(key);
        const encryptedBytes = messageBytes.map((byte, i) => byte ^ keyBytes[i % keyBytes.length]);
        const responseHex = Array.from(encryptedBytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        const targetLength = processedMessage.length + 16; // n=16 for response
        const encryptedResponse = padToLength(responseHex, targetLength, 'f');

        return new Response(encryptedResponse, {
            status: 200,
            headers: { 'Content-Type': 'text/plain' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Mock database verification
async function verifyKeyInDatabase(key) {
    const mockDb = { 'mysecretkey': true }; // Replace with real DB call
    return Promise.resolve(!!mockDb[key]);
}

// Client-side decryption with symmetric key
export function decryptClient(encryptedResponse, key) {
    if (typeof encryptedResponse !== 'string' || typeof key !== 'string') {
        throw new TypeError('Encrypted response and key must be strings');
    }

    const encryptedBytes = new Uint8Array(encryptedResponse.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const keyBytes = new TextEncoder().encode(key);
    const messageBytes = encryptedBytes.map((byte, i) => byte ^ keyBytes[i % keyBytes.length]);
    return new TextDecoder().decode(messageBytes);
}

// Simulate the system
async function simulateSystem() {
    const key = 'mysecretkey';
    const message = 'Hello, Server!';
    const encryptedData = encryptClient(key, message, publicKey, 20);
    console.log('Client sends:', encryptedData.slice(0, 50) + '...', `(length: ${encryptedData.length})`);

    const mockRequest = { text: async () => encryptedData };
    const response = await handler(mockRequest);
    const encryptedResponse = await response.text();
    console.log('Server responds:', encryptedResponse.slice(0, 50) + '...', `(length: ${encryptedResponse.length})`);

    const decryptedMessage = decryptClient(encryptedResponse, key);
    console.log('Client receives:', decryptedMessage);

    if (decryptedMessage !== message.toUpperCase()) throw new Error('System failed');
    console.log('System test passed!');
}

if (typeof window === 'undefined') {
    simulateSystem();
}

export const config = { runtime: 'edge' };