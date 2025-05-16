import $ from './Shell/index.js';
import fileman from '../interface/files.js';
import { PACKAGE, ROOT, NAV, APP, } from './metadata.js';

export async function FetchDocs() {
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

export async function FetchPrefix() {
    $.TASK("Loading vendor-prefixes", 0);

    const classes = fileman.sync.json(ROOT.PREFIX.classes.url, ROOT.PREFIX.classes.path);
    const atrules = fileman.sync.json(ROOT.PREFIX.atrules.url, ROOT.PREFIX.atrules.path);
    const elements = fileman.sync.json(ROOT.PREFIX.elements.url, ROOT.PREFIX.elements.path);
    const properties = fileman.sync.json(ROOT.PREFIX.properties.url, ROOT.PREFIX.properties.path);

    DATA.PREFIX.classes = await classes
    DATA.PREFIX.atrules = await atrules
    DATA.PREFIX.elements = await elements
    DATA.PREFIX.properties = await properties
}

export async function Initialize() {
    try {
        $.TASK("Initializing XCSS setup.", 0);
        $.TASK('Cloning scaffold to Project');
        await fileman.clone.safe(NAV.scaffold.setup, NAV.folder.setup);
        await fileman.clone.safe(NAV.scaffold.refers, NAV.folder.refers);

        $.POST($.MOLD.std.Section("Next Steps", [
            'Adjust ' + $.custom.style.apply.bold.Orange(NAV.json.configure) + $.custom.style.Reset + ' according to the requirements of your project.',
            'Execute ' + $.custom.style.apply.bold.Orange('"init"') + $.custom.style.Reset + ' again to generate the necessary configuration folders.',
            'During execution ' + $.custom.style.apply.bold.Orange('{target}') + $.custom.style.Reset + ' folder will be cloned from ' + $.custom.style.apply.bold.Orange('{source}') + $.custom.style.Reset + ' folder.',
            'This folder will act as proxy for ' + APP.name + '.',
            'In the ' + $.custom.style.apply.bold.Orange('{target}/{stylesheet}') + $.custom.style.Reset + ', content from ' + $.custom.style.apply.bold.Orange('{target}/{stylesheet}') + $.custom.style.Reset + ' will be appended.'
        ], $.list.std.Bullets));

        $.POST($.MOLD.std.Section('Available Commands', APP.commandList, $.list.std.Props))
        $.POST($.MOLD.std.Section("Build command instructions.",
            (PACKAGE.version.split(".")[0] === "0") ? ["This command uses an internet connection."] : [
                "Create a new project and use its access key. For action visit " + $.custom.style.apply.bold.Orange(ROOT.console),
                "For personal projects, you can use the key in " + $.custom.style.apply.bold.Orange(NAV.json.configure),
                "If using in CI/CD workflow, it is suggested to use " + $.custom.style.apply.bold.Orange("xcss build {key}")
            ], $.list.std.Bullets));

        return true;
    } catch (err) {
        $.POST($.MOLD.failed.Footer("Initialization failed.", [err.message], $.list.failed.Bullets));
        return false;
    }
}
