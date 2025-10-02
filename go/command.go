package main

// /* eslint-disable no-fallthrough */
// // import * as _Config from "./type/config.js";
// // import * as _File from "./type/file.js";
// // import * as _Style from "./type/style.js";
// // import * as _Script from "./type/script.js";
// // import * as _Cache from "./type/cache.js";
// import * as _Support from "./type/support.js";

// import $ from "./shell/main.js";
// import Use from "./utils/main.js";
// import fileman from "./fileman.js";
// import ARTIFACT from "./artifact.js";

// import * as $$ from "./shell.js";
// import * as SMITH from "./assemble.js";
// import * as FETCH from "./data/fetch.js";
// import * as CACHE from "./data/cache.js";
// import * as EVENT from "./data/watch.js";
// import * as ACTION from "./data/action.js";


// async function execute(chapter: string) {
//     let stopWatcher: null | (() => void) = null;
//     let OutFiles: Record<string, string> = {};
//     let SaveAction: Promise<void> | null = null;
//     let report = "",
//         targets: string[] = [],
//         reportNext = false,
//         step = "Initialize",
//         staticsFetched = false,
//         heading = "Initial Build";

//     do {
//         switch (step) {
//             case "Initialize":
//                 $.POST($.MAKE($.tag.H1(chapter)));
//             case "VerifySetupStruct": {
//                 const verifyStructResult = await FETCH.VerifySetupStruct();
//                 if (!verifyStructResult.proceed) {
//                     report = verifyStructResult.report;
//                     step = "WatchFolders";
//                     break;
//                 } else {
//                     report = "";
//                 }
//             }
//             case "ReadRootCss": {
//                 await FETCH.SaveRootCss();
//             }
//             case "ReadLibraries": {
//                 await FETCH.SaveLibraries();
//             }
//             case "VerifyConfigs": {
//                 const verifyConfigsResult = await FETCH.VerifyConfigs(!staticsFetched);
//                 if (!verifyConfigsResult.status) {
//                     report = verifyConfigsResult.report;
//                     step = "WatchFolders";
//                     break;
//                 } else {
//                     staticsFetched = true;
//                     report = "";
//                 }
//             }
//             case "ReadPackages": {
//                 await FETCH.SaveExternals();
//             }
//             case "ReadTargets": {
//                 await FETCH.SaveTargets();
//             }
//             case "ReadHashrule": {
//                 const hashruleAnalysis = await FETCH.SaveHashrule();
//                 if (!hashruleAnalysis.status) {
//                     report = hashruleAnalysis.report;
//                     step = "WatchFolders";
//                     break;
//                 } else { report = ""; }
//             }


//             case "ProcessXtylesFolder": {
//                 SMITH.UpdateXtylesFolder();
//             }
//             case "ProcessProxyFolders": {
//                 SMITH.SaveToTarget();
//             }
//             case "GenerateFinals": {
//                 const response = await SMITH.Generate();
//                 OutFiles = response.SaveFiles;
//                 report = response.ConsoleReport;
//             }
//             case "Publish": {
//                 if (Object.keys(OutFiles).length) {
//                     if (SaveAction) {
//                         await SaveAction;
//                     }
//                     SaveAction = fileman.write.bulk(OutFiles);
//                 }
//                 if (reportNext) {
//                     reporter(heading, targets, report);
//                     reportNext = false;
//                 };
//             }

//             case "WatchFolders": {
//                 if (CACHE.STATIC.WATCH) {
//                     step = "WatchFolders";
//                 } else {
//                     if (stopWatcher) {
//                         stopWatcher();
//                         stopWatcher = null;
//                     }
//                     break;
//                 }

//                 if (!stopWatcher) {
//                     targets = Object.keys(CACHE.FILES.TARGETDIR);
//                     const targetFolders = [...targets, CACHE.PATH.folder.scaffold.path];
//                     const ignoreFolders = [
//                         CACHE.PATH.folder.autogen.path,
//                         CACHE.PATH.folder.archive.path,
//                     ];
//                     process.on("SIGINT", () => {
//                         if (stopWatcher) {
//                             stopWatcher();
//                             stopWatcher = null;
//                             $.render.write("\n", 2);
//                         }
//                         process.exit();
//                     });
//                     stopWatcher = EVENT.Init(targetFolders, ignoreFolders);
//                     reporter(heading, targets, report);
//                 }

//                 if (EVENT.queue.length > 8) {
//                     step = "Initialize";
//                     EVENT.queue.length = 0;
//                 }
//                 else if (EVENT.queue.length) {
//                     const event = EVENT.pull();
//                     if (!event) { break; }
//                     const pathFromWork = `${event.folder}/${event.filePath}`;

//                     if (event.folder === CACHE.PATH.folder.scaffold.path) {
//                         if (event.action === "add" || event.action === "change") {
//                             switch (pathFromWork) {
//                                 case CACHE.PATH.json.configure.path:
//                                     stopWatcher();
//                                     stopWatcher = null;
//                                     step = "VerifyConfigs";
//                                     break;
//                                 case CACHE.PATH.css.atrules.path:
//                                 case CACHE.PATH.css.constants.path:
//                                 case CACHE.PATH.css.elements.path:
//                                 case CACHE.PATH.css.extends.path:
//                                     await FETCH.SaveRootCss();
//                                     step = "GenerateFinals";
//                                     break;
//                                 case CACHE.PATH.json.hashrule.path:
//                                     step = "ReadHashrule";
//                                     break;
//                                 default:
//                                     if (
//                                         pathFromWork.startsWith(CACHE.PATH.folder.libraries.path)
//                                         && event.extension === "css"
//                                     ) {
//                                         CACHE.STATIC.Libraries_Saved[pathFromWork] = event.fileContent;
//                                     } else if (
//                                         pathFromWork.startsWith(CACHE.PATH.folder.artifacts.path)
//                                         && [CACHE.ROOT.extension, "css", "md"].includes(event.extension)
//                                     ) {
//                                         CACHE.STATIC.Artifacts_Saved[pathFromWork] = event.fileContent;
//                                     }
//                                     step = "ProcessXtylesFolder";
//                             }
//                         } else {
//                             step = "VerifySetupStruct";
//                         }
//                     } else if (event.action === "add" || event.action === "change" || event.action === "unlink") {
//                         SMITH.SaveToTarget(event.action, event.folder, event.filePath, event.fileContent, event.extension);
//                         step = "GenerateFinals";
//                     } else { step = "VerifyConfigs"; }

//                     heading = `[${event.timeStamp}] | ${event.filePath} | [${event.action}]`;
//                     reportNext = true;
//                 }

//                 await new Promise((resolve) => setTimeout(resolve, 20));
//             }
//         }
//     } while (CACHE.STATIC.WATCH);

//     if (stopWatcher) {
//         stopWatcher();
//         stopWatcher = null;
//     } else {
//         $.POST(report);
//     }
// }

// async function commander({
//     command,
//     argument,
//     rootPath,
//     workPath,
//     projectName,
//     projectVersion,
//     rootPackageEssential: originPackageEssential
// }: {
//     command: string,
//     argument: string,
//     rootPath: string,
//     workPath: string,
//     projectName: string,
//     projectVersion: string,
//     rootPackageEssential: _Support.PackageEssential
// }) {
//     CACHE.STATIC.Command = command;
//     CACHE.STATIC.Argument = argument;
//     CACHE.STATIC.DEBUG = command === "debug";
//     CACHE.STATIC.WATCH = (command === "debug" || command === "preview") && argument === "watch";
//     CACHE.STATIC.ProjectName = Use.string.normalize(projectName);
//     CACHE.STATIC.ProjectVersion = projectVersion;
//     ACTION.SetENV(rootPath, workPath, originPackageEssential);
//     $.init(!CACHE.STATIC.WATCH);

//     const APP_VERSION = `${CACHE.ROOT.name} @ ${CACHE.ROOT.version}`;

//     switch (CACHE.STATIC.Command) {
//         case "init": {
//             const title = $.PLAY.Title(`${APP_VERSION} : Initialize`, 500);
//             await FETCH.FetchDocs();
//             await title;
//             const setupInit = await FETCH.VerifySetupStruct();
//             if (!setupInit.started) {
//                 $.POST(await FETCH.Initialize());
//             } else if (setupInit.proceed) {
//                 $.POST((await FETCH.VerifyConfigs(true)).report);
//             } else {
//                 $.POST(setupInit.report);
//             }
//             break;
//         }
//         case "debug": {
//             await execute(`${APP_VERSION} : Debug ${CACHE.STATIC.WATCH ? "Watch" : "Build"}`);
//             break;
//         }
//         case "preview": {
//             await execute(`${APP_VERSION} : Preview ${CACHE.STATIC.WATCH ? "Watch" : "Build"}`);
//             break;
//         }
//         case "publish": {
//             await execute(`${APP_VERSION} : Publishing for Production`);
//             break;
//         }
//         case "install": {
//             $.init(false);
//             $.POST($.tag.H3("Installing Artifacts", $.preset.primary, $.style.AS_Bold));
//             const verifyStructResult = await FETCH.VerifySetupStruct();
//             if (!verifyStructResult.proceed) { $.POST(verifyStructResult.report); break; }
//             const verifyConfigsResult = await FETCH.VerifyConfigs(true);
//             if (!verifyConfigsResult.status) { $.POST(verifyConfigsResult.report); break; }
//             const fetched = await ARTIFACT.FETCH();
//             $.POST(fetched.message);
//             if (fetched.status) {
//                 await fileman.write.bulk(fetched.outs);
//                 $.POST($.tag.H4("Artifacts Updated", $.preset.success, $.style.AS_Bold));
//             } else {
//                 $.POST($.tag.H4("Artifacts not updated due to pending errors", $.preset.failed, $.style.AS_Bold));
//             }
//             break;
//         }
//         default: {
//             await FETCH.FetchDocs();

//             $.POST(
//                 $.MAKE(
//                     $.tag.H1(APP_VERSION),
//                     [
//                         CACHE.SYNC.MARKDOWN.alerts.content,
//                         $$.ListRecord("Available Commands", CACHE.ROOT.commands),
//                         $$.ListRecord("Agreements", Object.fromEntries(Object.values(CACHE.SYNC.AGREEMENT).map((i) => [i.title, i.path]))),
//                         $$.ListRecord("References", Object.fromEntries(Object.values(CACHE.SYNC.MARKDOWN).map((i) => [i.title, i.path]))),
//                         $.tag.H4("For more information visit : " + CACHE.ROOT.url.Site, $.preset.tertiary)
//                     ]
//                 )
//             );
//         }
//     }
// }

// export default commander;
