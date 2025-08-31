import * as _Style from "../type/style.js";

import * as CACHE from "./cache.js";

let NOW = 0;
const BIN = new Set<number>();

export function FETCH(index: number) {
    return CACHE.CLASS.Index_to_Data[index];
}

export function FIND(classname: string, includeArtifacts = false, localmap: _Style.ClassIndexMap = {}) {
    let index = 0;
    let group: _Style._Type = _Style._Type.NULL;

    if (localmap[classname]) {
        index = localmap[classname];
        group = _Style._Type.LOCAL;
    } else if (CACHE.CLASS.External_Index[classname]) {
        index = CACHE.CLASS.External_Index[classname];
        group = _Style._Type.EXTERNAL;
    } else if (CACHE.CLASS.Library__Index[classname]) {
        index = CACHE.CLASS.Library__Index[classname];
        group = _Style._Type.LIBRARY;
    } else if (CACHE.CLASS.Arattach_Index[classname]) {
        index = CACHE.CLASS.Arattach_Index[classname];
        group = _Style._Type.ARTATTACH;
    } else if (includeArtifacts) {
        if (CACHE.CLASS.Artifact_Index[classname]) {
            index = CACHE.CLASS.Artifact_Index[classname];
            group = _Style._Type.ARTIFACT;
        } else if (CACHE.CLASS.Global___Index[classname]) {
            index = CACHE.CLASS.Global___Index[classname];
            group = _Style._Type.GLOBAL;
        } else if (CACHE.CLASS.Public___Index[classname]) {
            index = CACHE.CLASS.Public___Index[classname];
            group = _Style._Type.PUBLIC;
        }
    }

    return { index, group };
}

export function DECLARE(object: _Style.Classdata) {
    object.index = BIN.values().next().value || ++NOW;
    if (BIN.has(object.index)) { BIN.delete(object.index); }
    CACHE.CLASS.Index_to_Data[object.index] = object;
    return object.index;
}

export function DISPOSE(...indexes: number[]) {
    indexes.forEach((index) => {
        if (index > 0) {
            BIN.add(index);
            delete CACHE.CLASS.Index_to_Data[index.toString()];
        }
    });
}

export function RESET(after = 0) {
    after = after > 0 ? after : 0;
    let removed = 0;
    Object.keys(CACHE.CLASS.Index_to_Data).forEach((index) => {
        const number = Number(index);
        if (number > after) {
            if (BIN.has(number)) { BIN.delete(number); }
            delete CACHE.CLASS.Index_to_Data[number];
            removed++;
        }
    });
    NOW = after;
    return removed;
}