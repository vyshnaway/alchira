package assemble

import (
	_action_ "main/action"
	_cache_ "main/cache"
	S "main/shell"
	_types_ "main/types"
	_utils_ "main/utils"
)

func Orchestrate(
	command string,
	argument string,
	rootpath string,
	workpath string,
	projectname string,
	projectversion string,
	package_essential _types_.Refer_PackageEssential,
) {
	_cache_.Static.Command = command
	_cache_.Static.Argument = argument
	_cache_.Static.VERBOSE = command == "debug"
	_cache_.Static.WATCH = (command == "debug" || command == "preview") && (argument == "-w")
	_cache_.Static.ProjectName = _utils_.String_Filter(projectname, []rune{}, []rune{}, []rune{})
	_cache_.Static.ProjectVersion = projectversion
	_action_.Setup_Environment(rootpath, workpath, package_essential)
	S.Canvas.Initialize(!_cache_.Static.WATCH, true, 2)

	core_at_version := _cache_.Root.Name + " @ " + _cache_.Root.Version
	var flagmode string
	if _cache_.Static.WATCH {
		flagmode = "Watch"
	} else {
		flagmode = "Build"
	}

	switch _cache_.Static.Command {
	case "init":
		{
			S.Animate.Title(`${APP_VERSION} : Initialize`, 500, 16)
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
		}
	case "debug":
		{
			orchestrate(core_at_version + " : Debug " + flagmode)
		}
	case "preview":
		{
			orchestrate(core_at_version + " : Preview " + flagmode)
		}
	case "publish":
		{
			orchestrate(core_at_version + " : " + "Publishing for Production")
		}
	case "install":
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
	case "version":
		{
			S.Post(core_at_version)
		}
	default:
		{
			// _action_.()

			S.Post(S.MAKE(
				S.Tag.H1(core_at_version, S.Preset.None),
				[]string{
					_cache_.Sync["Markdown"]["Alerts"].Content,
					// $$.ListRecord("Available Commands", CACHE.ROOT.commands),
					// $$.ListRecord("Agreements", Object.fromEntries(Object.values(CACHE.SYNC.AGREEMENT).map((i) => [i.title, i.path]))),
					// $$.ListRecord("References", Object.fromEntries(Object.values(CACHE.SYNC.MARKDOWN).map((i) => [i.title, i.path]))),
					// $.tag.H4("For more information visit : " + CACHE.ROOT.url.Site, $.preset.tertiary)
				},
			))
		}
	}
}
