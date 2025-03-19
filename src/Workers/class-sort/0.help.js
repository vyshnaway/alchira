function createNumericArrays(arrays) {
    // Create a set of all unique strings across all arrays
    const allStrings = new Set();
    arrays.forEach(arr => arr.forEach(string => allStrings.add(string)));

    // Convert Set to Array and create reference object with numeric keys (1-based)
    const uniqueStrings = Array.from(allStrings);
    const referenceSet = {};
    uniqueStrings.forEach((string, index) => {
        referenceSet[String(index)] = string;  // Use string keys
    });

    // Create a reverse lookup for numeric conversion (string -> number)
    const stringToNumber = {};
    for (let key in referenceSet) {
        stringToNumber[referenceSet[key]] = Number(key);
    }

    // Convert each input array to numeric array based on stringToNumber
    const numericArrays = arrays.map(arr =>
        arr.map(string => stringToNumber[string])
    );

    return {
        numericArrays,
        referenceSet: Object.values(referenceSet)
    };
}

function sortByReference(array, refer, flip = true) {
    if (array.length !== refer.length) {
        throw new Error("Both arrays must be of the same length");
    }
    // Use indices to avoid extra object creation
    const indices = new Array(array.length);
    for (let i = 0; i < indices.length; i++) indices[i] = i;

    // Sort indices based on referB values
    if (flip) indices.sort((a, b) => refer[a] - refer[b]);
    else indices.sort((a, b) => refer[b] - refer[a]);

    // Build result array using sorted indices
    const result = new Array(array.length);
    for (let i = 0; i < indices.length; i++) {
        result[i] = array[indices[i]];
    }
    return result;
}

function orderToClassList(classSet, indexOrder) {
    const indexMap = {}
    const order = indexOrder.reduce((A, V, I) => {
        A[I] = classSet[V];
        indexMap[classSet[V]] = V
        return A;
    }, { length: indexOrder.length });
    return {
        classList: Array.from(order),
        classRank: indexMap
    }

}


export default {
    createNumericArrays,
    sortByReference,
    orderToClassList
}