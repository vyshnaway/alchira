// Regex patterns defined globally
const PATTERNS = {
    h1: /^# (.*)$/,
    h2: /^## (.*)$/,
    h3: /^### (.*)$/,
    bold: /\*\*(.*?)\*\*/g,
    italic: /\*(.*?)\*/g,
    code: /`(.*?)`/g,
    link: /\[(.*?)\]\((.*?)\)/g,
    list: /^- (.*)$/,
    blockquote: /^> (.*)$/,
    jsx: /<([A-Z][A-Za-z0-9]*(?:\s+[^>]+)?)\/?>|<\/([A-Z][A-Za-z0-9]*)>/g,
    frontMatter: /^---\s*$(.*?)^---\s*$(.*)$/ms
};

// Helper functions
function isJSXLine(line) {
    const jsxMatch = line.match(PATTERNS.jsx);
    if (jsxMatch) {
        const tagName = jsxMatch[0].match(/[A-Za-z0-9]+/)?.[0];
        const isHtmlTag = ['p', 'strong', 'em', 'code', 'a', 'h1', 'h2', 'h3', 'li', 'blockquote', 'ul'].includes(tagName?.toLowerCase());
        return !isHtmlTag;
    }
    return false;
}

function parseInline(text) {
    if (isJSXLine(text)) {
        return text;
    }
    let result = text;
    result = result.replace(PATTERNS.link, '<a href="$2">$1</a>');
    result = result.replace(PATTERNS.bold, '<strong>$1</strong>');
    result = result.replace(PATTERNS.italic, '<em>$1</em>');
    result = result.replace(PATTERNS.code, '<code>$1</code>');
    return result;
}

function parseLine(line) {
    if (isJSXLine(line)) {
        return line;
    } else if (PATTERNS.h1.test(line)) {
        const content = line.replace(PATTERNS.h1, '$1');
        return `<h1>${parseInline(content)}</h1>`;
    } else if (PATTERNS.h2.test(line)) {
        const content = line.replace(PATTERNS.h2, '$1');
        return `<h2>${parseInline(content)}</h2>`;
    } else if (PATTERNS.h3.test(line)) {
        const content = line.replace(PATTERNS.h3, '$1');
        return `<h3>${parseInline(content)}</h3>`;
    } else if (PATTERNS.list.test(line)) {
        const content = line.replace(PATTERNS.list, '$1');
        return `<li>${parseInline(content)}</li>`;
    } else if (PATTERNS.blockquote.test(line)) {
        const content = line.replace(PATTERNS.blockquote, '$1');
        return `<blockquote>${parseInline(content)}</blockquote>`;
    } else {
        return `<p>${parseInline(line)}</p>`;
    }
}

function parseMarkdown(markdownText) {
    if (typeof markdownText !== 'string') {
        throw new Error('Input must be a string');
    }

    const lines = markdownText.split('\n');
    const htmlLines = [];
    let inList = false;

    for (let line of lines) {
        line = line.trim();
        if (!line) {
            if (inList) {
                htmlLines.push('</ul>');
                inList = false;
            }
            htmlLines.push('<p></p>');
            continue;
        }

        try {
            const parsedLine = parseLine(line);
            if (parsedLine.startsWith('<li>')) {
                if (!inList) {
                    htmlLines.push('<ul>');
                    inList = true;
                }
                htmlLines.push(parsedLine);
            } else {
                if (inList) {
                    htmlLines.push('</ul>');
                    inList = false;
                }
                htmlLines.push(parsedLine);
            }
        } catch (error) {
            console.error(`Error parsing line: "${line}"`, error);
            htmlLines.push(`<p>Error parsing: ${line}</p>`);
        }
    }

    if (inList) {
        htmlLines.push('</ul>');
    }

    return htmlLines.join('\n');
}

function parseFrontMatter(text) {
    if (typeof text !== 'string') {
        throw new Error('Front matter input must be a string');
    }

    const match = text.match(PATTERNS.frontMatter);
    if (!match) {
        return {};
    }

    const frontMatterText = match[1].trim();
    const metadata = {};

    try {
        const lines = frontMatterText.split('\n');
        for (let line of lines) {
            line = line.trim();
            if (line && line.includes(':')) {
                const [key, ...valueParts] = line.split(':');
                const value = valueParts.join(':').trim();

                if (value === 'true') {
                    metadata[key.trim()] = true;
                } else if (value === 'false') {
                    metadata[key.trim()] = false;
                } else if (!isNaN(value) && value !== '') {
                    metadata[key.trim()] = Number(value);
                } else {
                    metadata[key.trim()] = value;
                }
            }
        }
        return metadata;
    } catch (error) {
        console.error('Error parsing front matter:', error);
        return {};
    }
}

export default function parseFullDocument(documentText) {
    if (typeof documentText !== 'string') {
        throw new Error('Document input must be a string');
    }

    const match = documentText.match(PATTERNS.frontMatter);
    let metadata = {};
    let content = documentText;

    if (match) {
        const frontMatterText = match[1];
        content = match[2].trim();
        metadata = parseFrontMatter(`---\n${frontMatterText}\n---`);
    }

    try {
        const parsedContent = parseMarkdown(content);
        return {
            metadata: metadata,
            content: parsedContent
        };
    } catch (error) {
        console.error('Error parsing content:', error);
        return {
            metadata: metadata,
            content: `<p>Error parsing content: ${error.message}</p>`
        };
    }
}

// // Test the parser
// function testParser() {
//     const sampleMDXDocument = `
// ---
// title: My Post
// date: 2025-03-06
// published: true
// author: John Doe
// ---
// # Heading 1
// This is a paragraph with **bold** and *italic* text.

// - List item 1
// - List item 2

// <MyComponent prop="value" />
// <AnotherComponent>With some content</AnotherComponent>

// > Blockquote with <InlineComponent /> inside
//     `;

//     try {
//         const result = parseFullDocument(sampleMDXDocument);
//         console.log('Parsed Result:');
//         console.log('Metadata:', result.metadata);
//         console.log('Content:', result.content);

//         console.log('\nTesting invalid input:');
//         parseFullDocument(123); // Should throw error
//     } catch (error) {
//         console.error('Error:', error.message);
//     }
// }

// // Run the test
// testParser();