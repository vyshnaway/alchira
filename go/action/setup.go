package action

import (
	"main/cache"
	"main/fileman"
	"main/types"
	"maps"
	"reflect"
	"strings"
)

func Setup_Tweaks(tweaks map[string]any) {
	maps.Copy(cache.Static.Tweaks, cache.Root.Tweaks)

	for key, val := range cache.Root.Tweaks {
		if reflect.TypeOf(tweaks[key]) == reflect.TypeOf(val) {
			cache.Static.Tweaks[key] = tweaks[key]
		}
	}
}

func Setup_Environment(rootpath string, workpath string, package_essential types.Refer_PackageEssential) {

	cache.Static.RootPath = rootpath
	cache.Static.WorkPath = workpath

	if len(package_essential.Name) > 0 {
		cache.Root.Name = package_essential.Name
	}
	if len(package_essential.Version) > 0 {
		cache.Root.Version = package_essential.Version
	}
	// if len(package_essential.Bin) > 0 {
	// 	cache.Root.Bin = package_essential.Bin
	// }

	for group_name, group_sources := range cache.Path {
		if group_name == "blueprint" {
			for id, source := range group_sources {
				source.Path = fileman.Path_Join(append([]string{rootpath}, source.Frags...)...)
				cache.Path[group_name][id] = source
			}
		} else {
			for id, source := range group_sources {
				source.Path = fileman.Path_Join(append([]string{workpath}, source.Frags...)...)
				cache.Path[group_name][id] = source
			}
		}
	}

	for group_name, group_sources := range cache.Sync {
		for id, source := range group_sources {
			source.Path = fileman.Path_Join(append([]string{rootpath}, source.Frags...)...)
			cache.Path[group_name][id] = source
		}
	}

	cdn := cache.Root.Url.Docs + "version/" + strings.Split(cache.Root.Version, ".")[0] + "/"
	for group_name, group_sources := range cache.Sync {
		for id, source := range group_sources {
			source.Url = cdn + source.Url
			source.Path = fileman.Path_Join(append([]string{rootpath}, source.Frags...)...)
			cache.Path[group_name][id] = source
		}
	}
}
