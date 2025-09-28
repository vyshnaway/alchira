import * as _Style from "../type/style.js";

import Use from "../utils/main.js";

export default function previewOrganize(arrarr: number[][], merge = true): _Style.SortedOutput {

    let maxLen = 0;

    const lenmap_arrarr = arrarr.reduce((acc: Record<number, number[][]>, arr) => {
        if (acc[arr.length]) {
            acc[arr.length].push(arr);
        } else {
            acc[arr.length] = [arr];
        }
        if (maxLen < arr.length) {
            maxLen = arr.length;
        }
        return acc;
    }, {});


    const sorted_arrarr = (() => {
        const sorted = [];
        do {
            if (lenmap_arrarr[maxLen]) {
                sorted.push(...lenmap_arrarr[maxLen]);
            }
        } while (maxLen--);
        return sorted;
    })();

    const shortlisted_arrays = sorted_arrarr.reduce((acc: Record<string, number[][]>, arr) => {
        const superParent = merge ? Use.array.findArrSuperParent(arr, sorted_arrarr) : arr;
        const superParentString = JSON.stringify(superParent);
        if (acc[superParentString]) {
            acc[superParentString].push(arr);
        } else {
            acc[superParentString] = [arr];
        }
        return acc;
    }, {});



    let counted = 0;
    const recompClasslist: [number, number][] = [];

    const referenceMap = Object.entries(shortlisted_arrays).reduce((acc, [key, arrarr]) => {
        const templateArray = JSON.parse(key) as number[];

        const indexMapFragment = templateArray.reduce((map, item) => {
            map[item] = ++counted;
            recompClasslist.push([item, counted]);
            return map;
        }, {} as Record<number, number>);

        arrarr.forEach(arr => { acc[JSON.stringify(arr)] = indexMapFragment; });
        return acc;
    }, {} as Record<string, Record<number, number>>);


    return {
        counted,
        referenceMap,
        recompClasslist
    };
}
