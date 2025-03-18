const digitsArray = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '_',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '-'
];

function convertBase(number, fromBase, toBase, digitsArray) {
    let base10 = parseInt(number, fromBase);
    let result = '';
    while (base10 > 0) {
        result = digitsArray[base10 % toBase] + result;
        base10 = Math.floor(base10 / toBase);
    }
    return (result === "" ? digitsArray[0] : result);
}
const enCounter = (number) => convertBase(number, 10, digitsArray.length, digitsArray);

export const classNameGenerator = (classPrefix, path, cxcClass, index) => {
    let [prefix, suffix] = cxcClass.split("$");
    let className;

    switch (prefix) {
        case "g":
            className = `${classPrefix.globalStyle}_${suffix}`; break;
        case "l":
            const ref = path.split('/');
            const component = ref.pop();
            className = `${classPrefix.localStyle}${ref.pop()[0]}_${component}-${suffix ?? enCounter(cxcRandomClassCounter++)}`; break;
        default:
            className = `${classPrefix.lazyStyle}_${enCounter(index)}`; break;
    }
    return className;
}

export const stylesheetToObject = (styleText) => {
    try {
        const object = {};
        styleText = styleText.replace(/\/\*[\s\S]*?\*\//g, '');
        const styles = styleText.match(/[^{]*{[^}]*}/g) || [];

        styles.forEach(style => {
            const [selector, properties] = style.split('{');
            const cleanSelector = selector.trim();
            const cleanProperties = properties.replace('}', '').trim();
            const propertyArray = cleanProperties.split(';').filter(Boolean);

            object[cleanSelector] = propertyArray.reduce((acc, property) => {
                const [key, value] = property.split(':').map(item => item.trim());
                acc[key] = value;
                return acc;
            }, {});
        });

        return object;
    } catch (err) {
        console.error(err);
    }
};


const splitattributeValue = (value) => {
    const regex = /\[([^\]]+)\]|(\S+)/g;
    const result = [];
    let match;
    while ((match = regex.exec(value)) !== null) {
        result.push(match[1] || match[2]);
    }
    return result;
};

const styleStringToObject = (properties) => {
    const propertyArray = properties.trim().split(';').filter(Boolean);

    return propertyArray.reduce((acc, property) => {
        const [key, value] = property.split(':').map(item => item.trim());
        acc[key] = value;
        return acc;
    }, {});
}

const attributeValueToStyle = (value, cssReference, join = ' ') => {
    const styleObject = splitattributeValue(value).reduce((styleAcc, value) => {
        if (value.includes(":")) {
            return { ...styleAcc, ...(styleStringToObject(value)) };
        } else {
            return { ...styleAcc, ...cssReference[value] };
        }
    }, {});
    let styleString = `${join}`;
    for (const [key, value] of Object.entries(styleObject)) {
        styleString += `${key}:${value};${join}`;
    }
    return styleString;
}
