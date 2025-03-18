const rotateArr = (arr, n) => {
    const len = arr.length;
    n = n % len;
    return arr.slice(-n).concat(arr.slice(0, -n));
};

const superImposeArr = (arr1, arr2) => {
    let arr = [];
    while (arr1.length || arr2.length) {
        if (arr1.length) arr.push(arr1.pop());
        if (arr2.length) arr.push(arr2.pop());
    }
    return arr.join('');
};

const guidedRandomize = (arr1, arr2) => {
    let n;
    n = Math.floor(9.9 * Math.random());
    if (n === 0) n = 1;
    arr1 = [n, ...rotateArr(arr1, n)];
    n = Math.floor(arr2.length * Math.random());
    arr2 = [n, ...rotateArr(arr2, n)];
    return { arr1, arr2 };
};

const splitOddEvenPos = (arr) => {
    const arr1 = [];
    const arr2 = [];

    while (arr.length) {
        arr1.push(arr.pop());
        arr2.push(arr.pop());
    }

    return { arr1, arr2 };
};

const encoder = (auth, token, n) => {
    string = (auth + token);
    string = auth + (string.length) + token + ((string.length % 2) ? Math.floor(Math.random()*9.9) : '');
    let { arr1, arr2 } = splitOddEvenPos(string.split(""));
    console.log(string)
    console.log(arr1.join(""));
    console.log(arr2.join(""));
    console.log(superImposeArr(arr1, arr2))
    while (n--) {
        ({ arr1, arr2 } = guidedRandomize(arr1, arr2));
    }
    return superImposeArr(arr1, arr2);
};

const decoder = (encodedString, n) => {
    let arr = encodedString.split('');
    let { arr1, arr2 } = splitOddEvenPos(arr)

    while (n--) {
        let num1 = arr1.shift();
        let num2 = arr2.shift();
        arr1 = rotateArr(arr1, -num1);
        arr2 = rotateArr(arr2, -num2);
    }

    let decodedString = superImposeArr(arr1, arr2);
    decodedString = decodedString.replace(')0(', '').replace(')00(', '');

    return decodedString;
};

// Example usage:
const auth = 'vyshnav-prasad';
const token = 'xclass-native';
const encoded = encoder(auth, token, 5);
console.log('Encoded:', encoded);
const decoded = decoder(encoded, 5);
console.log('Decoded:', decoded);
