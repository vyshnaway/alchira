import read from "./0.block.js"
import U from "./Utils/index.js"

const stash = {};

function reader({ content, idFront, metaFront }) {
    const response = {};

    const extracts = read(content);
    for (const key in extracts.classes) {
        const modKey = key.slice(1)
        if (extracts.classes.hasOwnProperty(key)) {
            response[idFront + modKey] = {
                meta: metaFront + modKey,
                style: extracts.classes[key]
            };
        }
    }
    for (const key in extracts.rules) {
        const modKey = U.string.normalize(key)
        if (extracts.rules.hasOwnProperty(key)) {
            response[idFront + modKey] = {
                meta: metaFront + modKey,
                style: extracts.rules[key]
            };
        }
    }
    return response;
}

function savior(sources = []) {
    const styles = {}
    sources.forEach(source => {
        const result = reader(source);
        for (const key in result) {
            styles[key] = result[key]
        }
    })
    for(const key in styles) {
        stash[key] = styles[key]
    }
    return Object.keys(stash);
}

export default {
    reader,
    savior
}