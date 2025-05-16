import { PACKAGE, ROOT, NAV, APP, } from './commander.js'

async function FetchDocs() {
    const readmeMd = fileman.sync.file(ROOT.DOCS.readme.url, ROOT.DOCS.readme.path);
    const alertsMd = fileman.sync.file(ROOT.DOCS.alerts.url, ROOT.DOCS.alerts.path);
    const license = fileman.sync.file(ROOT.AGREEMENT.license.url, ROOT.AGREEMENT.license.path);
    const terms = fileman.sync.file(ROOT.AGREEMENT.terms.url, ROOT.AGREEMENT.terms.path);
    const privacy = fileman.sync.file(ROOT.AGREEMENT.privacy.url, ROOT.AGREEMENT.privacy.path);

    ROOT.DOCS.readme.content = await readmeMd;
    ROOT.DOCS.alerts.content = await alertsMd;
    ROOT.AGREEMENT.license.content = await license;
    ROOT.AGREEMENT.terms.content = await terms;
    ROOT.AGREEMENT.privacy.content = await privacy;
}

async function initialize() {
    try {
        if (DATA.CMD !== "dev") $.TASK("Initializing XCSS setup.", 0);

        if (DATA.CMD !== "dev") $.TASK('Cloning scaffold to Project');
        await fileman.clone.safe(NAV.scaffold.setup, NAV.folder.setup);
        await fileman.clone.safe(NAV.scaffold.refers, NAV.folder.refers);

        $.WRITE.std.Section("Next Steps", [
            'Adjust ' + $.custom.style.apply.bold.Orange(NAV.json.configure) + $.custom.style.Reset + ' according to the requirements of your project.',
            'Execute ' + $.custom.style.apply.bold.Orange('"init"') + $.custom.style.Reset + ' again to generate the necessary configuration folders.',
            'During execution ' + $.custom.style.apply.bold.Orange('{target}') + $.custom.style.Reset + ' folder will be cloned from ' + $.custom.style.apply.bold.Orange('{source}') + $.custom.style.Reset + ' folder.',
            'This folder will act as proxy for ' + APP.name + '.',
            'In the ' + $.custom.style.apply.bold.Orange('{target}/{stylesheet}') + $.custom.style.Reset + ', content from ' + $.custom.style.apply.bold.Orange('{target}/{stylesheet}') + $.custom.style.Reset + ' will be appended.'
        ], $.list.std.Bullets);


        $.WRITE.std.Section('Available Commands', APP.commandList, $.list.std.Props)

        $.WRITE.std.Section("Build command instructions.",
            (PACKAGE.version.split(".")[0] === "0") ? ["This command uses an internet connection."]
                : [
                    "Create a new project and use its access key. For action visit " + $.custom.style.apply.bold.Orange(ROOT.console),
                    "For personal projects, you can use the key in " + $.custom.style.apply.bold.Orange(NAV.json.configure),
                    "If using in CI/CD workflow, it is suggested to use " + $.custom.style.apply.bold.Orange("xcss build {key}")
                ], $.list.std.Bullets);

        return true;
    } catch (err) {
        $.WRITE.failed.Footer("Initialization failed.", [err.message], $.list.failed.Bullets);
        return false;
    }
}

export default {
    FetchDocs,
    initialize
}

export const ACTION = {
    CONFIGURE: {},
    FetchPrefix: async () => {
        if (DATA.CMD !== "dev") $.TASK("Loading vendor-prefixes", 0)

        const classes = fileman.sync.json(ROOT.PREFIX.classes.url, ROOT.PREFIX.classes.path);
        const atrules = fileman.sync.json(ROOT.PREFIX.atrules.url, ROOT.PREFIX.atrules.path);
        const elements = fileman.sync.json(ROOT.PREFIX.elements.url, ROOT.PREFIX.elements.path);
        const properties = fileman.sync.json(ROOT.PREFIX.properties.url, ROOT.PREFIX.properties.path);

        DATA.PREFIX.classes = await classes
        DATA.PREFIX.atrules = await atrules
        DATA.PREFIX.elements = await elements
        DATA.PREFIX.properties = await properties
    },
    VerifySetup: async () => {
        const errors = {}, passed = {};

        if (DATA.CMD !== "dev") $.TASK("Verifying directory status", 0)
        for (const item of Object.values(NAV.css)) {
            if (DATA.CMD !== "dev") $.STEP("Path : " + item)
            if (await fileman.PATH.ifFile(item)) {
                passed[item] = "Ok";
            } else {
                errors[item] = "File not found.";
            }
        }
        for (const item of Object.values(NAV.json)) {
            if (DATA.CMD !== "dev") $.STEP("Path : " + item)
            if (await fileman.PATH.ifFile(item)) {
                passed[item] = "Ok";
            } else {
                errors[item] = "File not found.";
            }
        }
        if (DATA.CMD !== "dev") $.TASK("Verification complete")

        return {
            unstart: !(await fileman.PATH.available(NAV.folder.setup)).exist,
            proceed: Object.keys(errors).length === 0,
            report: (Object.keys(errors).length !== 0 && Object.keys(passed).length !== 0) ?
                $.compose.failed.Footer("Error Paths", errors, $.list.failed.Props) : $.compose.success.Footer("Setup Healthy")
        };
    },
    VerifyConfigs: async () => {
        const errors = {};
        const configure = fileman.READ.json(NAV.json.configure)
        const shorthand = fileman.READ.json(NAV.json.shorthand)

        if (DATA.CMD !== "dev") $.TASK("Initializing configs")

        if (DATA.CMD !== "dev") $.STEP("PATH : " + NAV.json.configure)
        if ((await configure).status) {
            ACTION.CONFIGURE = (await configure).data
            DATA.ARG = DATA.ARG ?? ACTION.CONFIGURE.key
            DATA.SOURCE = ACTION.CONFIGURE.source
            if (fileman.PATH.isAncestor(ACTION.CONFIGURE.source, NAV.folder.setup) || fileman.PATH.isAncestor(ACTION.CONFIGURE.source, NAV.folder.setup)) {
                errors[ACTION.CONFIGURE.source] = "Dependence with " + NAV.folder.setup + " not allowed."
            } else if (fileman.PATH.ifFolder(ACTION.CONFIGURE.source)) {
                if (fileman.PATH.isAncestor(ACTION.CONFIGURE.target, NAV.folder.setup) || fileman.PATH.isAncestor(ACTION.CONFIGURE.target, NAV.folder.setup)) {
                    errors[ACTION.CONFIGURE.target] = "Dependence with " + NAV.folder.setup + " not allowed."
                } else if (fileman.PATH.isAncestor(ACTION.CONFIGURE.target, ACTION.CONFIGURE.source) || fileman.PATH.isAncestor(ACTION.CONFIGURE.target, ACTION.CONFIGURE.source)) {
                    errors[ACTION.CONFIGURE.target] = "Dependence with " + ACTION.CONFIGURE.source + " not allowed."
                } else {
                    const av = await fileman.PATH.available(ACTION.CONFIGURE.target);
                    if (!av.exist)
                        await fileman.clone.safe(ACTION.CONFIGURE.source, ACTION.CONFIGURE.target)
                    else if (av.type !== "folder")
                        errors[ACTION.CONFIGURE.target] = "Folder not found."
                    else if (!await fileman.PATH.ifFile(fileman.PATH.join(ACTION.CONFIGURE.target, ACTION.CONFIGURE.stylesheet)))
                        errors[fileman.PATH.join(ACTION.CONFIGURE.target, ACTION.CONFIGURE.stylesheet)] = "*.css file not found."
                }
            } else
                errors[ACTION.CONFIGURE.source] = "Folder not found."
        } else errors[NAV.json.configure] = "Bad json file."

        if (DATA.CMD !== "dev") $.STEP("PATH : " + NAV.json.shorthand)
        if ((await shorthand).status) {
            if (typeof ((await shorthand).data) === "object") {
                DATA.SHORTHAND = Object.fromEntries(
                    Object.entries((await shorthand).data).filter(([key, value]) => typeof value === 'string')
                );
            } else errors[NAV.json.shorthand] = "Error data type"
        } else errors[NAV.json.shorthand] = "Bad json file."

        if (DATA.CMD !== "dev") $.TASK("Initializing complete")
        return {
            status: Object.keys(errors).length === 0,
            report: Object.keys(errors).length === 0 ?
                $.compose.success.Footer("Configs Healthy", errors, $.list.failed.Props) :
                $.compose.failed.Footer("Error Paths", errors, $.list.failed.Props)
        }
    },
    SaveSetup: async () => {
        if (DATA.CMD !== "dev") $.TASK("Fetching from Setup", 0)
        if (DATA.CMD !== "dev") $.STEP("Loading Reference styles")
        const refers = fileman.READ.bulk(NAV.folder.refers, ["css"]);
        if (DATA.CMD !== "dev") $.STEP("Loading Origin styles")
        const stylePrefix = CSSImport([
            NAV.css.atrules,
            NAV.css.constants,
            NAV.css.elements,
            NAV.css.extends,
        ]);
        if (DATA.CMD !== "dev") $.TASK("Saving styles")
        DATA.REFERS = await refers;
        DATA.CSSIndex = await stylePrefix;
        DATA.SHORTHAND = {
            ...DATA.SHORTHAND,
            ...ACTION.CONFIGURE.shorthands
        };
    },
    SaveFiles: async () => {
        if (DATA.CMD !== "dev") $.TASK("Fetching target files", 0)
        if (DATA.CMD !== "dev") $.TASK("Syncing untargeted files")
        const files = fileman.sync.bulk(
            ACTION.CONFIGURE.target,
            ACTION.CONFIGURE.source,
            Object.keys(ACTION.CONFIGURE.extensions),
            [ACTION.CONFIGURE.stylesheet]
        );

        DATA.TARGET = ACTION.CONFIGURE.target
        DATA.CSSPath = ACTION.CONFIGURE.stylesheet
        DATA.EXTPROPS = ACTION.CONFIGURE.extensions
        DATA.CSSAppendix = await CSSImport([
            fileman.PATH.join(ACTION.CONFIGURE.target, ACTION.CONFIGURE.stylesheet)
        ]);

        if (DATA.CMD !== "dev") $.TASK("Saving targeted files")
        DATA.FILES = (await files).fileContent
    }
};
