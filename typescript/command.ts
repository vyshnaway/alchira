/* eslint-disable no-fallthrough */
import $ from "./Shell/main.js";
import * as $$ from "./shell.js";
import * as DATA from "./Data/init.js";
import * as FETCH from "./Data/fetch.js";
import * as SMITH from "./execute.js";
import * as worker from "./Data/watch.js";

import fileman from "./fileman.js";
import { MemoryUsage } from "./Data/init.js";
import { T_PackageEssential } from "./types.js";
import { DOCUMENTS, ORIGIN, CACHE_STATIC, NAVIGATE, CACHE_STORAGE } from "./Data/cache.js";
import Use from "./Utils/main.js";
// import { FetchPortables, SplitGlobalForComponents } from "./portable.js";

function reporter(heading: string, targets: string[], report: string) {
    $.POST(
        $.MOLD.std.Block([
            $.MOLD.title.Chapter(heading, targets.map(i => `Watching : ${i}`), $.list.tertiary.Bullets),
            report,
            $.MOLD.failed.Footer("Press Ctrl+C to stop watching.", MemoryUsage(), $.list.tertiary.Entries),
        ]),
    );
}

async function execute(chapter: string) {
    let stopWatcher: null | (() => void) = null;
    let SaveFiles: Record<string, string> = {};
    let report = "",
        targets: string[] = [],
        reportNext = false,
        step = "Initialize",
        staticsFetched = false,
        heading = "Initial Build";

    $.POST($.MOLD.tertiary.Chapter(chapter));

    do {

        switch (step) {
            case "Initialize":
            case "VerifySetupStruct": {
                const verifyStructResult = await FETCH.VerifySetupStruct();
                if (!verifyStructResult.proceed) {
                    report = verifyStructResult.report;
                    step = "WatchFolders";
                    break;
                } else {
                    report = "";
                }
            }
            case "ReadIndex": {
                await FETCH.UpdateIndexContent();
            }
            case "ReadLibraries": {
                await FETCH.UpdateLibrary();
            }
            case "VerifyConfigure": {
                const verifyConfigsResult = await FETCH.VerifyConfigure(!staticsFetched);
                if (!verifyConfigsResult.status) {
                    report = verifyConfigsResult.report;
                    step = "WatchFolders";
                    break;
                } else {
                    staticsFetched = true;
                    report = "";
                }
            }
            case "ReadProxyFolders": {
                await FETCH.UpdateProxies();
            }
            case "ReadHashrules": {
                const hashruleAnalysis = await FETCH.UpdateHashrules();
                if (!hashruleAnalysis.status) {
                    report = hashruleAnalysis.report;
                    step = "WatchFolders";
                    break;
                } else { report = ""; }
            }


            case "ProcessXtylesFolder": {
                SMITH.UpdateXtylesFolder();
            }
            // case "ProcessProxyFolders": {
            //     SMITH.ProcessProxies();
            // }
            // case "GenerateFinals": {
            //     const response = await SMITH.Generate();
            //     Object.assign(SaveFiles, response.SaveFiles);
            //     report = response.ConsoleReport;
            // }
            // case "Publish": {
            //     if (Object.keys(SaveFiles).length) { await fileman.write.bulk(SaveFiles); }
            //     if (reportNext) { reporter(heading, targets, report); reportNext = false; };
            // }
            // case "WatchFolders": {
            //     if (STATIC_CACHE.WATCH) {
            //         step = "WatchFolders";
            //     } else {
            //         if (stopWatcher) {
            //             stopWatcher();
            //             stopWatcher = null;
            //         }
            //         break;
            //     }

            //     if (!stopWatcher) {
            //         targets = Object.keys(STACK.PROXYCACHE);
            //         const targetFolders = [...targets, NAVIGATE.folder.setup.path];
            //         process.on("SIGINT", () => {
            //             if (stopWatcher) {
            //                 stopWatcher();
            //                 stopWatcher = null;
            //                 $.render.write("\n", 2);
            //             }
            //             process.exit();
            //         });
            //         stopWatcher = worker.watchFolders(targetFolders);
            //         reporter(heading, targets, report);
            //     }

            //     if (worker.EventQueue.hasEvents()) {
            //         const event = worker.EventQueue.dequeue();
            //         if (!event) { break; }
            //         const filePath = `${event.folder}/${event.filePath}`;
            //         if (filePath.startsWith(NAVIGATE.folder.autogen.path)) {
            //             break;
            //         } else {
            //             if (event.folder === NAVIGATE.folder.setup.path) {
            //                 if (event.action === "add" || event.action === "change") {
            //                     switch (filePath) {
            //                         case NAVIGATE.json.configure.path:
            //                             stopWatcher();
            //                             stopWatcher = null;
            //                             step = "VerifyConfigure";
            //                             break;
            //                         case NAVIGATE.css.atrules.path:
            //                         case NAVIGATE.css.constants.path:
            //                         case NAVIGATE.css.elements.path:
            //                         case NAVIGATE.css.extends.path:
            //                             await FETCH.FetchIndexContent();
            //                             step = "GenerateFinals";
            //                             break;
            //                         case NAVIGATE.json.hashrules.path:
            //                             step = "ReadHashrules";
            //                             break;
            //                         default:
            //                             if (filePath.startsWith(NAVIGATE.folder.library.path) && event.extension === "css") { STATIC_CACHE.LIBRARIES[filePath] = event.fileContent; }
            //                             else if (filePath.startsWith(NAVIGATE.folder.portables.path) && ["xcss", "css", "md"].includes(event.extension)) { STATIC_CACHE.PACKAGES[filePath] = event.fileContent; }
            //                             step = "ProcessXtylesFolder";
            //                     }
            //                 } else {
            //                     step = "VerifySetupStruct";
            //                 }
            //             } else if (event.action === "add" || event.action === "change" || event.action === "unlink") {
            //                 SMITH.ProcessProxies(event.action, event.folder, event.filePath, event.fileContent, event.extension);
            //                 step = "GenerateFinals";
            //             } else { step = "VerifyConfigure"; }

            //             heading = `[${event.timeStamp}] | ${event.filePath} | [${event.action}]`;
            //             reportNext = true;
            //         }
            //     }

            //     await new Promise((resolve) => setTimeout(resolve, 50));
            // }
        }
    } while (CACHE_STATIC.WATCH);

    if (stopWatcher) {
        stopWatcher();
        stopWatcher = null;
    } else {
        $.POST(report);
    }
}

async function commander({
    command,
    argument,
    rootPath,
    workPath,
    projectName,
    projectVersion,
    originPackageEssential
}: {
    command: string,
    argument: string,
    rootPath: string,
    workPath: string,
    projectName: string,
    projectVersion: string,
    originPackageEssential: T_PackageEssential
}) {
    CACHE_STATIC.COMMAND = command;
    CACHE_STATIC.ARGUMENT = argument;
    CACHE_STATIC.WATCH = argument === "watch";
    CACHE_STATIC.FALLBACK_NAME = Use.string.normalize(projectName);
    CACHE_STATIC.FALLBACK_VERSION = projectVersion;
    DATA.SetENV(rootPath, workPath, originPackageEssential);
    $.INIT(command !== "debug" && command !== "archive");

    switch (CACHE_STATIC.COMMAND) {
        case "init": {
            const title = $.PLAY.Title(ORIGIN.name + " : Initialize", 500);
            await FETCH.FetchDocs();
            await title;
            const setupInit = await FETCH.VerifySetupStruct();
            if (!setupInit.started) {
                $.POST(await FETCH.Initialize());
            } else if (setupInit.proceed) {
                $.POST((await FETCH.VerifyConfigure(true)).report);
            } else {
                $.POST(setupInit.report);
            }
            break;
        }
        case "debug": {
            await execute(`${CACHE_STATIC.PROJECT_NAME} : Debug ${CACHE_STATIC.WATCH ? "Watch" : "Build"}`);
            break;
        }
        case "preview": {
            await execute(`${CACHE_STATIC.PROJECT_NAME} : Preview ${CACHE_STATIC.WATCH ? "Watch" : "Build"}`);
            break;
        }
        case "publish": {
            await execute(`${CACHE_STATIC.PROJECT_NAME} : Publishing for Production`);
            break;
        }
        // case "archive": {
        //     await execute(STATIC_CACHE.PACKAGE + " : Split for Components");
        //     break;
        // }
        // case "install": {
        //     $.POST("\n" + $.MOLD.secondary.Section("Installing Portables"));

        //     const verifyStructResult = await FETCH.VerifySetupStruct();
        //     if (verifyStructResult.proceed) {
        //         const verifyConfigsResult = await FETCH.VerifyConfigure(true);
        //         if (verifyConfigsResult.status) {
        //             const fetchResult = await FETCH.FetchStatics(argument);
        //             await fileman.write.bulk(fetchResult.SaveFiles);
        //             $.POST($.MOLD.secondary.Footer("Installation status", fetchResult.Status));
        //         } else { $.POST(verifyConfigsResult.report); };
        //     } else { $.POST(verifyStructResult.report); };
        //     break;
        // }
        default: {
            await FETCH.FetchDocs();

            $.POST(
                $.MOLD.std.Chapter(`${CACHE_STATIC.COMMAND} @ ` + ORIGIN.version,
                    DOCUMENTS.MARKDOWN.alerts.content ? [DOCUMENTS.MARKDOWN.alerts.content] : []
                )
            );

            $.POST(
                $.MOLD.secondary.Section(
                    "Available Commands",
                    $$.Props.std(ORIGIN.commandList),
                    $.list.primary.Bullets
                ),
            );

            $.POST(
                $.MOLD.secondary.Section(
                    "Agreements",
                    $$.Props.std(Object.fromEntries(Object.values(DOCUMENTS.AGREEMENT).map((i) => [i.title, i.path]))),
                    $.list.primary.Bullets
                ),
            );

            $.POST(
                $.MOLD.secondary.Section(
                    "References",
                    $$.Props.std(Object.fromEntries(Object.values(DOCUMENTS.MARKDOWN).map((i) => [i.title, i.path]))),
                    $.list.primary.Bullets
                ),
            );

            $.POST(
                $.MOLD.secondary.Section("For more information visit : " + ORIGIN.website),
            );
        }
    }
}

export default commander;
