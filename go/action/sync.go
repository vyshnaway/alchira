package action

import (
	_json_ "encoding/json"
	_cache_ "main/cache"
	_compose_ "main/compose"
	_fileman_ "main/fileman"
	_types_ "main/types"
	_maps_ "maps"
	_os_ "os"
	_slices_ "slices"
	_sync_ "sync"
)

func Sync_RootDocs() {
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

func Sync_SaveVendors(vendor_source string) {

	newdata := false
	vendor_path := _cache_.Path_Json["vendors"].Path

	content := func() string {

		if r, e := _fileman_.Read_File(vendor_source, true); e == nil {
			newdata = true
			return r
		}
		if r, e := _fileman_.Read_File(_cache_.Root.Url.Vendors+vendor_source, true); e == nil {
			newdata = true
			return r
		}
		if r, e := _fileman_.Read_File(vendor_path, false); e == nil {
			return r
		}

		return ""
	}()

	vendor_table := _compose_.Type_VendorTable{}
	if err := _json_.Unmarshal([]byte(content), &vendor_table); err == nil {
		_compose_.Vendor_Save(vendor_table)
		if newdata {
			_fileman_.Write_File(vendor_path, content)
		}
	}
}

func Sync_ProxyMapDirs(proxyMaps []_types_.Config_ProxyMap) map[string]_types_.Config_ProxyStorage {
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
	var mut _sync_.Mutex

	var wg _sync_.WaitGroup
	for id, pm := range static_proxystorage {
		wg.Add(1)
		go func(proxyid string, proxystorage _types_.Config_ProxyStorage) {
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
			mut.Lock()
			defer mut.Unlock()
			static_proxystorage[proxyid] = proxystorage
			defer wg.Done()
		}(id, pm)
	}

	wg.Wait()
	return static_proxystorage
}
