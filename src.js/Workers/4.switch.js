export default function objectSwitch(srcObject) {
    if (!srcObject || typeof srcObject !== 'object') {
        return {};
    }

    const output = {};

    for (const outerKey in srcObject) {
        if (srcObject.hasOwnProperty(outerKey) && outerKey[0] !== '+') {
            const innerObject = srcObject[outerKey];

            if (typeof innerObject === 'object' && innerObject !== null) {
                for (const innerKey in innerObject) {
                    if (innerObject.hasOwnProperty(innerKey)) {
                        output[innerKey] = output[innerKey] || {};
                        output[innerKey][outerKey] = innerObject[innerKey];
                    }
                }
            }
        }
    }

    return output;
}
