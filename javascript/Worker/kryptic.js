const subtle = crypto.subtle;

const asymKeyPair = async () => {
	const keyPair = await subtle.generateKey(
		{
			name: "RSA-OAEP",
			modulusLength: 2048,
			publicExponent: new Uint8Array([1, 0, 1]),
			hash: "SHA-256",
		},
		true,
		["encrypt", "decrypt"],
	);

	const publicKey = await subtle.exportKey("spki", keyPair.publicKey);
	const privateKey = await subtle.exportKey("pkcs8", keyPair.privateKey);

	return {
		publicKey: Buffer.from(publicKey).toString("base64"),
		privateKey: Buffer.from(privateKey).toString("base64"),
	};
};

const asymEncrypt = async (data, publicKey) => {
	const importedKey = await subtle.importKey(
		"spki",
		Buffer.from(publicKey, "base64"),
		{
			name: "RSA-OAEP",
			hash: "SHA-256",
		},
		false,
		["encrypt"],
	);

	const encodedData = new TextEncoder().encode(data);
	const encrypted = await subtle.encrypt(
		{
			name: "RSA-OAEP",
		},
		importedKey,
		encodedData,
	);

	return Buffer.from(encrypted).toString("base64");
};

const asymDecrypt = async (encryptedData, privateKey) => {
	const importedKey = await subtle.importKey(
		"pkcs8",
		Buffer.from(privateKey, "base64"),
		{
			name: "RSA-OAEP",
			hash: "SHA-256",
		},
		false,
		["decrypt"],
	);

	const encryptedBuffer = Buffer.from(encryptedData, "base64");
	const decrypted = await subtle.decrypt(
		{
			name: "RSA-OAEP",
		},
		importedKey,
		encryptedBuffer,
	);

	return new TextDecoder().decode(decrypted);
};

function symGencrypt(data) {
	const key = subtle.generateKey(
		{
			name: "AES-GCM",
			length: 256,
		},
		true,
		["encrypt", "decrypt"],
	);

	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encodedData = new TextEncoder().encode(data);

	const encryptedData = key.then((generatedKey) => {
		return subtle
			.encrypt(
				{
					name: "AES-GCM",
					iv: iv,
				},
				generatedKey,
				encodedData,
			)
			.then((encrypted) => {
				return subtle.exportKey("raw", generatedKey).then((exportedKey) => {
					return {
						key: Buffer.from(exportedKey).toString("base64"),
						data: Buffer.from(encrypted).toString("base64"),
						iv: Buffer.from(iv).toString("base64"),
					};
				});
			});
	});

	return encryptedData;
}

async function symEncrypt(data, base64Key, base64Iv) {
	const keyBuffer = Buffer.from(base64Key, "base64");
	const iv = Buffer.from(base64Iv, "base64");
	const encodedData = new TextEncoder().encode(data);

	const generatedKey = await subtle.importKey(
		"raw",
		keyBuffer,
		{
			name: "AES-GCM",
		},
		false, // non-extractable
		["encrypt"],
	);

	const encrypted = await subtle.encrypt(
		{
			name: "AES-GCM",
			iv: iv,
		},
		generatedKey,
		encodedData,
	);

	return {
		key: base64Key, // Reuse the provided base64Key
		data: Buffer.from(encrypted).toString("base64"),
		iv: base64Iv, // Reuse the provided base64Iv
	};
}

function symDecrypt(encryptedData, base64Key, base64Iv) {
	// Decrypt data using AES-GCM
	const keyBuffer = Buffer.from(base64Key, "base64");
	const iv = Buffer.from(base64Iv, "base64");
	const encryptedBuffer = Buffer.from(encryptedData, "base64");

	const key = subtle.importKey(
		"raw",
		keyBuffer,
		{
			name: "AES-GCM",
		},
		false, // non-extractable
		["decrypt"],
	);

	const decryptedData = key.then((importedKey) => {
		return subtle
			.decrypt(
				{
					name: "AES-GCM",
					iv: iv,
				},
				importedKey,
				encryptedBuffer,
			)
			.then((decrypted) => {
				return new TextDecoder().decode(decrypted);
			});
	});

	return decryptedData;
}

export default {
	sym: {
		gencrypt: symGencrypt,
		encrypt: symEncrypt,
		decrypt: symDecrypt,
	},
	asym: {
		genKeyPair: asymKeyPair,
		encrypt: asymEncrypt,
		decrypt: asymDecrypt,
	},
};
