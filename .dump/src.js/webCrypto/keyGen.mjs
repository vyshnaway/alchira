import { webcrypto } from 'crypto';

const { subtle } = webcrypto;

// Generate RSA key pair using Web Crypto API
async function generateKeyPair() {
    const keyPair = await subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true, // extractable
        ["encrypt", "decrypt"]
    );

    const publicKey = await subtle.exportKey("spki", keyPair.publicKey);
    const privateKey = await subtle.exportKey("pkcs8", keyPair.privateKey);

    return {
        publicKey: Buffer.from(publicKey).toString('base64'),
        privateKey: Buffer.from(privateKey).toString('base64'),
    };
}

generateKeyPair().then(keys => {
    console.log("Public Key:", keys.publicKey);
    console.log("Private Key:", keys.privateKey);
});