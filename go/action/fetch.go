package action

import (
	_cache_ "main/cache"
	_fileman_ "main/fileman"
	_types_ "main/types"
	_maps_ "maps"
	_os_ "os"
	_slices_ "slices"
	_sync_ "sync"
)

func Fetch_Docs() {
	var wg _sync_.WaitGroup
	var mut _sync_.Mutex

	for item_name, item := range _cache_.Sync_Agreements {
		wg.Add(1)
		func() {
			content, err := _fileman_.Sync_File(item.Url, item.Path)
			mut.Lock()
			item.Content = content
			if err == nil {
				_cache_.Sync_Agreements[item_name] = item
			}
			mut.Unlock()
			wg.Done()
		}()
	}

	for item_name, item := range _cache_.Sync_References {
		wg.Add(1)
		func() {
			content, err := _fileman_.Sync_File(item.Url, item.Path)
			mut.Lock()
			item.Content = content
			if err == nil {
				_cache_.Sync_References[item_name] = item
			}
			mut.Unlock()
			wg.Done()
		}()
	}

	wg.Wait()
}

// ProxyMapSync synchronizes proxy map data
func ProxyMapSync(proxyMaps []_types_.Config_ProxyMap) map[string]_types_.Config_ProxyStorage {
	static_proxystorage := make(map[string]_types_.Config_ProxyStorage)
	for _, p := range proxyMaps {
		static_proxystorage[p.Target] = _types_.Config_ProxyStorage{
			Source:              p.Source,
			Target:              p.Target,
			Stylesheet:          p.Stylesheet,
			Extensions:          p.Extensions,
			Filepath_to_Content: make(map[string]string),
			StylesheetContent:   "",
		}
	}

	var wg _sync_.WaitGroup
	for _, p := range static_proxystorage {
		wg.Add(1)
		go func(proxystorage _types_.Config_ProxyStorage) {
			proxystorage.Extensions[_cache_.Root.Extension] = []string{}
			fileContents, err := _fileman_.Sync_Bulk(
				proxystorage.Target,
				proxystorage.Source,
				_slices_.Collect(_maps_.Keys(proxystorage.Extensions)),
				[]string{_cache_.Root.Extension},
				[]string{proxystorage.Stylesheet},
			)
			if err == nil && len(fileContents) > 0 {
				proxystorage.Filepath_to_Content = fileContents
				if content, err := _os_.ReadFile(_fileman_.Path_Join(proxystorage.Target, proxystorage.Stylesheet)); err == nil {
					proxystorage.StylesheetContent = string(content)
				}
			}
			defer wg.Done()
		}(p)
	}

	wg.Wait()
	return static_proxystorage
}

func Fetch_Statics(vendor_source string) {
	// $.TASK("Loading vendor-prefixes");

	// const PrefixObtained = await (async function () {
	// 	const result1 = await FILEMAN.read.json(vendorSource, true);
	// 	if (result1.status) { return result1.data; };

	// 	const result2 = await FILEMAN.read.json(CACHE.ROOT.url.Prefixes + vendorSource, true);
	// 	if (result2.status) { return result2.data; };

	// 	const result3 = await FILEMAN.read.json(CACHE.PATH.blueprint.prefixes.path, false);
	// 	if (result3.status) { return result3.data; };

	// 	return {};
	// })() as _Cache.PREFIX;
	// await FILEMAN.write.json(CACHE.PATH.blueprint.prefixes.path, PrefixObtained);

	// const PrefixRead: _Cache.PREFIX = {
	// 	attributes: {},
	// 	pseudos: {},
	// 	values: {},
	// 	atrules: {},
	// 	classes: {},
	// 	elements: {}
	// };

	// for (const key in PrefixRead) {
	// 	const typedKey = key as keyof _Cache.PREFIX;
	// 	const valueFromObtained = PrefixObtained[typedKey];
	// 	if (typedKey === 'values') {
	// 		PrefixRead[typedKey] = valueFromObtained as Record<string, Record<string, Record<string, string>>>;
	// 	} else {
	// 		PrefixRead[typedKey] = valueFromObtained as Record<string, Record<string, string>>;
	// 	}
	// }
	// CACHE.STATIC.Prefix.pseudos = { ...PrefixRead.classes, ...PrefixRead.elements, ...PrefixRead.pseudos };
	// CACHE.STATIC.Prefix.attributes = { ...PrefixRead.attributes };
	// CACHE.STATIC.Prefix.atrules = { ...PrefixRead.atrules };
	// CACHE.STATIC.Prefix.values = { ...PrefixRead.values };
	// ACTION.setVendors();
}
