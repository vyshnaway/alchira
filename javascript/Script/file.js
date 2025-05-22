import tagReader from "./tag.js";

export const xtyleTag = "xtyle";
export const FileCursor = { marker: 0, rowMarker: 0, columnMarker: 0, tagCount: 0 };
export const StyleStack = { Library: {}, Local: {}, Global: {} };

export default function scanner(fileData, classProps, action, styleStack = { Library: {}, Local: {}, Global: {} }) {
    Object.assign(StyleStack, styleStack);
    FileCursor.tagCount = 1, FileCursor.rowMarker = 1, FileCursor.columnMarker = 1, FileCursor.marker = 0;
    const stylesList = [], classesList = [];
    let ch = fileData.content[0], reading = true, scribed = "";

    while (FileCursor.marker < fileData.content.length) {
        if (ch === "\n") { FileCursor.rowMarker++; FileCursor.columnMarker = 0 }
        else FileCursor.columnMarker++;
        // console.log({ ch, cur: cursor.marker, row: cursor.rowMarker, col: cursor.columnMarker })

        if (ch === "<") {
            FileCursor.tagCount++;
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
            FileCursor.marker++;
            ch = fileData.content[FileCursor.marker];
            while (FileCursor.marker < fileData.content.length && (ch !== quote || fileData.content[FileCursor.marker - 1] === "\\")) {
                FileCursor.marker++;
                ch = fileData.content[FileCursor.marker];
            }
            FileCursor.marker++; // Skip the closing quote
        } else {
            scribed += ch;
            FileCursor.marker++
        }

        ch = fileData.content[FileCursor.marker]
    }

    return { scribed, classesList, stylesList }
}
