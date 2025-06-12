import $ from "../Shell/index.js";
import STYLE from "./parse.js";
import Utils from "../Utils/index.js";
import LibSetter from "../Worker/lib-setter.js";
import { NAV } from "../data-meta.js";
import PortFile from "../Script/file.js";
import { STASH } from "../data-cache.js";

const LibraryFiles = {}, PortableFiles = {};

function DeleteLibraryFile(filePath) {
    if (LibraryFiles[filePath]) { STYLE.INDEX.DISPOSE(...LibraryFiles[filePath].usedIndexes); delete LibraryFiles[filePath]; }
}
function DeletePortableFile(filePath) {
    if (PortableFiles[filePath]) { STYLE.INDEX.DISPOSE(...PortableFiles[filePath].usedIndexes); delete PortableFiles[filePath]; }
}
function ClearStash() {
    Object.keys(LibraryFiles).forEach(filePath => DeleteLibraryFile(filePath));
    Object.keys(PortableFiles).forEach(filePath => DeleteLibraryFile(filePath));
}


function SaveLibraryFile(filePath, fileContent) {
    if (LibraryFiles[filePath]) DeleteLibraryFile(filePath);
    LibraryFiles[filePath] = LibSetter("", "", filePath.slice(NAV.folder.library.length + 1), fileContent, true, true, false);
}
function SavePortableFile(filePath, fileContent) {
    if (PortableFiles[filePath]) DeletePortableFile(filePath);
    PortableFiles[filePath] = LibSetter("", "", filePath.slice(NAV.folder.portables.length + 1), fileContent, true, true, true);
}
function UploadFiles(Library = {}, Portable = {}) {
    ClearStash();
    Object.entries(Library).forEach(([filePath, fileContent]) => SaveLibraryFile(filePath, fileContent))
    Object.entries(Portable).forEach(([filePath, fileContent]) => SavePortableFile(filePath, fileContent))
}


function _libraryAccumulator() {
    let length = 0;
    const index = { AXIOM: {}, CLUSTER: {} }, libraryTable = {};
    Object.entries(LibraryFiles).forEach(([filePath, fileData]) => {
        const { id, group } = fileData;
        libraryTable[filePath] = { group, id: id };

        if (id > length) length = id;
        if (!index[group][id]) index[group][id] = [];

        index[group][id].push(fileData);
    })
    const axiomsArray = Utils.array.fromNumberedObject(index.AXIOM, length);
    const clustersArray = Utils.array.fromNumberedObject(index.CLUSTER, length);
    return { libraryTable, axiomsArray, clustersArray }
}

function _portableAccumulator() {
    const bindingArray = [], portablesArray = [], portableTable = {};
    Object.entries(PortableFiles).forEach(([filePath, fileData]) => {
        const group = fileData;
        fileData.id = filePath;
        portableTable[filePath] = { group, filePath }
        if (group === "BINDING") bindingArray.push(fileData)
        else if (group === "PORTABLE") portablesArray.push(fileData)
    })

    return { portableTable, bindingArray, portablesArray }
}




let axiomCount = 0, clusterCount = 0, portableCount = 0, bindingCount = 0;
let axiomChart = {}, clusterChart = {}, portableChart = {}, bindingChart = {};

function Renders() {
    axiomCount = 0, clusterCount = 0, portableCount = 0, bindingCount = 0;
    axiomChart = {}, clusterChart = {}, portableChart = {}, bindingChart = {};
    Object.keys(LibraryFiles).forEach(filePath => STYLE.INDEX.DISPOSE(...LibraryFiles[filePath].usedIndexes));
    Object.keys(PortableFiles).forEach(filePath => STYLE.INDEX.DISPOSE(...PortableFiles[filePath].usedIndexes));

    const { libraryTable, axiomsArray, clustersArray } = _libraryAccumulator();
    const { portableTable, bindingArray, portablesArray } = _portableAccumulator();

    const BindingStyleMap = bindingArray.reduce((collection, fileData) => {
        const classes = STYLE.CSSLIBRARY([fileData], "BINDING", true);
        collection[NAV.folder.portables + "/" + fileData.filePath] = classes.exclusiveStyles;
        if (classes.exclusiveStyles.length)
            bindingChart[`Binding [${fileData.fileName}]:  ${classes.exclusiveStyles.length} Classes`] = classes.exclusiveStyles;
        bindingCount += classes.exclusiveStyles.length;
        return collection
    }, {});

    const portableEssentials = []
    const PortableStyleMap = portablesArray.reduce((collection, fileData) => {
        const stylesStash = PortFile(fileData).stylesList, exclusiveStyles = [];
        fileData.usedIndexes = new Set();

        stylesStash.forEach(style => {
            const response = STYLE.TAGSTYLE(style, fileData.metaFront, fileData.filePath, true);
            fileData.usedIndexes.add(response.index)

            if (response.essentials.length) {
                portableEssentials.push(...response.essentials)
            }else{
                fileData.usedIndexes.add(response.index);
                STASH.portableStyle2Index[fileData.stamp + style.selector] = response.index;
                portableCount++;
            }
        });
        collection[NAV.folder.portables + "/" + fileData.filePath] = exclusiveStyles;
        if (exclusiveStyles.length)
            portableChart[`Portable [${fileData.filePath}]:  ${exclusiveStyles.length} Classes`] = exclusiveStyles;
        return collection;
    }, {});

    const AxiomStyleMap = axiomsArray.reduce((collection, fileData, index) => {
        const classes = STYLE.CSSLIBRARY(fileData, "AXIOM");
        collection[index] = classes.exclusiveStyles;
        if (classes.exclusiveStyles.length)
            axiomChart[`Level ${index}:  ${classes.exclusiveStyles.length} Classes`] = classes.exclusiveStyles;
        axiomCount += classes.exclusiveStyles.length;
        return collection
    }, {});

    const ClusterStyleMap = clustersArray.reduce((collection, level, index) => {
        const classes = STYLE.CSSLIBRARY(level, "CLUSTER")
        collection[index] = classes.exclusiveStyles;
        if (classes.exclusiveStyles.length)
            clusterChart[`Level ${index}:  ${classes.exclusiveStyles.length} Classes`] = classes.exclusiveStyles;
        clusterCount += classes.exclusiveStyles.length;
        return collection;
    }, {});

    return { libraryTable, portableTable, portableEssentials, AxiomStyleMap, ClusterStyleMap, BindingStyleMap, PortableStyleMap }
}

function Report() {
    return [
        $.MOLD.primary.Section(`Axiom Styles: ${axiomCount}`,
            Object.entries(axiomChart).map(([heading, entries]) => $.MOLD.tertiary.Topic(heading, entries, $.list.text.Entries))
        ),
        $.MOLD.primary.Section(`Cluster Styles: ${clusterCount}`,
            Object.entries(clusterChart).map(([heading, entries]) => $.MOLD.tertiary.Topic(heading, entries, $.list.text.Entries))
        ),
        $.MOLD.primary.Section(`Binding Styles: ${bindingCount}`,
            Object.entries(bindingChart).map(([heading, entries]) => $.MOLD.tertiary.Topic(heading, entries, $.list.text.Entries))
        ),
        $.MOLD.primary.Section(`Portable Styles: ${portableCount}`,
            Object.entries(portableChart).map(([heading, entries]) => $.MOLD.tertiary.Topic(heading, entries, $.list.text.Entries))
        ),
    ].join("");
}

export default {
    UploadFiles,
    DeleteFile: DeleteLibraryFile,
    ClearStash,
    SaveFile: SaveLibraryFile,
    Renders,
    Report
}