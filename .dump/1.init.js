import {
    pathExists,
    writeToFile,
    safeCloneFolder,
    JSONCparse
} from './4.utils.js';
import path from 'path';
import $ from './Docs/package.js';



export const initConfig = async (root, workPath) => {

    config.root = root;
    config.template = path.join(config.root, config.template);

    config.path = workPath;
    config.setup = path.join(workPath, config.setup);
    config.cache = path.join(config.setup, config.cache);
    config.midway = path.join(config.cache, config.midway);

    config.browser = path.join(config.template, config.browser);
    config.dirMap = path.join(config.setup, config.dirMap)
    config.swapMap = path.join(config.cache, config.swapMap);
    config.originCss = path.join(config.cache, config.originCss);
    config.carbon = path.join(config.cache, config.carbon);

    config.midwayData = {
        view: path.join(config.midway, config.midwayTemplate.view),
        refer: path.join(config.midway, config.midwayTemplate.refer),
        styles: path.join(config.midway, config.midwayTemplate.styles),
        atStyles: path.join(config.midway, config.midwayTemplate.atStyles),
        globalStyles: path.join(config.midway, config.midwayTemplate.globalStyles)
    }

    config.dirMaps.map(map => {
        map.source = path.join(workPath, map.source);
        map.target = path.join(workPath, map.target);
        map.carbon = path.join(config.carbon, map.source)
        map.midway = path.join(config.midway, map.source)
    })

    Object.keys(config.supportExtentions).forEach(key => {
        if (key !== 'default') {
            config.supportExtentions[key] = {
                ...config.supportExtentions.default,
                ...config.supportExtentions[key]
            };
        }
    });
}

export const buildConfig = async () => {
    const extensions = config.supportExtentions;
    let missingTargetsDetected = false;

    await Promise.all(config.dirMaps.map(async map => {

        const stylesFolder = path.dirname(map.globalCss)
        map.fromStyles = path.join(map.target, stylesFolder)
        map.toStyles = path.join(map.source, stylesFolder)
        map.fromStylesheet = path.join(map.target, map.globalCss)
        map.toStylesheet = path.join(map.source, map.globalCss)

        map.midway = path.join(config.midway, map.source)
        map.midwayData = {
            view: path.join(map.midway, config.midwayTemplate.view),
            refer: path.join(map.midway, config.midwayTemplate.refer),
            styles: path.join(map.midway, config.midwayTemplate.styles),
            atStyles: path.join(map.midway, config.midwayTemplate.atStyles),
            globalStyles: path.join(map.midway, config.midwayTemplate.globalStyles)
        }

        Object.entries(map.targetExtensions).forEach(([key, value]) =>
            map.targetExtensions[key] = {
                ...value,
                ...(Object.keys(extensions).includes(key) ?
                    extensions[key] :
                    extensions.default)
            }
        )

        if (!await pathExists.folder(map.target)) {
            if (!missingTargetsDetected) {
                $.TASK('Attempting missing target build.');
                missingTargetsDetected = !missingTargetsDetected
                $.WRITE.std.Section('Creating missing targets')
            }
            safeCloneFolder(map.source, map.target)
            const overridePath = path.join(map.target, stylesFolder, '@overide', `xklaz.css`);
            writeToFile(overridePath, `/* override ${config.name} styles */`);
            $.WRITE.secondary.Item('Created ' + map.target + " from " + map.source)
        }
    }));
}
