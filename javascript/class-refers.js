import $ from "./Shell/index.js";
import STYLE from "./Style/parse.js";
import Utils from "./Utils/index.js";
import LibSetter from "./Worker/lib-setter.js";
import { STYLEIN } from "./data-cache.js";
import { NAV } from "./data-meta.js";

const files = {};

function _accumulator() {
    let length = 0;
    const index = { axiom: {}, library: {} }, referTable = {};

    Object.entries(files).forEach(([filePath, fileData]) => {
        const { level, axiom } = fileData;
        const group = axiom ? "axiom" : "library";
        referTable[filePath] = { group: group, id: level };

        if (!index[group][level]) index[group][level] = [];
        index[group][level].push(fileData);

        if (level > length) length = level;
    })

    const axiomsArray = Utils.array.formNumberedObject(index.axiom, length);
    const librariesArray = Utils.array.formNumberedObject(index.library, length);

    return { referTable, axiomsArray, librariesArray }
}

function _returnUsedIndexes(filePath) {
    STYLEIN.DISPOSE(...files[filePath].data.usedIndexes)
}



function DeleteFile(filePath) {
    if (files[filePath]) {
        _returnUsedIndexes(filePath);
        delete files[filePath];
    }

}

function ClearStash() {
    Object.keys(files).forEach(filePath => DeleteFile(filePath));
}



function UploadFiles(FileContents = {}) {
    ClearStash();

    Object.entries(FileContents).forEach(([filePath, fileContent]) => {
        SaveFile(filePath, fileContent);
    })

}

function SaveFile(filePath, fileContent) {
    if (files[filePath]) DeleteFile(filePath);
    files[filePath] = LibSetter("", "", filePath.slice(NAV.folder.refers.length+1), fileContent, true, true);
}



function Renders() {
    Object.keys(files).forEach(filePath => _returnUsedIndexes(filePath));

    let axiomCount = 0, libraryCount = 0;
    const consoleReport = [], axiomChart = [], libraryChart = [];
    const { referTable, axiomsArray, librariesArray } = _accumulator();
    const AxiomStyleMap = axiomsArray.reduce((collection, fileData, index) => {
        const classes = STYLE.CSSMULTI(fileData);
        collection[index] = classes.exclusiveStyles;
        axiomChart.push($.MOLD.secondary.Footer(`Level ${index}:  ${classes.exclusiveStyles.length} Styles`, classes.exclusiveStyles, $.list.secondary.Entries));
        axiomCount += classes.exclusiveStyles.length;
        return collection
    }, {});
    consoleReport.push($.MOLD.primary.Section("Axiom Index", [$.MOLD.std.Item(axiomCount + " Styles")]));
    consoleReport.push($.MOLD.success.Block(axiomChart));

    const LibraryStyleMap = librariesArray.reduce((id, referLevel, index) => {
        const classes = STYLE.CSSMULTI(referLevel)
        id[index] = classes.exclusiveStyles;
        libraryChart.push($.MOLD.secondary.Footer(`Level ${index}:  ${classes.exclusiveStyles.length} Styles`, classes.exclusiveStyles, $.list.secondary.Entries));
        libraryCount += classes.exclusiveStyles.length;
        return id;
    }, {});
    consoleReport.push($.MOLD.primary.Section("Library Index", [$.MOLD.std.Item(libraryCount + " Styles")]));
    consoleReport.push($.MOLD.success.Block(libraryChart));

    return { consoleReport, referTable, AxiomStyleMap, LibraryStyleMap }
}

export default {
    UploadFiles,
    DeleteFile,
    ClearStash,
    SaveFile,
    Renders
}