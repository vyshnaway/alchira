// Required Node.js module for assertions
const assert = require('assert');
const dekree = require('./dekree.js');

// Test Cases using dekree object
function testBasicFunctionality() {
    const text = "Hello, World!";
    const keyLength = 10;

    const [encrypted, key] = dekree.standard.encrypt(text, keyLength);
    assert.strictEqual(encrypted.length, text.length + keyLength, "Standard encrypted length mismatch");
    assert.strictEqual(key.length, text.length + keyLength, "Standard key length mismatch");
    const decrypted = dekree.standard.decrypt(encrypted, key);
    assert.strictEqual(decrypted, text, "Standard decryption failed");

    const [encryptedAdv, keyAdv] = dekree.advanced.encrypt(text, 45); // 13 + 45 >= 58
    assert.strictEqual(encryptedAdv.length, text.length + 45, "Advanced encrypted length mismatch");
    assert.strictEqual(keyAdv.length, text.length + 45, "Advanced key length mismatch");
    const decryptedAdv = dekree.advanced.decrypt(encryptedAdv, keyAdv);
    assert.strictEqual(decryptedAdv, text, "Advanced decryption failed");

    console.log("Test 1: Basic Functionality Passed");
}

function testEmptyString() {
    const text = "";
    const keyLength = 8;

    const [encrypted, key] = dekree.standard.encrypt(text, keyLength);
    assert.strictEqual(encrypted.length, text.length + keyLength, "Standard empty encrypted length mismatch");
    assert.strictEqual(key.length, text.length + keyLength, "Standard empty key length mismatch");
    const decrypted = dekree.standard.decrypt(encrypted, key);
    assert.strictEqual(decrypted, text, "Standard empty decryption failed");

    const [encryptedAdv, keyAdv] = dekree.advanced.encrypt(text, keyLength);
    assert.strictEqual(encryptedAdv.length, text.length + keyLength, "Advanced empty encrypted length mismatch");
    assert.strictEqual(keyAdv.length, text.length + keyLength, "Advanced empty key length mismatch");
    const decryptedAdv = dekree.advanced.decrypt(encryptedAdv, keyAdv);
    assert.strictEqual(decryptedAdv, text, "Advanced empty decryption failed");

    console.log("Test 2: Empty String Passed");
}

function testMultiByteCharacters() {
    const text = "π∑Ω";

    assert.throws(
        () => dekree.standard.encrypt(text, 13),
        /keyLength \(13\) too small/,
        "Standard should reject small keyLength for multi-byte"
    );

    const keyLengthAdv = 49; // Ensures targetLength >= 52
    const [encryptedAdv, keyAdv] = dekree.advanced.encrypt(text, keyLengthAdv);
    assert.strictEqual(encryptedAdv.length, text.length + keyLengthAdv, "Advanced multi-byte encrypted length mismatch");
    assert.strictEqual(keyAdv.length, text.length + keyLengthAdv, "Advanced multi-byte key length mismatch");
    const decryptedAdv = dekree.advanced.decrypt(encryptedAdv, keyAdv);
    assert.strictEqual(decryptedAdv, text, "Advanced multi-byte decryption failed");

    console.log("Test 3: Multi-byte Characters Passed");
}

function testInsufficientKeyLength() {
    const text = "Hello";
    const keyLength = 2;

    assert.throws(
        () => dekree.standard.encrypt(text, keyLength),
        /keyLength \(2\) too small/,
        "Standard should reject insufficient keyLength"
    );

    assert.throws(
        () => dekree.advanced.encrypt(text, keyLength),
        /keyLength \(2\) too small/,
        "Advanced should reject insufficient keyLength"
    );

    console.log("Test 4: Insufficient keyLength Passed");
}

function testInvalidInputs() {
    assert.throws(
        () => dekree.standard.encrypt(null, 10),
        /Text must be a string/,
        "Standard encrypt should reject non-string text"
    );
    assert.throws(
        () => dekree.advanced.encrypt(undefined, 50),
        /Text must be a string/,
        "Advanced encrypt should reject non-string text"
    );

    assert.throws(
        () => dekree.standard.encrypt("test", -1),
        /keyLength must be a non-negative integer/,
        "Standard encrypt should reject negative keyLength"
    );
    assert.throws(
        () => dekree.advanced.encrypt("test", "10"),
        /keyLength must be a non-negative integer/,
        "Advanced encrypt should reject non-integer keyLength"
    );

    const [encrypted, key] = dekree.standard.encrypt("test", 20);
    assert.throws(
        () => dekree.standard.decrypt("abc", key),
        /Encrypted data too short/,
        "Standard decrypt should reject short encryptedHex"
    );
    assert.throws(
        () => dekree.standard.decrypt("xyz12345", key),
        /Encrypted data must start with a valid hexadecimal string/,
        "Standard decrypt should reject non-hex encryptedHex"
    );

    const [encryptedAdv, keyAdv] = dekree.advanced.encrypt("test", 50);
    assert.throws(
        () => dekree.advanced.decrypt(encryptedAdv.slice(0, 20), keyAdv),
        /Encrypted data too short/,
        "Advanced decrypt should reject short encryptedHex"
    );

    console.log("Test 5: Invalid Inputs Passed");
}

function testLargeInput() {
    const text = "a".repeat(1000);
    const keyLength = 100;

    const [encrypted, key] = dekree.standard.encrypt(text, keyLength);
    assert.strictEqual(encrypted.length, text.length + keyLength, "Standard large encrypted length mismatch");
    assert.strictEqual(key.length, text.length + keyLength, "Standard large key length mismatch");
    const decrypted = dekree.standard.decrypt(encrypted, key);
    assert.strictEqual(decrypted, text, "Standard large decryption failed");

    const [encryptedAdv, keyAdv] = dekree.advanced.encrypt(text, keyLength);
    assert.strictEqual(encryptedAdv.length, text.length + keyLength, "Advanced large encrypted length mismatch");
    assert.strictEqual(keyAdv.length, text.length + keyLength, "Advanced large key length mismatch");
    const decryptedAdv = dekree.advanced.decrypt(encryptedAdv, keyAdv);
    assert.strictEqual(decryptedAdv, text, "Advanced large decryption failed");

    console.log("Test 6: Large Input Passed");
}

function testTamperedData() {
    const text = "Test";
    const keyLength = 20;

    const [encrypted, key] = dekree.standard.encrypt(text, keyLength);
    const tampered = "0000000f" + encrypted.slice(8); // Incorrect length
    assert.throws(
        () => dekree.standard.decrypt(tampered, key),
        /Encrypted data is shorter than expected/,
        "Standard decrypt should reject tampered data"
    );

    const [encryptedAdv, keyAdv] = dekree.advanced.encrypt(text, keyLength);
    const tamperedAdv = encryptedAdv.slice(0, 32) + "0000000f" + encryptedAdv.slice(40);
    assert.throws(
        () => dekree.advanced.decrypt(tamperedAdv, keyAdv),
        /Encrypted data is shorter than expected/,
        "Advanced decrypt should reject tampered data"
    );

    console.log("Test 7: Tampered Data Passed");
}

// Run all tests
function runTests() {
    try {
        testBasicFunctionality();
        testEmptyString();
        testMultiByteCharacters();
        testInsufficientKeyLength();
        testInvalidInputs();
        testLargeInput();
        testTamperedData();
        console.log("All tests passed!");
    } catch (error) {
        console.error("Test failed:", error.message);
        process.exit(1); // Exit with error code if tests fail
    }
}

// Execute tests if run directly
if (require.main === module) {
    runTests();
}

module.exports = {
    testBasicFunctionality,
    testEmptyString,
    testMultiByteCharacters,
    testInsufficientKeyLength,
    testInvalidInputs,
    testLargeInput,
    testTamperedData,
    runTests
};