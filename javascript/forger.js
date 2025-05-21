import Utils from "./Utils/index.js"
import { STASH } from "./craftsmen.js";

function styleSwitch(object) {
    const switched = Utils.object.switch(object);
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
    return Object.entries(styleSwitch(Object.entries(selectorIndexObject)
        .reduce((A, [S, I]) => { A[S] = STASH.Index2StylesObject[I].object; return A; }, {})))
}


function loadBindObjectsFromIndex(order) {
    return Object.entries(styleSwitch(order.reduce((A, I) => {
        if (STASH.LibraryStyle2Index[I])
            A[STASH.Index2StylesObject[STASH.LibraryStyle2Index[I]].selector] =
                STASH.Index2StylesObject[STASH.LibraryStyle2Index[I]].object;
        return A;
    }, {})))
}

function buildBinds(preBinds = new Set(), postBinds = new Set()) {
    let preLast = preBinds.size, postLast = postBinds.size;

    do {
        preBinds.forEach(element => {
            if (STASH.LibraryStyle2Index[element]) {
                STASH.Index2StylesObject[STASH.LibraryStyle2Index[element]]
                    .preBinds.forEach(E => { if (!preBinds.has(E)) preBinds.add(E) })
            }
        });
        postBinds.forEach(element => {
            if (STASH.LibraryStyle2Index[element]) {
                STASH.Index2StylesObject[STASH.LibraryStyle2Index[element]]
                    .postBinds.forEach(E => { if (!postBinds.has(E)) postBinds.add(E) })
            }
        });
    } while (!(preLast === preBinds.size) && (postLast === preBinds.size))

    preBinds.forEach(element => { if (postBinds.has(element)) preBinds.delete(element) })

    return {
        preBinds: loadBindObjectsFromIndex(Array.from(preBinds)),
        postBinds: loadBindObjectsFromIndex(Array.from(postBinds))
    }
}


export default {
    bindIndex: buildBinds,
    indexMaps: buildXtyles
}