import { classTable, currentFile } from "../../../.dump/src.js/0.env.js";

function setback(array) {
    const lastSeen = new Map();
    for (let i = 0; i < array.length; i++) {
        lastSeen.set(array[i], i);
    }
    return array.filter((item, index) => lastSeen.get(item) === index);
}

export default function extractClassList(array, incCompStyles = true) {
    const currentScope = classTable[currentFile]?.styleGroup ?? {};
    const fallbackScope = classTable[defaultScope]?.styleGroup ?? {};

    const expandedArray = setback(array).flatMap(xtyle => {
        if ((xtyle.startsWith('$') && incCompStyles)) {
            const xtylex = xtyle.endsWith('+') ? xtyle.slice(0, -1) : xtyle;
            return currentScope[xtylex] ?? fallbackScope[xtylex] ?? [xtylex];
        }
        return xtyle;
    });

    return setback(expandedArray)
}

// console.time('1')
// console.log(extractClassList(['d', '+gc', 'd', 'a', 's', 'a']))
// console.timeEnd('1')
