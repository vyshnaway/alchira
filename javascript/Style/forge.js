import Use from "../Utils/index.js"
import { CACHE } from "../data-cache.js";

function styleSwitch(object) {
    const switched = Use.object.switch(object);
    const mins = [], maxs = [], flats = [];
    Object.keys(switched).forEach(key => {
        const min = key.indexOf("min"), max = key.indexOf("max");
        if (key !== "") {
            if (min < max) mins.push(key)
            if (min > max) maxs.push(key)
            if (min === max) flats.push(key)
        }
    })

    const keys = [
        ...flats.sort(),
        ...mins.sort().reverse(),
        ...maxs.sort()
    ]
    const result = switched[""] ?? {}
    keys.forEach(key => result[key] = switched[key])
    return result
}

function buildXtyles(selectorIndexObject) {
    return Object.entries(styleSwitch(
        Object.entries(selectorIndexObject).reduce((A, [selector, index]) => {
            A[selector] = CACHE.Index2StylesObject[index].object;
            return A;
        }, {})))
}


function loadBindObjectsFromIndex(order, useXelector = false, XelectorPrefix = "") {
    const indexes = []
    const result = Object.entries(styleSwitch(order.reduce((A, xId) => {
        if (CACHE.LibraryStyle2Index[xId]) {
            const selector = CACHE.Index2StylesObject[CACHE.LibraryStyle2Index[xId]].selector;
            const evaluated = useXelector ? (selector[0] === "@" ? selector : Use.string.normalize(xId, [], [], ["$"])) : selector;
            indexes.push(XelectorPrefix + Use.string.normalize(evaluated, ["$"], ["\\"]));
            A[(['@', '.'].includes(selector[0]) ? "" : ".") + evaluated]
                = CACHE.Index2StylesObject[CACHE.LibraryStyle2Index[xId]].object;
        }
        return A;
    }, {})))
    return { result, indexes }
}

function buildBinds(preBinds = new Set(), postBinds = new Set(), forPortable = false, XelectorPrefix = "") {
    let preLast = preBinds.size, postLast = postBinds.size;

    do {
        preBinds.forEach(element => {
            if (CACHE.LibraryStyle2Index[element]) {
                CACHE.Index2StylesObject[CACHE.LibraryStyle2Index[element]].preBinds.forEach(E => { if (!preBinds.has(E)) preBinds.add(E) })
            } else if (CACHE.PortableStyle2Index[element] && !forPortable) {
                CACHE.Index2StylesObject[CACHE.PortableStyle2Index[element]].preBinds.forEach(E => { if (!preBinds.has(E)) preBinds.add(E) })
            }
        });
        postBinds.forEach(element => {
            if (CACHE.LibraryStyle2Index[element]) {
                CACHE.Index2StylesObject[CACHE.LibraryStyle2Index[element]].postBinds.forEach(E => { if (!postBinds.has(E)) postBinds.add(E) })
            } else if (CACHE.PortableStyle2Index[element] && !forPortable) {
                CACHE.Index2StylesObject[CACHE.PortableStyle2Index[element]].postBinds.forEach(E => { if (!postBinds.has(E)) postBinds.add(E) })
            }
        });
    } while (!(preLast === preBinds.size) && (postLast === preBinds.size))

    preBinds.forEach(element => { if (postBinds.has(element)) preBinds.delete(element) })

    const preBindsCollected = loadBindObjectsFromIndex(Array.from(preBinds), forPortable, XelectorPrefix);
    const postBindsCollected = loadBindObjectsFromIndex(Array.from(postBinds), forPortable, XelectorPrefix);
    return {
        preBindsList: preBindsCollected.indexes,
        postBindsList: postBindsCollected.indexes,
        preBindsObject: preBindsCollected.result,
        postBindsObject: postBindsCollected.result,
    }
}


export default {
    bindIndex: buildBinds,
    indexMaps: buildXtyles
}