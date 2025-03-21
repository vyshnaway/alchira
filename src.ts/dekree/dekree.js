// Utility to generate a random key
function generateRandomKey(length) {
    const randomBytes = crypto.getRandomValues(new Uint8Array(length));
    return new TextDecoder().decode(randomBytes); // Convert to string
}

function numberToHex(length) {
    if (!Number.isInteger(length) || length < 0 || length > 0xFFFFFFFF) {
        throw new Error('Length must be a non-negative integer up to 4294967295');
    }
    const hex = length.toString(16).padStart(8, '0');
    return hex;
}

function hexToNumber(hex) {
    if (typeof hex !== 'string' || hex.length !== 8 || !/^[0-9a-fA-F]{8}$/.test(hex)) {
        throw new Error('Invalid hex string for length');
    }
    return parseInt(hex, 16);
}

function standardEncrypt(text, keyLength = 16) {
    if (typeof text !== 'string') {
        throw new TypeError('Text must be a string');
    }
    if (!Number.isInteger(keyLength) || keyLength < 0) {
        throw new TypeError('keyLength must be a non-negative integer');
    }

    const textEncoder = new TextEncoder();
    const textBytes = textEncoder.encode(text);
    const textBytesLength = textBytes.length;

    const totalKeyLength = text.length + keyLength;
    const key = generateRandomKey(totalKeyLength); // Assume this function exists
    const keyBytes = textEncoder.encode(key);

    const encrypted = new Uint8Array(textBytesLength);
    for (let i = 0; i < textBytesLength; i++) {
        const keyByte = keyBytes[i % keyBytes.length];
        encrypted[i] = textBytes[i] ^ keyByte;
    }

    const encryptedHex = Array.from(encrypted)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    const lengthHex = numberToHex(textBytesLength);
    let fullEncryptedHex = lengthHex + encryptedHex;

    const minLength = 8 + 2 * textBytesLength;
    const targetLength = text.length + keyLength;

    if (targetLength < minLength) {
        throw new Error(`keyLength (${keyLength}) too small: encrypted length must be at least ${minLength} for text of length ${text.length}`);
    }
    if (fullEncryptedHex.length < targetLength) {
        fullEncryptedHex = fullEncryptedHex.padEnd(targetLength, '0');
    }

    return [fullEncryptedHex, key];
}

function standardDecrypt(encryptedHex, key) {
    if (typeof encryptedHex !== 'string' || typeof key !== 'string') {
        throw new TypeError('Encrypted data and key must be strings');
    }
    if (encryptedHex.length < 8) {
        throw new Error('Encrypted data too short: must include at least 8 hex characters for length');
    }
    if (!encryptedHex.match(/^[0-9a-fA-F]+/)) {
        throw new Error('Encrypted data must start with a valid hexadecimal string');
    }

    const lengthHex = encryptedHex.slice(0, 8);
    const length = hexToNumber(lengthHex);
    const expectedDataLength = 2 * length;
    const dataHex = encryptedHex.slice(8, 8 + expectedDataLength);

    if (dataHex.length < expectedDataLength) {
        throw new Error('Encrypted data is shorter than expected');
    }

    const encryptedBytes = new Uint8Array(
        dataHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    );
    const keyBytes = new TextEncoder().encode(key);

    const decrypted = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        const keyByte = keyBytes[i % keyBytes.length];
        decrypted[i] = encryptedBytes[i] ^ keyByte;
    }

    return new TextDecoder().decode(decrypted);
}

function advancedEncrypt(text, keyLength = 16) {
    if (typeof text !== 'string') {
        throw new TypeError('Text must be a string');
    }
    if (!Number.isInteger(keyLength) || keyLength < 0) {
        throw new TypeError('keyLength must be a non-negative integer');
    }

    const textEncoder = new TextEncoder();
    const textBytes = textEncoder.encode(text);
    const textBytesLength = textBytes.length;

    const totalKeyLength = text.length + keyLength;
    const key = generateRandomKey(totalKeyLength);
    const keyBytes = textEncoder.encode(key);

    const iv = crypto.getRandomValues(new Uint8Array(16));
    const encrypted = new Uint8Array(textBytesLength);
    for (let i = 0; i < textBytesLength; i++) {
        const keyByte = keyBytes[i % keyBytes.length] ^ iv[i % iv.length];
        encrypted[i] = textBytes[i] ^ keyByte;
    }

    const ivHex = Array.from(iv)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    const lengthHex = numberToHex(textBytesLength);
    const encryptedHex = Array.from(encrypted)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    let fullEncryptedHex = ivHex + lengthHex + encryptedHex;

    const minLength = 32 + 8 + 2 * textBytesLength;
    const targetLength = text.length + keyLength;

    if (targetLength < minLength) {
        throw new Error(`keyLength (${keyLength}) too small: encrypted length must be at least ${minLength} for text of length ${text.length}`);
    }
    if (fullEncryptedHex.length < targetLength) {
        fullEncryptedHex = fullEncryptedHex.padEnd(targetLength, '0');
    }

    return [fullEncryptedHex, key];
}

function advancedDecrypt(encryptedHex, key) {
    if (typeof encryptedHex !== 'string' || typeof key !== 'string') {
        throw new TypeError('Encrypted data and key must be strings');
    }
    if (encryptedHex.length < 40) {
        throw new Error('Encrypted data too short: must include at least 40 hex characters for IV and length');
    }
    if (!encryptedHex.match(/^[0-9a-fA-F]+/)) {
        throw new Error('Encrypted data must start with a valid hexadecimal string');
    }

    const ivHex = encryptedHex.slice(0, 32);
    const lengthHex = encryptedHex.slice(32, 40);
    const length = hexToNumber(lengthHex);
    const expectedDataLength = 2 * length;
    const dataHex = encryptedHex.slice(40, 40 + expectedDataLength);

    if (dataHex.length < expectedDataLength) {
        throw new Error('Encrypted data is shorter than expected');
    }

    const iv = new Uint8Array(
        ivHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    );
    const encryptedBytes = new Uint8Array(
        dataHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    );
    const keyBytes = new TextEncoder().encode(key);

    const decrypted = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        const keyByte = keyBytes[i % keyBytes.length] ^ iv[i % iv.length];
        decrypted[i] = encryptedBytes[i] ^ keyByte;
    }

    return new TextDecoder().decode(decrypted);
}

// Export the modified functions
const dekree = {
    standard: {
        encrypt: standardEncrypt,
        decrypt: standardDecrypt
    },
    advanced: {
        encrypt: advancedEncrypt,
        decrypt: advancedDecrypt
    }
};

export default dekree;

console.log(dekree.advanced.decrypt(...dekree.advanced.encrypt("now more than ever and before", 66) ))