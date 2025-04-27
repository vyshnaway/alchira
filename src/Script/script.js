import reader from "./tag.js"

export default function scan(content, extension, proxyLoad) {
    const classProp = ["jsx", "tsx", "js", "ts"].includes(extension) ? "className" : "class";

    const stylesList = [], classesList = [];
    let ch = content[0], marker = 0, reading = true, scribed = "";

    while (marker < content.length) {
        if (ch === "<") {
            const response = reader(content, marker, proxyLoad, classProp);
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
        ch = content[marker]
    }

    return { scribed, classesList, stylesList }
}

