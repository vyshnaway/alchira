package order

import (
	_fmt_ "fmt"
	_errors_ "errors"
	_aes_ "crypto/aes"
	_rsa_ "crypto/rsa"
	_x509_ "crypto/x509"
	_rand_ "crypto/rand"
	_cipher_ "crypto/cipher"
	_sha256_ "crypto/sha256"
	_base64_ "encoding/base64"
)

// // tCrypt_KeyPair represents a public-private key pair
// type tCrypt_KeyPair struct {
// 	PublicKey  string `json:"publicKey"`
// 	PrivateKey string `json:"privateKey"`
// }

// tCrypt_SymResult represents symmetric encryption result
type tCrypt_SymResult struct {
	Key  string `json:"key"`
	Data string `json:"data"`
	IV   string `json:"iv"`
}

// // crypt_AsymKeyPair generates an RSA-OAEP 2048-bit key pair
// func crypt_AsymKeyPair() (*tCrypt_KeyPair, error) {
// 	// Generate RSA key pair
// 	privateKey, err := _rsa_.GenerateKey(_rand_.Reader, 2048)
// 	if err != nil {
// 		return nil, _fmt_.Errorf("failed to generate key pair: %w", err)
// 	}

// 	// Export public key in SPKI format
// 	publicKeyBytes, err := _x509_.MarshalPKIXPublicKey(&privateKey.PublicKey)
// 	if err != nil {
// 		return nil, _fmt_.Errorf("failed to marshal public key: %w", err)
// 	}

// 	// Export private key in PKCS8 format
// 	privateKeyBytes, err := _x509_.MarshalPKCS8PrivateKey(privateKey)
// 	if err != nil {
// 		return nil, _fmt_.Errorf("failed to marshal private key: %w", err)
// 	}

// 	return &tCrypt_KeyPair{
// 		PublicKey:  _base64_.StdEncoding.EncodeToString(publicKeyBytes),
// 		PrivateKey: _base64_.StdEncoding.EncodeToString(privateKeyBytes),
// 	}, nil
// }

// crypt_AsymEncrypt encrypts data using RSA-OAEP with a base64-encoded public key
func crypt_AsymEncrypt(data, publicKeyBase64 string) (string, error) {
	// Decode public key from base64
	publicKeyBytes, err := _base64_.StdEncoding.DecodeString(publicKeyBase64)
	if err != nil {
		return "", _fmt_.Errorf("failed to decode public key: %w", err)
	}

	// Parse public key
	publicKeyInterface, err := _x509_.ParsePKIXPublicKey(publicKeyBytes)
	if err != nil {
		return "", _fmt_.Errorf("failed to parse public key: %w", err)
	}

	publicKey, ok := publicKeyInterface.(*_rsa_.PublicKey)
	if !ok {
		return "", _errors_.New("public key is not RSA")
	}

	// Encrypt data
	encrypted, err := _rsa_.EncryptOAEP(
		_sha256_.New(),
		_rand_.Reader,
		publicKey,
		[]byte(data),
		nil,
	)
	if err != nil {
		return "", _fmt_.Errorf("failed to encrypt: %w", err)
	}

	return _base64_.StdEncoding.EncodeToString(encrypted), nil
}

// // crypt_AsymDecrypt decrypts data using RSA-OAEP with a base64-encoded private key
// func crypt_AsymDecrypt(encryptedData, privateKeyBase64 string) (string, error) {
// 	// Decode private key from base64
// 	privateKeyBytes, err := _base64_.StdEncoding.DecodeString(privateKeyBase64)
// 	if err != nil {
// 		return "", _fmt_.Errorf("failed to decode private key: %w", err)
// 	}

// 	// Parse private key
// 	privateKeyInterface, err := _x509_.ParsePKCS8PrivateKey(privateKeyBytes)
// 	if err != nil {
// 		return "", _fmt_.Errorf("failed to parse private key: %w", err)
// 	}

// 	privateKey, ok := privateKeyInterface.(*_rsa_.PrivateKey)
// 	if !ok {
// 		return "", _errors_.New("private key is not RSA")
// 	}

// 	// Decode encrypted data from base64
// 	encryptedBytes, err := _base64_.StdEncoding.DecodeString(encryptedData)
// 	if err != nil {
// 		return "", _fmt_.Errorf("failed to decode encrypted data: %w", err)
// 	}

// 	// Decrypt data
// 	decrypted, err := _rsa_.DecryptOAEP(
// 		_sha256_.New(),
// 		_rand_.Reader,
// 		privateKey,
// 		encryptedBytes,
// 		nil,
// 	)
// 	if err != nil {
// 		return "", _fmt_.Errorf("failed to decrypt: %w", err)
// 	}

// 	return string(decrypted), nil
// }

// crypt_SymGencrypt generates a new AES-256-GCM key and encrypts data
func crypt_SymGencrypt(data string) (*tCrypt_SymResult, error) {
	// Generate 256-bit AES key
	key := make([]byte, 32)
	if _, err := _rand_.Read(key); err != nil {
		return nil, _fmt_.Errorf("failed to generate key: %w", err)
	}

	// Generate 96-bit nonce (12 bytes)
	nonce := make([]byte, 12)
	if _, err := _rand_.Read(nonce); err != nil {
		return nil, _fmt_.Errorf("failed to generate nonce: %w", err)
	}

	// Create AES cipher
	block, err := _aes_.NewCipher(key)
	if err != nil {
		return nil, _fmt_.Errorf("failed to create cipher: %w", err)
	}

	// Create GCM mode
	gcm, err := _cipher_.NewGCM(block)
	if err != nil {
		return nil, _fmt_.Errorf("failed to create GCM: %w", err)
	}

	// Encrypt data
	encrypted := gcm.Seal(nil, nonce, []byte(data), nil)

	return &tCrypt_SymResult{
		Key:  _base64_.StdEncoding.EncodeToString(key),
		Data: _base64_.StdEncoding.EncodeToString(encrypted),
		IV:   _base64_.StdEncoding.EncodeToString(nonce),
	}, nil
}

// // crypt_SymEncrypt encrypts data using provided AES-256-GCM key and nonce
// func crypt_SymEncrypt(data, base64Key, base64IV string) (*tCrypt_SymResult, error) {
// 	// Decode key and IV
// 	key, err := _base64_.StdEncoding.DecodeString(base64Key)
// 	if err != nil {
// 		return nil, _fmt_.Errorf("failed to decode key: %w", err)
// 	}

// 	nonce, err := _base64_.StdEncoding.DecodeString(base64IV)
// 	if err != nil {
// 		return nil, _fmt_.Errorf("failed to decode IV: %w", err)
// 	}

// 	// Create AES cipher
// 	block, err := _aes_.NewCipher(key)
// 	if err != nil {
// 		return nil, _fmt_.Errorf("failed to create cipher: %w", err)
// 	}

// 	// Create GCM mode
// 	gcm, err := _cipher_.NewGCM(block)
// 	if err != nil {
// 		return nil, _fmt_.Errorf("failed to create GCM: %w", err)
// 	}

// 	// Encrypt data
// 	encrypted := gcm.Seal(nil, nonce, []byte(data), nil)

// 	return &tCrypt_SymResult{
// 		Key:  base64Key,
// 		Data: _base64_.StdEncoding.EncodeToString(encrypted),
// 		IV:   base64IV,
// 	}, nil
// }

// crypt_SymDecrypt decrypts data using AES-256-GCM with provided key and nonce
func crypt_SymDecrypt(encryptedData, base64Key, base64IV string) (string, error) {
	// Decode key, IV, and encrypted data
	key, err := _base64_.StdEncoding.DecodeString(base64Key)
	if err != nil {
		return "", _fmt_.Errorf("failed to decode key: %w", err)
	}

	nonce, err := _base64_.StdEncoding.DecodeString(base64IV)
	if err != nil {
		return "", _fmt_.Errorf("failed to decode IV: %w", err)
	}

	encryptedBytes, err := _base64_.StdEncoding.DecodeString(encryptedData)
	if err != nil {
		return "", _fmt_.Errorf("failed to decode encrypted data: %w", err)
	}

	// Create AES cipher
	block, err := _aes_.NewCipher(key)
	if err != nil {
		return "", _fmt_.Errorf("failed to create cipher: %w", err)
	}

	// Create GCM mode
	gcm, err := _cipher_.NewGCM(block)
	if err != nil {
		return "", _fmt_.Errorf("failed to create GCM: %w", err)
	}

	// Decrypt data
	decrypted, err := gcm.Open(nil, nonce, encryptedBytes, nil)
	if err != nil {
		return "", _fmt_.Errorf("failed to decrypt: %w", err)
	}

	return string(decrypted), nil
}