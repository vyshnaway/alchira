import $ from "./Shell/index.js";
import STYLE from "./Style/parse.js";
import Utils from "./Utils/index.js";
import LibSetter from "./Worker/lib-setter.js";
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
    STYLE.INDEX.DISPOSE(...files[filePath].data.usedIndexes)
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
    files[filePath] = LibSetter("", "", filePath.slice(NAV.folder.refers.length + 1), fileContent, true, true);
}

let axiomCount = 0, libraryCount = 0, axiomChart = {}, libraryChart = {};

function Renders() {
    axiomCount = 0, libraryCount = 0, axiomChart = {}, libraryChart = {};
    Object.keys(files).forEach(filePath => _returnUsedIndexes(filePath));

    const { referTable, axiomsArray, librariesArray } = _accumulator();
    const AxiomStyleMap = axiomsArray.reduce((collection, fileData, index) => {
        const classes = STYLE.CSSMULTI(fileData);
        collection[index] = classes.exclusiveStyles;
        axiomChart[`Level ${index}:  ${classes.exclusiveStyles.length} Styles`] = classes.exclusiveStyles;
        axiomCount += classes.exclusiveStyles.length;
        return collection
    }, {});

    const LibraryStyleMap = librariesArray.reduce((id, referLevel, index) => {
        const classes = STYLE.CSSMULTI(referLevel)
        id[index] = classes.exclusiveStyles;
        libraryChart[`Level ${index}:  ${classes.exclusiveStyles.length} Styles`] = classes.exclusiveStyles;
        libraryCount += classes.exclusiveStyles.length;
        return id;
    }, {});

    return { referTable, AxiomStyleMap, LibraryStyleMap }
}

function Report() {
    return [
        $.MOLD.primary.Section(`Axiom Styles: ${axiomCount}`, Object.entries(axiomChart).map(([heading, entries]) =>
            $.MOLD.tertiary.Topic(heading, entries, $.list.text.Entries))),
        $.MOLD.primary.Section(`Library Styles: ${libraryCount}`, Object.entries(libraryChart).map(([heading, entries]) => 
            $.MOLD.tertiary.Topic(heading, entries, $.list.text.Entries)))
    ].join("");
}

export default {
    UploadFiles,
    DeleteFile,
    ClearStash,
    SaveFile,
    Renders,
    Report
}