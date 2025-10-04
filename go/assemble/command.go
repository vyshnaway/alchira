package assemble

import (
	_action_ "main/action"
	_cache_ "main/cache"
	S "main/shell"
	_types_ "main/types"
	_utils_ "main/utils"
	X "main/xhell"
	_strings_ "strings"
	_sync_ "sync"
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

	core_at_version := _strings_.ToUpper(_cache_.Root.Name) + " @ " + _cache_.Root.Version
	var flagmode string
	if _cache_.Static.WATCH {
		flagmode = "Watch"
	} else {
		flagmode = "Build"
	}

	switch _cache_.Static.Command {
	case "init":
		{
			var wg _sync_.WaitGroup
			wg.Add(2)
			go func() { _action_.Fetch_Docs(); wg.Done() }()
			go func() { S.Animate.Title(core_at_version+" : Initialize", 1000, 1); wg.Done() }()
			wg.Wait()
			status, setup_report := _action_.Verify_Setup()
			switch status {
			case _action_.Verify_Setup_Status_Uninitialized:
				_action_.Initialize()
			case _action_.Verify_Setup_Status_Initialized:
				report, _ := _action_.Verify_Configs(true)
				S.Post(report)
			case _action_.Verify_Setup_Status_Verified:
				S.Post(setup_report)
			}
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
		{
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
		}
	case "version":
		{
			S.Post(core_at_version)
		}
	default:
		{
			_action_.Fetch_Docs()

			S.Post(S.MAKE(
				S.Tag.H1(core_at_version, S.Preset.None),
				[]string{_strings_.Trim(_cache_.Sync["references"]["alerts"].Content, "\t\r\n ")},
			))

			S.Post(S.MAKE("", []string{
				X.List_Record("Available Commands", _cache_.Root.Commands),
				X.List_Record("Agreements", func() map[string]string {
					res := map[string]string{}
					for _, data := range _cache_.Sync["agreements"] {
						res[data.Title] = data.Path
					}
					return res
				}()),
				X.List_Record("References", func() map[string]string {
					res := map[string]string{}
					for _, data := range _cache_.Sync["references"] {
						res[data.Title] = data.Path
					}
					return res
				}()),
				S.Tag.H4("For more information visit : "+_cache_.Root.Url.Site, S.Preset.Tertiary),
			}))
		}
	}
}
