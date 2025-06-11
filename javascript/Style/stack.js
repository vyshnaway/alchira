import $ from "../Shell/index.js";
import STYLE from "./parse.js";
import Utils from "../Utils/index.js";
import LibSetter from "../Worker/lib-setter.js";
import { NAV } from "../data-meta.js";
import { STASH } from "../data-cache.js";

const LibraryFiles = {}, PortableFiles = {};

function DeleteLibraryFile(filePath) {
    if (LibraryFiles[filePath]) { STYLE.INDEX.DISPOSE(...LibraryFiles[filePath].data.usedIndexes); delete LibraryFiles[filePath]; }
}
function DeletePortableFile(filePath) {
    if (PortableFiles[filePath]) { STYLE.INDEX.DISPOSE(...PortableFiles[filePath].data.usedIndexes); delete PortableFiles[filePath]; }
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
    const dependsArray = [], portablesArray = [], portableTable = {};

    Object.entries(PortableFiles).forEach(([filePath, fileData]) => {
        const { group } = fileData;
        fileData["id"] = filePath;
        portableTable[filePath] = { group, filePath }
        if (group === "DEPENDS") dependsArray.push(fileData)
        else if (group === "PORTABLE") portablesArray.push(fileData)
    })

    return { portableTable, dependsArray, portablesArray }
}




let axiomCount = 0, clusterCount = 0, portableCount = 0, dependsCount = 0;
let axiomChart = {}, clusterChart = {}, portableChart = {}, dependsChart = {};

function Renders() {
    axiomCount = 0, clusterCount = 0, portableCount = 0, dependsCount = 0;
    axiomChart = {}, clusterChart = {}, portableChart = {}, dependsChart = {};
    Object.keys(LibraryFiles).forEach(filePath => STYLE.INDEX.DISPOSE(...LibraryFiles[filePath].data.usedIndexes));
    Object.keys(PortableFiles).forEach(filePath => STYLE.INDEX.DISPOSE(...PortableFiles[filePath].data.usedIndexes));

    const { libraryTable, axiomsArray, clustersArray } = _libraryAccumulator();
    const { portableTable, dependsArray, portablesArray } = _portableAccumulator();

    const DependsStyleMap = dependsArray.reduce((collection, fileData) => {
        const classes = STYLE.CSSLIBRARY([fileData], "DEPENDS", true);
        collection.push(...classes.exclusiveStyles);
        collection[fileData.id] = classes.exclusiveStyles;
        dependsChart[`Depends ${fileData.id}:  ${classes.exclusiveStyles.length} Styles`] = classes.exclusiveStyles;
        dependsCount += classes.exclusiveStyles.length;
        return collection
    }, []);

    // const AxiomStyleMap = axiomsArray.reduce((collection, fileData, index) => {
    //     const classes = STYLE.CSSLIBRARY(fileData, "AXIOM");
    //     collection[index] = classes.exclusiveStyles;
    //     axiomChart[`Level ${index}:  ${classes.exclusiveStyles.length} Styles`] = classes.exclusiveStyles;
    //     axiomCount += classes.exclusiveStyles.length;
    //     return collection
    // }, {});

    const AxiomStyleMap = axiomsArray.reduce((collection, fileData, index) => {
        const classes = STYLE.CSSLIBRARY(fileData, "AXIOM");
        collection[index] = classes.exclusiveStyles;
        axiomChart[`Level ${index}:  ${classes.exclusiveStyles.length} Styles`] = classes.exclusiveStyles;
        axiomCount += classes.exclusiveStyles.length;
        return collection
    }, {});

    const ClusterStyleMap = clustersArray.reduce((id, level, index) => {
        const classes = STYLE.CSSLIBRARY(level, "CLUSTER")
        id[index] = classes.exclusiveStyles;
        clusterChart[`Level ${index}:  ${classes.exclusiveStyles.length} Styles`] = classes.exclusiveStyles;
        clusterCount += classes.exclusiveStyles.length;
        return id;
    }, {});

    return { libraryTable, portableTable, AxiomStyleMap, ClusterStyleMap, DependsStyleMap }
}

function Report() {
    return [
        $.MOLD.primary.Section(`Axiom Styles: ${axiomCount}`,
            Object.entries(axiomChart).map(([heading, entries]) => $.MOLD.tertiary.Topic(heading, entries, $.list.text.Entries))
        ),
        $.MOLD.primary.Section(`Cluster Styles: ${clusterCount}`,
            Object.entries(clusterChart).map(([heading, entries]) => $.MOLD.tertiary.Topic(heading, entries, $.list.text.Entries))
        ),
        $.MOLD.primary.Section(`Depends Styles: ${dependsCount}`,
            Object.entries(dependsChart).map(([heading, entries]) => $.MOLD.tertiary.Topic(heading, entries, $.list.text.Entries))
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