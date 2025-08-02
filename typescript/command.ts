import $ from "./Shell/main";
import * as DATA from "./data/init";
import * as FETCH from "./data/fetch";
import * as SMITH from "./data-smith";
import * as worker from "./Worker/watchman";
import fileman from "./fileman";
import { MemoryUsage } from "./data/init";
import { ROOT, APP, RAW, NAV, STACK } from "./data/cache";
import { FetchPortables, SplitGlobalForComponents } from "./Worker/portable";

function reporter(heading, targets, report) {
    $.POST(
        $.MOLD.std.Block([
            $.MOLD.title.Chapter(heading, targets.map(i => `Watching : ${i}`), $.list.tertiary.Bullets),
            report,
            $.MOLD.failed.Footer("Press Ctrl+C to stop watching.", MemoryUsage(), $.list.tertiary.Entries),
        ]),
    );
}

async function execute(chapter) {
    let stopWatcher = null;
    let report = "",
        targets = [],
        reportNext = false,
        step = "Initialize",
        staticsFetched = false,
        heading = "Initial Build";

    $.POST($.MOLD.tertiary.Chapter(chapter));

    do {
        switch (step) {
            case "Initialize":

            case "VerifySetupStruct":
                const verifyStructResult = await FETCH.VerifySetupStruct();
                if (!verifyStructResult.proceed) {
                    report = verifyStructResult.report;
                    step = "WatchFolders";
                    break;
                } else report = "";

            case "ReadIndex":
                await FETCH.FetchIndexContent();

            case "ReadLibraries":
                await FETCH.ReloadLibrary();

            case "VerifyConfigure":
                const verifyConfigsResult = await FETCH.VerifyConfigure(!staticsFetched);
                if (!verifyConfigsResult.status) {
                    report = verifyConfigsResult.report;
                    step = "WatchFolders";
                    break;
                } else {
                    staticsFetched = true;
                    report = "";
                }

            case "ReadProxyFolders":
                await FETCH.UpdateProxies();

            case "ReadHashrules":
                const hashruleAnalysis = await FETCH.AnalyzeHashrules();
                if (!hashruleAnalysis.status) {
                    report = hashruleAnalysis.report;
                    step = "WatchFolders";
                    break;
                } else report = "";

            case "ProcessXtylesFolder":
                SMITH.UpdateXtylesFolder();

            case "ProcessProxyFolders":
                SMITH.ProcessProxies();

            case "GenerateFinals":
                const {
                    SaveFiles,
                    ConsoleReport
                } = RAW.CMD === "split" ? SplitGlobalForComponents() : await SMITH.Generate();
                report = ConsoleReport;

            case "Publish":
                if (Object.keys(SaveFiles).length) await fileman.write.bulk(SaveFiles);
                if (reportNext) { reporter(heading, targets, report); reportNext = false };

            case "WatchFolders":
                if (RAW.WATCH) {
                    step = "WatchFolders";
                } else {
                    if (stopWatcher) {
                        stopWatcher();
                        stopWatcher = null;
                    }
                    break;
                }

                if (!stopWatcher) {
                    targets = Object.keys(STACK.PROXYCACHE);
                    const targetFolders = [...targets, NAV.folder.setup];
                    process.on("SIGINT", () => {
                        if (stopWatcher) {
                            stopWatcher();
                            stopWatcher = null;
                            $.render.write("\n", 2);
                        }
                        process.exit();
                    });
                    stopWatcher = worker.watchFolders(targetFolders);
                    reporter(heading, targets, report);
                }

                if (worker.hasEvents()) {
                    const event = worker.dequeueEvent();
                    $.initialize(event.consoleWidth, !RAW.WATCH);
                    const filePath = `${event.folder}/${event.filePath}`;
                    if (filePath.startsWith(NAV.folder.autogen)) {
                        break;
                    } else {
                        if (event.folder === NAV.folder.setup) {
                            if (event.action === "add" || event.action === "change") {
                                switch (filePath) {
                                    case NAV.json.configure:
                                        stopWatcher();
                                        stopWatcher = null;
                                        step = "VerifyConfigure";
                                        break;
                                    case NAV.css.atrules:
                                    case NAV.css.constants:
                                    case NAV.css.elements:
                                    case NAV.css.extends:
                                        await FETCH.FetchIndexContent();
                                        step = "GenerateFinals";
                                        break;
                                    case NAV.json.hashrules:
                                        step = "ReadHashrules";
                                        break;
                                    default:
                                        if (filePath.startsWith(NAV.folder.library) && event.extension === "css")
                                            RAW.LIBRARIES[filePath] = event.fileContent;
                                        else if (filePath.startsWith(NAV.folder.portables) && ["xcss", "css", "md"].includes(event.extension))
                                            RAW.PORTABLES[filePath] = event.fileContent;
                                        step = "ProcessXtylesFolder";
                                }
                            } else {
                                step = "VerifySetupStruct";
                            }
                        } else if (event.action === "add" || event.action === "change" || event.action === "unlink") {
                            SMITH.ProcessProxies(event.action, event.folder, event.filePath, event.fileContent, event.extension);
                            step = "GenerateFinals";
                        } else step = "VerifyConfigure";

                        heading = `[${event.timeStamp}] | ${event.filePath} | [${event.action}]`;
                        reportNext = true;
                    }
                }

                await new Promise((resolve) => setTimeout(resolve, 50));
        }
    } while (RAW.WATCH);

    if (stopWatcher) {
        stopWatcher();
        stopWatcher = null;
    } else {
        $.POST(report);
    }
}

async function commander(
    command,
    argument,
    rootPath,
    workPath,
    consoleWidth,
    packageJson,
    projectName,
    projectVersion,
    vendorGroup,
) {
    // RAW.CMD = ["watch", "preview", "publish"].includes(command) ? "watch" : command;
    RAW.CMD = command;
    RAW.ARG = argument;
    RAW.WATCH = command === "watch";
    RAW.PACKAGE = projectName;
    RAW.VERSION = projectVersion;
    DATA.SetENV(rootPath, workPath, packageJson, vendorGroup);
    $.initialize(consoleWidth, command !== "watch" && command !== "split");

    switch (RAW.CMD) {
        case "init":
            await $.PLAY.Title(APP.name + " : Initialize", 500);
            const setupInit = await FETCH.VerifySetupStruct();
            if (setupInit.unstart) $.POST(await FETCH.Initialize());
            else if (setupInit.proceed) {
                $.POST((await FETCH.VerifyConfigure()).report);
            } else {
                $.POST(setupInit.report);
            }
            break;
        case "watch":
            execute(RAW.PACKAGE + " : Active Runtime");
            break;
        case "preview":
            await execute(RAW.PACKAGE + " : Preview Build");
            break;
        case "publish":
            await execute(RAW.PACKAGE + " : Final Build");
            break;
        case "split":
            await execute(RAW.PACKAGE + " : Split for Components");
            break;
        case "install":
            $.POST("\n" + $.MOLD.secondary.Section("Installing Portables"));

            const verifyStructResult = await FETCH.VerifySetupStruct();
            if (verifyStructResult.proceed) {
                const verifyConfigsResult = await FETCH.VerifyConfigure();
                if (verifyConfigsResult.status) {
                    const fetchResult = await FetchPortables(argument);
                    await fileman.write.bulk(fetchResult.SaveFiles);
                    $.POST($.MOLD.secondary.Footer("Installation status", fetchResult.Status, $.list.std.Props))
                } else $.POST(verifyConfigsResult.report)
            } else $.POST(verifyStructResult.report)
            break;
        default:
            await FETCH.FetchDocs();
            $.POST(
                $.MOLD.std.Chapter(`${APP.command} @ ` + APP.version, [
                    ROOT.DOCS.alerts.content,
                ]),
            );
            $.POST(
                $.MOLD.secondary.Section(
                    "Available Commands",
                    APP.commandList,
                    $.list.std.Props,
                ),
            );
            $.POST(
                $.MOLD.secondary.Section(
                    "Agreements",
                    Object.values(ROOT.AGREEMENT).reduce((acc, i) => {
                        acc[i.title] = i.path;
                        return acc;
                    }, {}),
                    $.list.std.Props,
                ),
            );
            $.POST(
                $.MOLD.secondary.Section("Documentation : " + ROOT.DOCS.readme.path, [
                    "For more information visit " + $.style.bold.White(APP.website),
                ]),
            );
    }
}

export default commander;
