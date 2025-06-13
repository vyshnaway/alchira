import $ from "../Shell/index.js";
import STYLE from "./parse.js";
import Utils from "../Utils/index.js";
import LibSetter from "../Worker/lib-setter.js";
import { NAV } from "../data-meta.js";
import PortFile from "../Script/file.js";
import { STASH } from "../data-cache.js";

const LibraryFiles = {}, ModuleFiles = {};

function DeleteLibraryFile(filePath) {
    if (LibraryFiles[filePath]) { STYLE.INDEX.DISPOSE(...LibraryFiles[filePath].usedIndexes); delete LibraryFiles[filePath]; }
}
function DeletePortableFile(filePath) {
    if (ModuleFiles[filePath]) { STYLE.INDEX.DISPOSE(...ModuleFiles[filePath].usedIndexes); delete ModuleFiles[filePath]; }
}
function ClearStash() {
    Object.keys(LibraryFiles).forEach(filePath => DeleteLibraryFile(filePath));
    Object.keys(ModuleFiles).forEach(filePath => DeleteLibraryFile(filePath));
}


function SaveLibraryFile(filePath, fileContent) {
    if (LibraryFiles[filePath])
        DeleteLibraryFile(filePath);
    LibraryFiles[filePath] = LibSetter("", "", filePath.slice(NAV.folder.library.length + 1), fileContent, true, false);
}
function SavePortableFile(filePath, fileContent) {
    if (ModuleFiles[filePath]) DeletePortableFile(filePath);
    ModuleFiles[filePath] = LibSetter("", "", filePath.slice(NAV.folder.portables.length + 1), fileContent, true, true);
}
function UploadFiles(Library = {}, Portable = {}) {
    ClearStash();
    Object.entries(Library).forEach(([filePath, fileContent]) => {
        SaveLibraryFile(filePath, fileContent)
    })
    Object.entries(Portable).forEach(([filePath, fileContent]) => {
        SavePortableFile(filePath, fileContent)
    })
}


function _libraryAccumulator() {
    let length = 0;
    const axiom = {}, cluster = {}, libraryTable = {};
    Object.entries(LibraryFiles).forEach(([filePath, fileData]) => {
        const { id, group } = fileData;
        libraryTable[filePath] = { group, id };
        if (group === "axiom") {
            if (!axiom[id]) axiom[id] = [];
            axiom[id].push(fileData);
        }
        else if (group === "cluster") {
            if (!cluster[id]) cluster[id] = [];
            cluster[id].push(fileData);
        }
        if (id > length) length = id;

    })
    const axiomsArray = Utils.array.fromNumberedObject(axiom, length);
    const clustersArray = Utils.array.fromNumberedObject(cluster, length);
    return { libraryTable, axiomsArray, clustersArray }
}

function _portableAccumulator() {
    const bindingArray = [], portablesArray = [], modulesTable = {};

    Object.entries(ModuleFiles).forEach(([filePath, fileData]) => {
        fileData.id = filePath;
        const { id, group } = fileData;
        modulesTable[filePath] = { group, id }
        if (group === "binding") bindingArray.push(fileData)
        else if (group === "portable") portablesArray.push(fileData)
    })

    return { modulesTable, bindingArray, portablesArray }
}




let axiomCount = 0, clusterCount = 0, portableCount = 0, bindingCount = 0;
let axiomChart = {}, clusterChart = {}, portableChart = {}, bindingChart = {};
let portableShorthandErrors = [];

function Renders() {
    portableShorthandErrors = [];
    axiomCount = 0, clusterCount = 0, portableCount = 0, bindingCount = 0;
    axiomChart = {}, clusterChart = {}, portableChart = {}, bindingChart = {};
    Object.keys(LibraryFiles).forEach(filePath => STYLE.INDEX.DISPOSE(...LibraryFiles[filePath].usedIndexes));
    Object.keys(ModuleFiles).forEach(filePath => STYLE.INDEX.DISPOSE(...ModuleFiles[filePath].usedIndexes));

    const { libraryTable, axiomsArray, clustersArray } = _libraryAccumulator();
    const { modulesTable, bindingArray, portablesArray } = _portableAccumulator();

    const ModuleEssentials = [], PortableStyleMap = {};
    portablesArray.forEach((fileData) => {
        const filePath = NAV.folder.portables + "/" + fileData.filePath;
        const tagStash = PortFile(fileData).stylesList, exclusiveStyles = [];
        fileData.usedIndexes = new Set();

        tagStash.forEach(style => {
            style.scope = "";
            style.selector = style.selector === "" ? "" : fileData.stamp + style.selector;
            const response = STYLE.TAGSTYLE(style, fileData.metaFront, fileData.filePath, fileData.targetPath, STASH.PortableStyle2Index);
            portableShorthandErrors.push(...response.errors);

            if (style.selector === "") {
                ModuleEssentials.push(...response.essentials)
            } else if (!response.isDuplicate) {
                fileData.usedIndexes.add(response.index);
                exclusiveStyles.push(style.selector)
                portableCount++;
            }
        });
        PortableStyleMap[filePath] = exclusiveStyles;
        if (exclusiveStyles.length)
            portableChart[`Portable [${fileData.filePath}]:  ${exclusiveStyles.length} Classes`] = exclusiveStyles;
    });

    const BindingStyleMap = bindingArray.reduce((collection, fileData) => {
        const result = STYLE.CSSLIBRARY([fileData], "BINDING", true);
        collection[NAV.folder.portables + "/" + fileData.filePath] = result.exclusiveStyles;
        if (result.exclusiveStyles.length)
            bindingChart[`Binding [${fileData.filePath}]: ${result.exclusiveStyles.length} Classes`] = result.exclusiveStyles;
        bindingCount += result.exclusiveStyles.length;
        return collection
    }, {});


    const AxiomStyleMap = axiomsArray.reduce((collection, fileData, index) => {
        const result = STYLE.CSSLIBRARY(fileData, "AXIOM");
        collection[index] = result.exclusiveStyles;
        if (result.exclusiveStyles.length)
            axiomChart[`Level ${index}:  ${result.exclusiveStyles.length} Classes`] = result.exclusiveStyles;
        axiomCount += result.exclusiveStyles.length;
        return collection
    }, {});

    const ClusterStyleMap = clustersArray.reduce((collection, level, index) => {
        const result = STYLE.CSSLIBRARY(level, "CLUSTER")
        collection[index] = result.exclusiveStyles;
        if (result.exclusiveStyles.length)
            clusterChart[`Level ${index}:  ${result.exclusiveStyles.length} Classes`] = result.exclusiveStyles;
        clusterCount += result.exclusiveStyles.length;
        return collection;
    }, {});

    return {
        libraryTable,
        modulesTable,
        ModuleEssentials,
        AxiomStyleMap,
        ClusterStyleMap,
        BindingStyleMap,
        PortableStyleMap
    }
}

function Report() {
    const errors = [...portableShorthandErrors]

    Object.values(STASH.PortableStyle2Index).forEach(index => {
        const InStash = STASH.Index2StylesObject[index];
        if (InStash.declarations.length > 1)
            errors.push($.MOLD.warning.List("Multiple portable declarations: " + InStash.selector, InStash.declarations, $.list.text.Bullets))
    })
    Object.values(STASH.LibraryStyle2Index).forEach(index => {
        const InStash = STASH.Index2StylesObject[index];
        if (InStash.declarations.length > 1)
            errors.push($.MOLD.warning.List("Multiple Library declarations: " + InStash.selector, InStash.declarations, $.list.text.Bullets))
    })

    return {
        warnings: errors,
        report: [
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
        ].join("")
    };
}

export default {
    DeletePortableFile,
    DeleteLibraryFile,
    SavePortableFile,
    SaveLibraryFile,
    UploadFiles,
    ClearStash,
    Renders,
    Report
}