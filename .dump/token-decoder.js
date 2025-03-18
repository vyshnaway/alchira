function splitOddEvenPos(arr) {
    const odd = [];
    const even = [];

    arr.forEach(num => {
        if (num % 2 === 0) {
            even.push(num);
        } else {
            odd.push(num);
        }
    });

    return { odd, even };
}

function separateAlphaNumeric(arr) {
    const alphabets = [];
    const numbers = [];

    arr.forEach(char => {
        if (/[a-zA-Z]/.test(char)) {
            alphabets.push(char);
        } else if (/[0-9]/.test(char)) {
            numbers.push(char);
        }
    });

    return { alphabets, numbers };
}

// Example usage:
const charArray = ['a', '1', 'b', '2', 'c', '3', 'd', '4'];
const result = separateAlphaNumeric(charArray);
console.log('Alphabets:', result.alphabets); // ['a', 'b', 'c', 'd']
console.log('Numbers:', result.numbers); // ['1', '2', '3', '4']


// Example usage:
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const result = splitOddEvenPos(numbers);
console.log('Odd numbers:', result.odd); // [1, 3, 5, 7, 9]
console.log('Even numbers:', result.even); // [2, 4, 6, 8]
