
import {
    pathExists,
    fileFilter,
    syncMapGen,
    safeCloneFolder,
    parseListFile,
    getAllFilesInDirectory,
    getFilesInDirectory,
    writeToFile,
    mergeFiles,
    deleteFiles,
    deleteFolders,
    clearDirectory,
    readFromFile,
    mergeFilesInDirectory
} from './4.utils.js';
import { stylesToObject, xtylesheetBuilder } from './1.styles.js';
import { scriptEngine } from './2.script.js';
import path from 'path'
import $ from './Docs/package.js';
import { config } from './0.config.js';

const synchronizer = (dirMap) => {
    getAllFilesInDirectory()
}

const stylesheetPreprocessor = () => {
    const fetchCssFromCDN = async (filePath) => {
        const regex = /<\s*link\s+\S*\s*rel="stylesheet"\s+\S*\s*href="([^"]*)"\s*\/?>/;
        const content = readFromFile(filePath, 'utf8');
        const match = content.match(regex);

        if (match) {
            const url = match;
            $.TASK(`Fetching CSS from ${url} and updating ${filePath}`);

            const response = await fetch(url);
            if (!response.ok) return;
            writeToFile(filePath, await response.text(), 'utf8');
        }
    };

    getAllFilesInDirectory(config.path)
        .filter(file => /.css$/.test(file))
        .forEach(file => fetchCssFromCDN(file))

    const {
        atFiles,
        dotFiles,
        actFiles
    } = fileFilter(path.join(config.path, 'references'), '', ['.css']);

    const referCssFiles = actFiles.filter(file => /.css$/.test(file))
    const queryJsonFiles = atFiles.filter(file => /.json$/.test(file))
    const utilsJsonFiles = actFiles.filter(file => /.json$/.test(file))
    const classJsonFiles = dotFiles.filter(file => /.json$/.test(file))

    // const styles = stylesToObject(mergeFiles(referCssFiles));

    // writeToFile(path.join(config.view, '@origin.json'), JSON.stringify(styles.preview));
    // writeToFile(path.join(config.refer, '@origin.json'), JSON.stringify(styles.reference));

    // return styles;
}

const clasxEngine = (filePath, source, destination, config) => {
    const supportedScripts = Object.keys(config.scriptSupportRgx)
    const rgx = config.scriptSupportRgx;
    const fileExtension = filePath.match(/\.[^/.]+$/)[0].slice(1)
    if (supportedScripts.includes(fileExtension)) {
        const script = readFromFile(filePath)
        const { newScript, styleRules } = scriptEngine(script, filePath, config, rgx)
        writeToFile(filePath.replace(destination, source), newScript)
        writeToFile('node_modules/x-class/runtime-styles/' + filePath.replace(/\.[^/.]+$/, '.json'), JSON.stringify(styleRules))
        return styleRules;
    } else {
        console.log('Unsupported file format!!!')
        return {}
    }
}

const syncFetchFileMaps = (config, sync = true) => {
    return config.dirMaps.reduce((acc, map) => {
        const files = fileFilter(map.target, Object.keys(map.targetExtensions));
        console.log(files)
        acc[map.source] = syncMapGen(map, files.actFiles, config.midwayTemplate)
        if (sync) {
            console.log(map.source)
            console.log(map.midway)
            // deleteFiles(map.source, files.actFiles, true)
            // deleteFolders(map.midway, acc[map.source].keep , true)
        } else clearDirectory(config.cache, false)

        // console.log(syncMapGen(map, files.actFiles, config.midwayTemplate))
    }, {})
}

const syncDirMaps = (map, config) => {
    console.log()
    let codeSplit = [], codeMerge = [];
    // files.forEach(file =>
    //     config.splitValidate[file] ? codeSplit.push(file) : codeMerge.push(file))
    // return { codeSplit, codeMerge, syncMap: syncMapGen(map, files) };
}

const publish = (trim = true, debug = true) => {
    stylesheetPreprocessor();

    // console.log(config)
    // const {
    //     atFiles: atOrigin,
    //     dotFiles: dotOrigin
    // } = fileFilter(path.join(config.setup, 'style-references'), ['.css']);
    // const originStylesFiles = [
    //     path.join(config.setup, 'base.css'),
    //     ...atOrigin,
    //     path.join(config.setup, 'at-files.css'),
    //     ...dotOrigin
    // ]

    // tag(`Creating "${config.origin}" from "${config.setup}"`);
    // // console.log(originStylesFiles)

    // const originStyleContents = mergeFiles(originStylesFiles)
    // writeToFile(config.originCss, originStyleContents.join('\n\n'))

    // config.dirMaps.forEach(map => {
    //     let files = syncDirMaps(map, config)
    //     // const originOverRiders = fileFilter(map.fromDir).atFiles;
    //     // const globalCssContent = [
    //     //     readFromFile(config.fromStylesheet),
    //     //     // originStylesContent.join(join),
    //     //     mergeFiles(originOverRiders).join(' '),

    //     //     mergeFiles(map.atXtyles).join(' '),
    //     //     readFromFile(map.styles + '.css')
    //     // ].join(join)//.join('\n').replace(/[\n\s]+|\/\*[\s\S]*?\*\//g, ' ').replaceAll('}', '}\n')

    //     // writeToFile(config.toStylesheet, globalCssContent)
    // })
}







const dev = (dirMap, cloneIgnore, parseIgnore, contentCallback) => {
    publish(false, true);

    config.directoryMap.forEach((map) => {
        safeCloneFolder(map.source, map.destination);
    })

    const watchOptions = {
        persistent: true, // Keep the process running as long as files are being watched
        recursive: false, // Watch all subdirectories (only supported on macOS and Windows)
        encoding: 'utf8'  // Encoding to use for the filename argument
    };
    cloneIgnore = parseListFile(cloneIgnore);
    parseIgnore = parseListFile(parseIgnore);

    dirMap.forEach((map) => {
        const destination = map.source;
        const source = map.destination;

        const opFiles = getFilesInDirectory(source).filter(file => !cloneIgnore.find(ignore => file.includes(ignore)))

        opFiles.forEach(file => {
            const changeWatcher = fs.watch(file, options, (change) => {
                let content = fs.readFileSync(file, 'utf8');
                content = contentCallback(content);
                writeToFile(file.replace(source, destination), content);
            });
            const nameWatcher = fs.watch(file, options, (rename) => {
                changeWatcher.close()
                nameWatcher.close();
            });
        });
    })
};


const preview = () => {
    publish(false, false);
}

const build = () => {
    publish(true, false);
    const fileMaps = syncFetchFileMaps(config)
    console.log(fileMaps)
    // const styles = stylesheetPreprocessor(config)
    // let styleRules = {};

    // config.directoryMap.forEach(map => {
    //     let classFilter = [];
    //     console.log(map)
    //     const destination = map.source
    //     const source = config.path + '/' + map.destination;

    //     const cache = config.cache + '/';
    //     const cacheCss = config.css + '/' + map.source;
    //     const cachePreview = config.view + '/' + map.source;
    //     const cacheReference = config.refer + '/' + map.source;
    //     const cacheUtilities = cacheCss + '.css';

    //     const files = fileFilter(source, '', destination)
    //     const sync = files.syncMap;
    //     shell(`[ ${source} ] <-+-> [ ${destination} ]`, true)

    //     files.dotFiles.forEach(file => {
    //         writeToFile(sync[file], readFromFile(file))
    //     })
    //     files.actFiles.forEach(filePath => {
    //         const content = readFromFile(filePath);
    //         const output = scriptEngine(content, filePath, config);
    //         writeToFile(sync[filePath], output.content);
    //         writeToFile(sync[filePath].replace(destination, cacheCss) + '.css', output.css);
    //         writeToFile(sync[filePath].replace(destination, cacheReference) + '.json', output.object);
    //         writeToFile(sync[filePath].replace(destination, cachePreview) + '.json', output.preview);
    //     })

    //     classFilter = ['shadow-inner', 'shadow-inner', 'cursor-root', 'grid-cols-2', 'rounded-md', 'rounded-mdma'];
    //     classFilter = new Set(classFilter)
    //     const utilityStyles = Array.from(classFilter).reduce((acc, className) => {
    //         if (styles.preview[className]) {
    //             return acc + `.${className} { ${styles.preview[className]} } `;
    //         } return acc;
    //     }, '');

    //     const xtylesheet = xtylesheetBuilder();
    //     writeToFile(cacheUtilities, utilityStyles)
    //     const xtyleBlocks = mergeFiles(fileFilter(destination.replace('.', cache + 'xtyles-css')).actFiles).join('\n')
    //     const stylesheet = [
    //         '/*source stylesheet*/',
    //         readFromFile(source + '/' + map.stylesheet),
    //         '\n/*origin stylesheet*/',
    //         readFromFile(config.css + "/@origin.css"),
    //         '\n/*override origin*/',
    //         readFromFile(source + "/@restyle.css"),
    //         '\n/*utilities filter*/',
    //         readFromFile(cacheUtilities),
    //         '\n/*inline Composes*/',
    //         xtylesheet,
    //         '\n/*custom block Composes*/',
    //         xtyleBlocks
    //     ].join('')
    //     writeToFile(destination + '/' + map.stylesheet, stylesheet)
    // })
    // publish(config)
}
export default { dev, preview, build }