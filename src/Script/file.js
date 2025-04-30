import tagReader from "./tag.js"
import { env } from "../executor.js";

function scanner(fileData, classProps, action) {
    env.tagCount = 0;
    const stylesList = [], classesList = [];
    let ch = fileData.content[0], marker = 0, reading = true, scribed = "";

    while (marker < fileData.content.length) {
        if (ch === "<") {
            const response = tagReader(fileData.content, marker, action, classProps, fileData);
            if (response.ok) {
                if (Object.keys(response.styleObject.styles).length > 0)
                    stylesList.push(response.styleObject)
                if (response.classList.length) classesList.push(response.classList)
            }
            scribed += response.content
            reading = response.reading
            marker = response.marker
        } else {
            scribed += ch;
            marker++;
        }
        ch = fileData.content[marker]
    }

    return { scribed, classesList, stylesList }
}

export default {
    read: (fileData, classProps) => scanner(fileData, classProps, "read"),
    dev: (fileData, classProps) => scanner(fileData, classProps, "dev"),
    preview: (fileData, classProps) => scanner(fileData, classProps, "preview"),
    build: (fileData, classProps) => scanner(fileData, classProps, "build"),
}