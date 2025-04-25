import reader from "./tag.js"

export default function scan(content, extension, proxyLoad) {
    const classProp = ["jsx", "tsx", "js", "ts"].includes(extension) ? "className" : "class";

    const stylesList = [], classesList = [];
    let ch = content[0], marker = 0, reading = true, scribed = "";


    while (marker < content.length) {
        if (ch === "<") {
            const response = reader(content, marker, proxyLoad, classProp);
            // console.log(response)
            if (response.ok) {
                stylesList.push(response.styleObject)
                classesList.push(response.styleObject)
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

    console.log(scribed)

    return { scribed, classesList, stylesList }
}
