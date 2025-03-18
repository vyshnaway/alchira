import {
    writeToFile,
    getAllFiles,
    parseListFile,
    mergeFiles,
    clearDirectory,
    jsonFilesToObjects,
    runLoadSetup,
    runInitialize,
    runDeveloper,
    runBuild,
    runReInitiate
} from './file-manager.js';
import { stylesheetToObject, 
    classNameGenerator
} from './style.js';
import { mergeObjects, 
    convertToRegex } from './config.js';
import { scriptEngine } from "./script.js";

export const loadConfig = () => {
    const root = jsonFilesToObjects(['node_modules/x-class/.config.json'])[0].cxcRoot;
    const configObjects = jsonFilesToObjects([
        `node_modules/x-class/.config.json`,
        `${root}/config.json`
    ]);
    const config = mergeObjects(configObjects);
    const rgx = convertToRegex(config.supportRgx);
    const cloneIgn = parseListFile(`${root}/clone.ignore`);
    const parseIgn = parseListFile(`${root} /parse.ignore`);
    
    const stylesheet = mergeFiles([
        ...(config.cssConfig.referNative ? getAllFiles(`node_modules/x-class/.native-styles`) : []),
        ...(getAllFiles(`${root}/css-references`))
    ]);

    const styles = stylesheetToObject(stylesheet);
    const stylesList = Object.keys(styles).join("\n");
    writeToFile("node_modules/x-class/.reference.class.list", stylesList)
    clearDirectory("node_modules/x-class/.runtime-styles")
    
    return { config, rgx, styles, cloneIgn, parseIgn };
}

// Standered Commands

const cxcLoadSetup = () => {
    runLoadSetup([
        { 
            'source': 'node_modules/x-class/.init', 
            'destination': jsonFilesToObjects(['node_modules/x-class/.config.json'])[0].cxcRoot 
        }
    ]);
}

const cxcInitialize = () => {
    const { config } = loadConfig();
    runInitialize(config.directoryMap)
}

const cxcRunDeveloper = () => {

}

const cxcRunBuild = () => {
    const { config, rgx, styles, cloneIgn, parseIgn } = loadConfig();

    runBuild(config.directoryMap, scriptEngine, cloneIgn, parseIgn);

    const mergedCss = mergeFiles([
        `${config.cxcRoot}/base.css`,
        ...(getAllFiles("node_modules/x-class/.runtime-styles"))
    ]);
    
    writeToFile(`node_modules/x-class/.live-styles.css`, mergedCss)
    config.directoryMap.forEach(map => {
        writeToFile(`${map.source}/${map.cssExportPath}`, mergedCss)
    });
}

// Advanced Commands

const cxcReInitiate = () => {
    const { config } = cxcRunPublish();
    cxcRunBuild();
    runReInitiate(config.directoryMap);
    //append styles

}

const cxcRunDecimate = () => {
    const config = loadConfig();
    const rgx = convertToRegex(config.supportRgx);
    const styles = stylesheetsToObject([
        '.cxc/add.css',
        ...(config.cssConfig.referNative ? ['node_modules/x-class/.native.css'] : []),
        ...(config.cssConfig.addReference)
    ]);

    runDeveloper(config.directoryMap, () => "contentCallback", ".cxc/clone.ignore", ".cxc/parse.ignore");
    return { config, rgx, styles };
}

// cxcLoadSetup()
// cxcInitialize()
// cxcRunBuild()

// cxcRunDeveloper()
// console.log(cxcRunDecimate())
// console.log(cxcReInitiate())

let cxcRandomClassCounter = 0;

const { config } = loadConfig();
console.log(classNameGenerator(config.prefix, "components/navbar", '$'))