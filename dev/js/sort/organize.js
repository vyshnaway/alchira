import Use from "../utils/main.js";
export default function previewOrganize(arrarr, merge = true) {
    let maxLen = 0;
    const lenmap_arrarr = arrarr.reduce((acc, arr) => {
        if (acc[arr.length]) {
            acc[arr.length].push(arr);
        }
        else {
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
    const shortlisted_arrays = sorted_arrarr.reduce((acc, arr) => {
        const superParent = merge ? Use.array.findArrSuperParent(arr, sorted_arrarr) : arr;
        const superParentString = JSON.stringify(superParent);
        if (acc[superParentString]) {
            acc[superParentString].push(arr);
        }
        else {
            acc[superParentString] = [arr];
        }
        return acc;
    }, {});
    let counted = 0;
    const recompClasslist = [];
    const referenceMap = Object.entries(shortlisted_arrays).reduce((acc, [key, arrarr]) => {
        const templateArray = JSON.parse(key);
        const indexMapFragment = templateArray.reduce((map, item) => {
            map[item] = ++counted;
            recompClasslist.push([item, counted]);
            return map;
        }, {});
        arrarr.forEach(arr => { acc[JSON.stringify(arr)] = indexMapFragment; });
        return acc;
    }, {});
    return {
        counted,
        referenceMap,
        recompClasslist
    };
}
//# sourceMappingURL=organize.js.map