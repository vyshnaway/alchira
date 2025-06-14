import PARSE from "./parse.js";

import $ from "../Shell/index.js";
import Use from "../Utils/index.js";
import FILING from "../data-filing.js";
import SCRIPTFILE from "../Script/file.js";
import { NAV, CACHE, STACK } from "../data-cache.js";

function DeleteLibraryFile(filePath) {
    if (STACK.LIBRARIES[filePath]) { PARSE.INDEX.DISPOSE(...STACK.LIBRARIES[filePath].usedIndexes); delete STACK.LIBRARIES[filePath]; }
}
function DeletePortableFile(filePath) {
    if (STACK.PORTABLES[filePath]) { PARSE.INDEX.DISPOSE(...STACK.PORTABLES[filePath].usedIndexes); delete STACK.PORTABLES[filePath]; }
}
function ClearStash() {
    Object.keys(STACK.LIBRARIES).forEach(filePath => DeleteLibraryFile(filePath));
    Object.keys(STACK.PORTABLES).forEach(filePath => DeleteLibraryFile(filePath));
}


function SaveLibraryFile(filePath, fileContent) {
    if (STACK.LIBRARIES[filePath])
        DeleteLibraryFile(filePath);
    STACK.LIBRARIES[filePath] = FILING("", "", filePath.slice(NAV.folder.library.length + 1), fileContent, true, false);
}
function SavePortableFile(filePath, fileContent) {
    if (STACK.PORTABLES[filePath]) DeletePortableFile(filePath);
    STACK.PORTABLES[filePath] = FILING("", "", filePath.slice(NAV.folder.portables.length + 1), fileContent, true, true);
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
    Object.entries(STACK.LIBRARIES).forEach(([filePath, fileData]) => {
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
    const axiomsArray = Use.array.fromNumberedObject(axiom, length);
    const clustersArray = Use.array.fromNumberedObject(cluster, length);
    return { libraryTable, axiomsArray, clustersArray }
}

function _portableAccumulator() {
    const bindingArray = [], portablesArray = [], modulesTable = {};

    Object.entries(STACK.PORTABLES).forEach(([filePath, fileData]) => {
        fileData.id = filePath;
        const { id, group } = fileData;
        modulesTable[filePath] = { group, id }
        if (group === "binding") bindingArray.push(fileData)
        else if (group === "portable") portablesArray.push(fileData)
    })

    return { modulesTable, bindingArray, portablesArray }
}

function _createPortableBundle() {
    const SaveFiles = {};

    Object.values(STACK.PORTABLES).forEach(file => {
        const fileName = `${file.fileName}.${file.extension}`;
        if (!SaveFiles[fileName]) SaveFiles[fileName] = file.content;
        else SaveFiles[fileName] += "\n\n" + file.content
    })

    return SaveFiles;
}


let axiomCount = 0, clusterCount = 0, portableCount = 0, bindingCount = 0;
let axiomChart = {}, clusterChart = {}, portableChart = {}, bindingChart = {};
let report = "", warnings = [], bundle = {};

function Renders() {
    warnings = [];
    axiomCount = 0, clusterCount = 0, portableCount = 0, bindingCount = 0;
    axiomChart = {}, clusterChart = {}, portableChart = {}, bindingChart = {};
    Object.keys(STACK.LIBRARIES).forEach(filePath => PARSE.INDEX.DISPOSE(...STACK.LIBRARIES[filePath].usedIndexes));
    Object.keys(STACK.PORTABLES).forEach(filePath => PARSE.INDEX.DISPOSE(...STACK.PORTABLES[filePath].usedIndexes));

    const { libraryTable, axiomsArray, clustersArray } = _libraryAccumulator();
    const { modulesTable, bindingArray, portablesArray } = _portableAccumulator();

    bundle = _createPortableBundle(bindingArray, portablesArray)

    const ModuleEssentials = [], PortableStyleMap = {};
    portablesArray.forEach((fileData) => {
        const filePath = NAV.folder.portables + "/" + fileData.filePath;
        const tagStash = SCRIPTFILE(fileData).stylesList, exclusiveStyles = [];
        fileData.usedIndexes = new Set();

        tagStash.forEach(style => {
            style.scope = "";
            style.selector = style.selector === "" ? "" : fileData.stamp + style.selector;
            const response = PARSE.TAGSTYLE(style, fileData.metaFront, fileData.filePath, fileData.targetPath, CACHE.PortableStyle2Index);
            warnings.push(...response.errors);

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
        const result = PARSE.CSSLIBRARY([fileData], "BINDING", true);
        collection[NAV.folder.portables + "/" + fileData.filePath] = result.exclusiveStyles;
        if (result.exclusiveStyles.length)
            bindingChart[`Binding [${fileData.filePath}]: ${result.exclusiveStyles.length} Classes`] = result.exclusiveStyles;
        bindingCount += result.exclusiveStyles.length;
        return collection
    }, {});



    const AxiomStyleMap = axiomsArray.reduce((collection, fileData, index) => {
        const result = PARSE.CSSLIBRARY(fileData, "AXIOM");
        collection[index] = result.exclusiveStyles;
        if (result.exclusiveStyles.length)
            axiomChart[`Level ${index}:  ${result.exclusiveStyles.length} Classes`] = result.exclusiveStyles;
        axiomCount += result.exclusiveStyles.length;
        return collection
    }, {});

    const ClusterStyleMap = clustersArray.reduce((collection, level, index) => {
        const result = PARSE.CSSLIBRARY(level, "CLUSTER")
        collection[index] = result.exclusiveStyles;
        if (result.exclusiveStyles.length)
            clusterChart[`Level ${index}:  ${result.exclusiveStyles.length} Classes`] = result.exclusiveStyles;
        clusterCount += result.exclusiveStyles.length;
        return collection;
    }, {});


    Object.values(CACHE.PortableStyle2Index).forEach(index => {
        const InStash = CACHE.Index2StylesObject[index];
        if (InStash.declarations.length > 1)
            warnings.push($.MOLD.warning.List("Multiple portable declarations: " + InStash.selector, InStash.declarations, $.list.text.Bullets))
    })

    Object.values(CACHE.LibraryStyle2Index).forEach(index => {
        const InStash = CACHE.Index2StylesObject[index];
        if (InStash.declarations.length > 1)
            warnings.push($.MOLD.warning.List("Multiple Library declarations: " + InStash.selector, InStash.declarations, $.list.text.Bullets))
    })

    report = [
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
    return {
        bundle,
        report,
        warnings,
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