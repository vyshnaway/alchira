
const pathto = {
    source: "",
    target: "",
    path: "",
    setup: "",
    cache: "",
    swapMap: "",
    classList: "",
    shortHands: "",
    configuration: "",
    vendorPrefixes: "",
    BUILD: (path) => {
        pathto.path = path;
        pathto.setup = `${pathto.path}/xtyle`;
        pathto.cache = `${pathto.setup}/.cache`;
        pathto.swapMap = `${pathto.cache}/swap-map.json`;
        pathto.classList = `${pathto.cache}/class-list.json`;
        pathto.shortHands = `${pathto.setup}/directory-map.jsonc`;
        pathto.configuration = `${pathto.setup}/directory-map.jsonc`;
        pathto.vendorPrefixes = `${pathto.setup}/vendor-prefixes.jsonc`;
        return pathto
    }
};

export default pathto

export let classCounter = 0;
export let scriptText = '';
export let currentFile = '';
export let currentCrumb = '';
export let shortHands = {};
export let classTable = {};
export let styleBlocks = {};

// {
//     scope: {
//         index: {
//             xtyle: 0;
//         }
//         composedName: {
//             xtyle: '',
//         },
//         styleGroup: {
//             xtyle: [],
//         }
//         files: {
//             xtyle: [],
//         },
//         split: true,
// }