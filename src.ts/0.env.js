const appName = 'xklaz';
const version = '0.1.0';

let config = {
    cmd: 'xk',
    name: appName,
    version: version,
    root: '/',
    path: '.',
    setup: '&xetup',
    cache: '.cache',
    midway: 'midway',
    carbon: '.target-clones',
    template: 'template',
    browser: '@dox.html',
    dirMap: 'directory-map.jsonc',
    swapMap: 'swap-map.json',
    originCss: 'origin.css',
    midwayTemplate: {
        view: 'view.json',
        refer: 'refer.json',
        styles: 'styles.json',
        atStyles: 'at-styles.json',
        globalStyles: 'global-styles.json'
    },
    activeCommands: {
        start: 'start and verify setup',
        dev: 'live build for dev environment',
        preview: 'fast build, preserves class names.',
        build: 'build minified.',
        docs: 'localhost docs.'
    },
    midwayData: {},
    dirMaps: []
};

export default config;

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