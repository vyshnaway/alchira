const REGEX = {
    COMMENT: /\/\*[\s\S]*?\*\//g,
    CAMEL_MATCH: /-([a-z])/g
}

function toCamelCase(str) {
    return str.replace(REGEX.CAMEL_MATCH, (match, letter) => letter.toUpperCase());
}

function parseDynamicStyles(input) {
    // Remove comments
    input = input.replace(REGEX.COMMENT, '');

    // Convert kebab-case to camelCase

    const result = {};

    // Parse main structure
    const mainMatch = input.match(/#(\w+):(\w+)\s*{([\s\S]*?)}/);
    if (!mainMatch) {
        // console.error("Main structure not found");
        return result;
    }
    // console.log("Main match:", mainMatch);

    const [, originSelector, originProperty, content] = mainMatch;
    result[`#${originSelector}`] = { [originProperty]: {} };

    // Parse target selectors
    const targetRegex = /(\.[\w-]+|#[\w-]+):?\s*{([\s\S]*?)}/g;
    let targetMatch;
    while ((targetMatch = targetRegex.exec(content)) !== null) {
        // console.log("Target match:", targetMatch);
        const targetSelector = targetMatch[1];
        const targetContent = targetMatch[2].trim();
        const targetStyles = {};

        // Parse class directives
        const classDirectiveRegex = /@\(([\d]+px)\)\s*([+\-!])\s*([\w\s]+);/g;
        let classMatch;
        while ((classMatch = classDirectiveRegex.exec(targetContent)) !== null) {
            // console.log("Class directive match:", classMatch);
            const [_, px, operator, classes] = classMatch;
            targetStyles[operator] = classes.trim().split(/\s+/);
        }

        // Parse style properties
        const styleRegex = /([\w-]+):\s*{([\s\S]*?)}/g;
        let styleMatch;
        while ((styleMatch = styleRegex.exec(targetContent)) !== null) {
            // console.log("Style match:", styleMatch);
            const property = toCamelCase(styleMatch[1]);
            const styleContent = styleMatch[2].trim();
            const styleMap = {};

            // Parse key-value pairs
            const pairRegex = /"([\d]+px)":\s*([^;]+);/g;
            let pairMatch;
            while ((pairMatch = pairRegex.exec(styleContent)) !== null) {
                // console.log("Pair match:", pairMatch);
                const [_, px, value] = pairMatch;
                styleMap[px] = isNaN(value.trim()) ? value.trim() : Number(value.trim());
            }
            targetStyles[property] = styleMap;
        }

        result[`#${originSelector}`][originProperty][targetSelector] = targetStyles;
    }

    return result;
}

// Test input
const input = `
#mainSection:yPosition {
    .sidebar: {
        @(46px) + class1 class2;
        @(48px) - class5;
        @(47px) ! class7 class6;
        animation: {
            "50px": fadeIn .5s ease;
        }
        background-color: {
            "20px": gray;
            "100px": white
        }
        opacity: {
            "20px": 0.2;
            "100px": 0.8
        }
    }
    #content:opacity: {
        "10px": 1;
        "150px": 0.5
    }
} /* this is a comment */
`;

console.log(parseDynamicStyles(input));
