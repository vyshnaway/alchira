import USE from "../utils/main.js";

import * as TYPE from "../types.js";

export default function previewOrganize(arrarr: number[][], merge = false): TYPE.OrganizedResult {

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

    const counter_zero = 768;
    let counter = counter_zero;
    const indexMap: Record<string, number> = {};
    const referenceMap = Object.entries(shorted_arrarr).reduce((acc, [key, arrarr]) => {
        const templateArray = JSON.parse(key) as number[];

        const indexMapFragment = templateArray.reduce((map, item) => {
            map[item] = '_' + USE.string.enCounter(counter++);
            indexMap[map[item]] = Number(item);
            return map;
        }, {} as Record<number, string>);

        arrarr.forEach(arr => {
            acc[JSON.stringify(arr)] = indexMapFragment;
        });

        return acc;
    }, {} as Record<string, Record<number, string>>);


    return {
        referenceMap,
        indexMap,
        classcount: counter - counter_zero,
        shortlistedArrays: onlyParrentArrays
    };
}
