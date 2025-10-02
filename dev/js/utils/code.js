function isInString(input, index) {
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let inTemplateLiteral = false;
    let escaped = false;
    for (let i = 0; i < index; i++) {
        const char = input[i];
        if (escaped) {
            escaped = false;
            continue;
        }
        if (char === "\\") {
            escaped = true;
            continue;
        }
        if (char === "'" && !inDoubleQuote && !inTemplateLiteral) {
            inSingleQuote = !inSingleQuote;
        }
        else if (char === '"' && !inSingleQuote && !inTemplateLiteral) {
            inDoubleQuote = !inDoubleQuote;
        }
        else if (char === "`" && !inSingleQuote && !inDoubleQuote) {
            inTemplateLiteral = !inTemplateLiteral;
        }
    }
    return inSingleQuote || inDoubleQuote || inTemplateLiteral;
}
function stripComments(content, single = true, multi = true, html = true) {
    const result = [];
    let i = 0;
    while (i < content.length) {
        const char = content[i];
        // Single-line comments (//)
        if (single &&
            char === "/" &&
            i + 1 < content.length &&
            content[i + 1] === "/" &&
            !isInString(content, i)) {
            i += 2;
            while (i < content.length && content[i] !== "\n") {
                i++;
            }
            continue;
        }
        // Multi-line comments (/* */)
        if (multi &&
            char === "/" &&
            i + 1 < content.length &&
            content[i + 1] === "*" &&
            !isInString(content, i)) {
            i += 2;
            while (i + 1 < content.length &&
                !(content[i] === "*" && content[i + 1] === "/")) {
                i++;
            }
            i += 2;
            continue;
        }
        // HTML comments (<!-- -->)
        if (html &&
            char === "<" &&
            i + 3 < content.length &&
            content.substring(i, i + 4) === "<!--" &&
            !isInString(content, i)) {
            i += 4;
            while (i + 2 < content.length &&
                content.substring(i, i + 3) !== "-->") {
                i++;
            }
            i += 3;
            continue;
        }
        result.push(char);
        i++;
    }
    return result.join("");
}
const REGEX_PATTERNS = {
    comments: /\/\*[\s\S]*?\*\//gm,
    spacing: /\s*([{}:;,])\s*|\s+([{}])|(:)\s*([^;}]*)\s*([;}])|\s*!important/g,
    valueOptimizations: /#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3|(\d+)(px|em|rem|%|vw|vh)\s+(\d+)\5|0(px|em|rem|%|vw|vh)/gi,
    rgbToHex: /rgb\((\d+),\s*(\d+),\s*(\d+)\)/g,
};
function stripCssComments(content) {
    return content
        .replace(REGEX_PATTERNS.comments, "")
        .replace(/(\s*\r\n)+/g, "\n")
        .replace(/(\s*\n)+/g, "\n")
        .trim();
}
function minifyCssAggressive(content) {
    return (content
        // Step 1: Optimize spacing
        .replace(REGEX_PATTERNS.spacing, (_, sym1, sym2, colon, value, end) => {
        if (sym1) {
            return sym1;
        }
        if (sym2) {
            return sym2;
        }
        if (colon) {
            return `${colon}${value}${end}`;
        }
        return "!important";
    })
        // Step 2: Optimize values
        .replace(REGEX_PATTERNS.valueOptimizations, (_, h1, h2, h3, num1, unit, num2) => {
        if (h1) {
            return `#${h1}${h2}${h3}`;
        }
        if (num1) {
            return `${num1} ${num2}${unit}`;
        }
        return "0";
    })
        // Step 3: RGB to hex
        .replace(REGEX_PATTERNS.rgbToHex, (_, r, g, b) => {
        const toHex = (n) => Math.min(255, Math.max(0, +n))
            .toString(16)
            .padStart(2, "0");
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`.replace(REGEX_PATTERNS.valueOptimizations, "#$1$2$3");
    })
        .trim());
}
function minifyCssLite(content) {
    return (content
        .replace(REGEX_PATTERNS.spacing, (_, sym1, sym2, colon, value, end) => {
        if (sym1) {
            return sym1;
        }
        if (sym2) {
            return sym2;
        }
        if (colon) {
            return `${colon}${value}${end}`;
        }
        return "!important";
    })
        .trim());
}
export default {
    jsonc: {
        parse: (string) => JSON.parse(stripComments(string)),
        build: (object) => JSON.stringify(object, null, 4),
    },
    uncomment: {
        Script: stripComments,
        Css: stripCssComments,
    },
    minify: {
        Strict: minifyCssAggressive,
        Lite: minifyCssLite,
    },
};
//# sourceMappingURL=code.js.map