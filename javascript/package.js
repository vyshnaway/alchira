import $ from './Shell/index.js';
import * as COLLECT from "./collector.js";
import * as ACTION from './actions.js';
import * as CRAFT from './craftsmen.js';
import * as CACHE from './data-cache.js';
import * as watcher from '../interface/watcher.js';
import Library from "./class-refers.js";
import fileman from '../interface/fileman.js';
import SETDATA, { ROOT, APP, DATA, NAV } from './data-meta.js';

const executes = async (isDev = false, backRows = 0) => {
    const verified = await begins()
    if (verified.status) {
        await ACTION.SaveSetup()
        await ACTION.SaveFiles()
        const response = await CRAFT(DATA)

        if (isDev) {
            let report = "";
            const now = new Date();
            const nows = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
            const heading = $.MOLD.primary.Chapter(`Active Runtime : ${nows}`)
            const footer = $.MOLD.failed.Footer("Press Ctrl+C to stop watching.");
            report = [heading, response.errors, footer].join('\n')
            $.custom.render.animation.Rewrite(report, backRows);
            backRows = report.split("\n").length;
        } else {
            $.POST(response.report)
        }
    }
    return backRows
}

async function execute(step = "Initialize") {
    do {
        switch (step) {
            case "Initialize":
                await ACTION.FetchPrefix();
                CACHE.Initialize();

            case "VerifySetupStruct":
                const verifyStructResult = await COLLECT.Step0_VerifySetupStruct();
                if (!verifyStructResult.proceed) { $.POST(verifyStructResult.report); break; }
            case "VerifyProxyMap":
                const verifyConfigsResult = await COLLECT.Step1_VerifyProxyMap();
                if (!verifyConfigsResult.status) { $.POST(verifyConfigsResult.report); break; }

            case "ReadLibraries":
                await COLLECT.Step2_UpdateLibrary();
            case "ReadTargetFolders":
                await COLLECT.Step3_UpdateProxies();
            case "ReadAxiomFrags":
                await COLLECT.Step4_FetchIndexContent();
            case "ReadShorthands":
                const shorthandAnalysis = await COLLECT.Step5_AnalyzeShorthands();
                if (!shorthandAnalysis.status) { $.POST(shorthandAnalysis.report); break; }

            case "ProcessLibraries":
                CRAFT.UpdateLibrary();
            case "ProcessShorthands":
                CRAFT.UpdateShorthands();
            case "ProcessTargetFolders":
                await CRAFT.ProcessProxies();

            // case "GenerateFinals":
            //     await CRAFT.GenerateFinal();
            // case "Deploy":
            // await fileman.write.bulk(response.files)

        }
        if (DATA.CMD === "devs") {
            // { action: null, folder: null, filePath: null, fileContent: null }
            const response = await watcher.watchFolders
                (CRAFT.ProxyTargets.map(proxy => proxy.target), NAV.folder.setup);

            if (response.folder === NAV.folder.setup) {
                switch (response.filePath) {
                    case NAV.css.atrules: case NAV.css.constants: case NAV.css.elements: case NAV.css.extends:
                        break;
                    case NAV.json.shorthand:
                        break;
                    case NAV.json.proxymap:
                        break;
                    default:
                        switch (response.action) {
                            case "fileEdit": case "fileAdd":
                                Library.SaveFile(response.filePath, response.fileContent);
                                step = "buildLibrary";
                                break;
                            case "fileDelete":
                                Library.DeleteFile(response.filePath)
                                step = "buildLibrary";
                                break;
                            case "folderUpdate":
                                step = "VerifySetupConfigs";
                                break;
                        }
                }
            } else {
                CRAFT.ProxyTargets.forEach(proxy => {
                    if (proxy.target === response.folder) {
                        switch (response.action) {
                            case "fileEdit":
                                break;
                            case "fileAdd":
                                break;
                            case "fileDelete":
                                break;
                            case "folderUpdate":
                                break;
                        }
                    }
                })
            }

        }
    } while (DATA.CMD === "devs");
}

async function commander(cmd, arg, rootPath, consoleWidth, packageJson) {
    DATA.CMD = cmd; DATA.ARG = arg;
    SETDATA(rootPath, packageJson);
    $.initialize(consoleWidth, cmd !== "dev");

    switch (DATA.CMD) {
        case 'init':
            await $.PLAY.Title(APP.name + ' : Initialize', 500);
            const setupInit = await COLLECT.Step0_VerifySetupStruct();
            if (setupInit.unstart)
                $.POST(await ACTION.Initialize());
            else if (setupInit.proceed) {
                $.POST((await COLLECT.Step1_VerifyProxyMap()).report);
            } else {
                $.POST(setupInit.report);
            }
            break;
        case 'dev':
            $.POST($.MOLD.std.Chapter(APP.name + ' : Active Runtime'));
            execute();
            break;
        case 'preview':
            $.POST($.MOLD.std.Chapter(APP.name + ' : Preview Build'));
            await execute()
            break;
        case 'build':
            $.POST($.MOLD.std.Chapter(APP.name + ' : Final Build'));
            await execute()
            break;
        default:
            await ACTION.FetchDocs();
            $.POST($.MOLD.std.Chapter(`${APP.command} @ ` + APP.version, [ROOT.DOCS.alerts.content]));
            $.POST($.MOLD.secondary.Section('Available Commands', APP.commandList, $.list.std.Props));
            $.POST($.MOLD.secondary.Section('Agreements',
                Object.values(ROOT.AGREEMENT).reduce((acc, i) => { acc[i.title] = i.path; return acc }, {}), $.list.std.Props));
            $.POST($.MOLD.secondary.Section("Documentation : " + ROOT.DOCS.readme.path,
                ['For more information visit ' + $.style.bold.White(APP.website)]));
    }
}

export default commander;