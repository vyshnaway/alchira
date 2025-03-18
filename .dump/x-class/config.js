export const mergeObjects = (arr) => {
    return arr.reduce((acc, obj) => {
        Object.keys(obj).forEach(key => {
            if (Array.isArray(obj[key]) && Array.isArray(acc[key])) {
                acc[key] = [...acc[key], ...obj[key]];
            } else if (typeof obj[key] === 'object' && typeof acc[key] === 'object') {
                acc[key] = mergeObjects([acc[key], obj[key]]);
            } else {
                acc[key] = obj[key];
            }
        });
        return acc;
    }, {});
};

export const convertToRegex = (obj) => {
    const result = {};

    Object.keys(obj).forEach(key => {
        result[key] = {};
        Object.keys(obj[key]).forEach(subKey => {
            result[key][subKey] = new RegExp(obj[key][subKey]);
        });
    });

    return result;
};