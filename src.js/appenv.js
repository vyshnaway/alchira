
export default pathto

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

export const APP = {
    name: "XCSS",
    package: "xpktr-css",
    command: "xcss",
    version: '0.1.0',
    commandList: {
        init: 'Initiate or Update & Verify setup.',
        dev: 'Live build for dev environment',
        preview: 'Fast build, preserves class names.',
        build: 'Build minified.'
    },
    live: {
        vendorprefixes: "https://xcdn.xpktr.com/xcss/library/vendor-prefixes.json",
        agreements: "https://xcdn.xpktr.com/xcss/agreements-txt/index.json",
        build: "https://workers.xpktr.com/api/xcss-build-request"
    }
};

export const NAV = {
    path: ".",
    root: "/",
    agreements: "AGREEMENTS",
    template: {
        setup: "templates/xtyles",
        refer: "templates/refers"
    },
    project: {
        setup: "xtyles",
        refer: "references",
        cache: ".cache",
        syncmap: "syncmap.json",
        config: "configure.json",
        shorthand: "short-hands.json",
        vendorprefix: "vendor-prefix.json",
        atrules: "#at-rules.css",
        constants: "#constants.css",
        tagstyles: "#tag-styles.css",
        source: "",
        target: "",
        styles: "",
        key: "",
        extensions: [],
    },
    INIT: () => {
        NAV.root = FILEMAN.path.ofRoot();
        NAV.agreements = path.join(NAV.root, NAV.agreements);
        NAV.template.setup = path.join(NAV.root, NAV.template.setup);
        NAV.template.refer = path.join(NAV.root, NAV.template.refer);

        NAV.project.setup = path.join(NAV.path, NAV.project.setup);
        NAV.project.refer = path.join(NAV.project.setup, NAV.project.refer);
        NAV.project.cache = path.join(NAV.project.setup, NAV.project.cache);
        NAV.project.syncmap = path.join(NAV.project.cache, NAV.project.syncmap);

        NAV.project.config = path.join(NAV.project.setup, NAV.project.config);
        NAV.project.shorthand = path.join(NAV.project.setup, NAV.project.shorthand);
        NAV.project.vendorprefix = path.join(NAV.project.setup, NAV.project.vendorprefix);

        NAV.project.atrules = path.join(NAV.project.setup, NAV.project.atrules);
        NAV.project.constants = path.join(NAV.project.setup, NAV.project.constants);
        NAV.project.tagstyles = path.join(NAV.project.setup, NAV.project.tagstyles);

        return NAV
    },
    BUILD: async () => {
        NAV.INIT();
        SHORTHAND.UPLOAD((await FILEMAN.readJsonData(NAV.project.shorthand)).data);
        const configure = (await FILEMAN.readJsonData(NAV.project.config)).data

        NAV.project.source = configure["source"];
        NAV.project.target = configure["target"];
        NAV.project.styles = configure["stylesheet"];
        NAV.project.key = configure["project-key"];
        NAV.project.extensions = configure["extensions"].map(ext => '.' + ext);
    }
};