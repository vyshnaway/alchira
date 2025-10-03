package assemble

import (
	_cache_ "main/cache"
	S "main/shell"
)

type execute_Step_enum int

const (
	execute_Step_Initialize execute_Step_enum = iota
	execute_Step_VerifySetupStruct
	execute_Step_ReadRootCss
	execute_Step_ReadLibraries
	execute_Step_VerifyConfigs
	execute_Step_ReadPackages
	execute_Step_ReadTargets
	execute_Step_ReadHashrule
	execute_Step_ProcessXtylesFolder
	execute_Step_ProcessProxyFolders
	execute_Step_GenerateFinals
	execute_Step_Publish
	execute_Step_WatchFolders
)

func orchestrate(heading string) {
	step := execute_Step_Initialize
	// initial_heading := "Initial Build"
	// save_files = map[string]string{}
	// report := ""
	// targets := []string{}
	// report_next := false
	// statics_fetched = false
	// stopWatcher: null | (() => void) = null
	// SaveAction: Promise<void> | null = null

	for {
		switch step {
		case execute_Step_Initialize:
			{
				S.Post(S.MAKE(S.Tag.H1(heading, S.Preset.None), []string{}))
			}
		case execute_Step_VerifySetupStruct:
			{
				//                 const verifyStructResult = await FETCH.VerifySetupStruct();
				//                 if (!verifyStructResult.proceed) {
				//                     report = verifyStructResult.report;
				//                     step = "WatchFolders";
				//                     break;
				//                 } else {
				//                     report = "";
				//                 }
			}
		case execute_Step_ReadRootCss:
			{
				//                 await FETCH.SaveRootCss();
			}
		case execute_Step_ReadLibraries:
			{
				//                 await FETCH.SaveLibraries();
			}
		case execute_Step_VerifyConfigs:
			{
				//                 const verifyConfigsResult = await FETCH.VerifyConfigs(!staticsFetched);
				//                 if (!verifyConfigsResult.status) {
				//                     report = verifyConfigsResult.report;
				//                     step = "WatchFolders";
				//                     break;
				//                 } else {
				//                     staticsFetched = true;
				//                     report = "";
				//                 }
			}
		case execute_Step_ReadPackages:
			{
				//                 await FETCH.SaveExternals();
			}
		case execute_Step_ReadTargets:
			{
				//                 await FETCH.SaveTargets();
			}
		case execute_Step_ReadHashrule:
			{
				//                 const hashruleAnalysis = await FETCH.SaveHashrule();
				//                 if (!hashruleAnalysis.status) {
				//                     report = hashruleAnalysis.report;
				//                     step = "WatchFolders";
				//                     break;
				//                 } else { report = ""; }
			}

		case execute_Step_ProcessXtylesFolder:
			{
				//                 SMITH.UpdateXtylesFolder();
			}
		case execute_Step_ProcessProxyFolders:
			{
				//                 SMITH.SaveToTarget();
			}
		case execute_Step_GenerateFinals:
			{
				//                 const response = await SMITH.Generate();
				//                 save_files = response.SaveFiles;
				//                 report = response.ConsoleReport;
			}
		case execute_Step_Publish:
			{
				//                 if (Object.keys(save_files).length) {
				//                     if (SaveAction) {
				//                         await SaveAction;
				//                     }
				//                     SaveAction = fileman.write.bulk(save_files);
				//                 }
				//                 if (reportNext) {
				//                     reporter(heading, targets, report);
				//                     reportNext = false;
				//                 };
			}

		case execute_Step_WatchFolders:
			{
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
			}
		}

		if !_cache_.Static.WATCH {
			break
		}
	}

	//	if (stopWatcher) {
	//	    stopWatcher();
	//	    stopWatcher = null;
	//	} else {
	//
	//	    $.POST(report);
	//	}
}
