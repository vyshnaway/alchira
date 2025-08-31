import USE from "../utils/main.js";

import * as tStyle from "../type/style.js";

export default function previewOrganize(arrarr: number[][], merge = false): tStyle.SortedOutput {

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


    const shorted_arrarr = sorted_arrarr.reduce((acc: Record<string, number[][]>, arr) => {
        const superParent = merge ? USE.array.findArrSuperParent(arr, sorted_arrarr) : arr;
        const superParentString = JSON.stringify(superParent);
        if (acc[superParentString]) {
            acc[superParentString].push(arr);
        } else {
            acc[superParentString] = [arr];
        }
        return acc;
    }, {});

    const onlyParrentArrays = Object.keys(shorted_arrarr).map(i => JSON.parse(i) as number[]);

    let counted = 0;
    const referenceMap: Record<string, Record<number, number>> = {};
    Object.entries(shorted_arrarr).forEach(([key, arrarr]) => {
        const templateArray = JSON.parse(key) as number[];

        const indexMapFragment = templateArray.reduce((map, item) => {
            map[item] = ++counted;
            return map;
        }, {} as Record<number, number>);

        arrarr.forEach(arr => {
            referenceMap[JSON.stringify(arr)] = indexMapFragment;
        });

        return referenceMap;
    });


    return {
        counted,
        referenceMap,
        shortlistedArrays: onlyParrentArrays
    };
}
