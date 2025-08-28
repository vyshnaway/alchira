import * as _Style from "../type/style.js";

import { CLASS as CACHE_DYNAMIC } from "./cache.js";
import USE from "../utils/main.js";

let NOW = 0;
const BIN = new Set<number>();

export function FETCH(index: number) {
    return CACHE_DYNAMIC.Index_ClassData[index];
}

export function FIND(classname: string, includeTargets = false, localmap: _Style.ClassIndexMap = {}) {
    let index = 0;
    let group: _Style.Group = '';

    if (CACHE_DYNAMIC.PackageClass_Index[classname]) {
        index = CACHE_DYNAMIC.PackageClass_Index[classname];
        group = "PACKAGE";
    } else if (CACHE_DYNAMIC.LibraryClass_Index[classname]) {
        index = CACHE_DYNAMIC.LibraryClass_Index[classname];
        group = "LIBRARY";
    } else if (CACHE_DYNAMIC.ArcbindClass_Index[classname]) {
        index = CACHE_DYNAMIC.ArcbindClass_Index[classname];
        group = "ARCBIND";
    } else if (includeTargets) {
        if (CACHE_DYNAMIC.ArchiveClass_Index[classname]) {
            index = CACHE_DYNAMIC.ArchiveClass_Index[classname];
            group = "ARCHIVE";
        } else if (CACHE_DYNAMIC.GlobalClass__Index[classname]) {
            index = CACHE_DYNAMIC.GlobalClass__Index[classname];
            group = "GLOBAL";
        } else if (CACHE_DYNAMIC.PublicClass__Index[classname]) {
            index = CACHE_DYNAMIC.PublicClass__Index[classname];
            group = "PUBLIC";
        }
    } else if (localmap[classname]) {
        index = localmap[classname];
        group = "LOCAL";
    }
    return { index, group };
}

export function DECLARE(object: _Style.Classdata) {
    object.index = BIN.values().next().value || ++NOW;
    if (BIN.has(object.index)) { BIN.delete(object.index); }

    const encounted = USE.string.enCounter(object.index + 768);
    object.watchclass = "____" + encounted;
    CACHE_DYNAMIC.Index_ClassData[object.index] = object;
    return { index: object.index, class: object.watchclass };
}

export function DISPOSE(...indexes: number[]) {
    indexes.forEach((index) => {
        if (index > 0) {
            BIN.add(index);
            delete CACHE_DYNAMIC.Index_ClassData[index.toString()];
        }
    });
}

export function RESET(after = 0) {
    after = after > 0 ? after : 0;
    let removed = 0;
    Object.keys(CACHE_DYNAMIC.Index_ClassData).forEach((index) => {
        const number = Number(index);
        if (number > after) {
            if (BIN.has(number)) { BIN.delete(number); }
            delete CACHE_DYNAMIC.Index_ClassData[number];
            removed++;
        }
    });
    NOW = after;
    return removed;
}