import tagReader from "./tag.js";

export const cursor = { marker: 0, rowMarker: 0, columnMarker: 0, tagCount: 0 };

function scanner(fileData, classProps, action) {
    cursor.tagCount = 1, cursor.rowMarker = 1, cursor.columnMarker = 1, cursor.marker = 0;
    const stylesList = [], classesList = [];
    let ch = fileData.content[0], reading = true, scribed = "";

    while (cursor.marker < fileData.content.length) {
        if (ch === "\n") { cursor.rowMarker++; cursor.columnMarker = 0 }
        else cursor.columnMarker++;
        // console.log({ ch, cur: cursor.marker, row: cursor.rowMarker, col: cursor.columnMarker })

        if (ch === "<") {
            cursor.tagCount++;
            const response = tagReader(fileData.content, action, classProps, fileData);
            if (response.ok) {
                if (Object.keys(response.styleObject.styles).length > 0)
                    stylesList.push(response.styleObject)
                if (response.classList.length) classesList.push(response.classList)
            }
            scribed += response.content
            reading = response.reading
        } else if (ch === '"' || ch === "'" || ch === "`") {
            const quote = ch;
            cursor.marker++;
            ch = fileData.content[cursor.marker];
            while (cursor.marker < fileData.content.length && (ch !== quote || fileData.content[cursor.marker - 1] === "\\")) {
                cursor.marker++;
                ch = fileData.content[cursor.marker];
            }
            cursor.marker++; // Skip the closing quote
        } else {
            scribed += ch; 
            cursor.marker++
        }

        ch = fileData.content[cursor.marker]
    }

    return { scribed, classesList, stylesList }
}

export default {
    read: (fileData, classProps) => scanner(fileData, classProps, "read"),
    dev: (fileData, classProps) => scanner(fileData, classProps, "dev"),
    preview: (fileData, classProps) => scanner(fileData, classProps, "preview"),
    build: (fileData, classProps) => scanner(fileData, classProps, "build"),
}