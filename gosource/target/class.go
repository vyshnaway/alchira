package target

import (
	_fmt_ "fmt"
	_action_ "main/action"
	_cache_ "main/cache"
	_script_ "main/script"
	S "main/shell"
	_style_ "main/style"
	_types_ "main/types"
	_utils_ "main/utils"
	X "main/xhell"
	"maps"
	_slices_ "slices"
)

func (This *Class)Accumulator() _types_.Target_Accumulate {
	accumulate := _types_.Target_Accumulate{
		Report:        []string{},
		GlobalClasses: map[string]int{},
		PublicClasses: map[string]int{},
		FileManifests: map[string]_types_.File_LocalManifest{},
	}

	accumulate.FileManifests[This.TargetStylesheet] = _types_.File_LocalManifest{
		Lookup: _types_.File_Lookup{
			Id: This.TargetStylesheet,
			Type: _types_.File_Type_Stylesheet,
			Locale: []string{},
		},
		Local: _types_.File_MetadataMap{},
		Global: _types_.File_MetadataMap{},
		Public: _types_.File_MetadataMap{},
		Errors: []string{},
		Diagnostics: []_types_.Refer_Diagnostic{},
	};

	accumulate.Report = append(
		accumulate.Report, 
		S.Tag.H2("PROXY : "+This.Target+" -> "+This.Source, S.Preset.Primary, S.Style.AS_Bold),
	)

	for _, file := range This.FileCache {
		accumulate.FileManifests[file.Manifest.Lookup.Id] = file.Manifest
		maps.Copy(accumulate.GlobalClasses, file.StyleData.GlobalClasses)
		maps.Copy(accumulate.PublicClasses, file.StyleData.PublicClasses)

		locals := maps.Keys(file.StyleData.LocalClasses)
		publics := maps.Keys(file.StyleData.PublicClasses)
		globals := maps.Keys(file.StyleData.GlobalClasses)

		if (localKeys.length + globalKeys.length + publicKeys.length) {
			// Cumulates.report.push(
			// 	$.MAKE(
			// 		$.tag.H6(file.targetPath, $.preset.tertiary),
			// 		// [
			// 		// 	...$.list.Catalog(localKeys, 0, $.preset.text),
			// 		// 	...$.list.Catalog(globalKeys, 0, $.preset.primary),
			// 		// 	...$.list.Catalog(publicKeys, 0, $.preset.primary, $.style.AS_Bold),
			// 		// ],
			// 		$.list.Catalog([
			// 			...localKeys,
			// 			...globalKeys,
			// 			...publicKeys
			// 		], 0, $.preset.primary, $.style.AS_Bold)
			// 	)
			// );
		}
	}

	return Cumulates;
}

// func (This *Class)GetTracks(classTracks: number[][] = [], attachments: number[] = []) {

// 	Object.values(this.fileCache).forEach((filedata) => {
// 		filedata.styleData.attachments.forEach((attchment) => {
// 			found = INDEX.FIND(attchment, filedata.styleData.localClasses);
// 			if (found.index) { attachments.push(found.index); }
// 		});

// 		filedata.styleData.classTracks.forEach((group) => {
// 			indexGroup = group.reduce((indexAcc, className) => {
// 				found = INDEX.FIND(className, filedata.styleData.localClasses);
// 				if (found.index) {
// 					indexAcc.push(found.index);
// 					attachments.push(found.index);
// 					INDEX.FETCH(found.index).attachments.forEach(attchment => {
// 						i = INDEX.FIND(attchment, filedata.styleData.localClasses).index;
// 						if (i) { attachments.push(i); }
// 					});
// 				}
// 				return indexAcc;
// 			}, [] as number[]);

// 			if (indexGroup.length) { classTracks.push(indexGroup); }
// 		});
// 	});

// 	return { classTracks, attachments };
// }

// func (This *Class)GetExports() {
// 	exports: Record<string, _Style.ExportStyle> = {};

// 	Object.values(this.fileCache).forEach((filedata) => {
// 		Object.values(filedata.styleData.publicClasses).forEach((pubindex) => {
// 			exporting = RENDER.Artifact(pubindex);
// 			exports[exporting.symclass] = exporting;
// 			INDEX.FETCH(pubindex).attachments.forEach(attchment => {
// 				subindex = INDEX.FIND(attchment, filedata.styleData.localClasses).index;
// 				if (subindex) {
// 					subexporting = RENDER.Artifact(subindex);
// 					exporting.attachments.push(subexporting.symclass);
// 					exports[subexporting.symclass] = subexporting;
// 				}
// 			});
// 		});
// 	});

// 	return exports;
// }


// func (This *Class)SyncClassnames(action: _Script._Actions) {
// 	Object.values(this.fileCache).forEach((filedata) => {
// 		filedata.scratch = NARRATOR(
// 			filedata,
// 			this.extnsProps[filedata.extension],
// 			action,
// 		).stream;
// 	});
// }

// func (This *Class)SummonFiles(
// 	SaveFiles: Record<string, string> = {},
// 	stylesheet: string,
// 	styleBlock: string,
// 	summonBlock: string,
// 	stapleBlock: string,
// ) {
// 	SaveFiles[this.sourceStylesheet] = stylesheet;

// 	Object.values(this.fileCache).forEach((data) => {
// 		if (data.extension !== CACHE.ROOT.extension) {
// 			let fromPos = 0;
// 			SaveFiles[data.sourcePath] = data.styleData.tagReplacements.reduce((A, [elid, pos]) => {
// 				switch (elid) {
// 					case CACHE.ROOT.customElements.staple:
// 						A += data.scratch.slice(fromPos, pos) + stapleBlock;
// 						break;
// 					case CACHE.ROOT.customElements.summon:
// 						A += data.scratch.slice(fromPos, pos) + summonBlock;
// 						break;
// 					case CACHE.ROOT.customElements.style:
// 						A += data.scratch.slice(fromPos, pos) + styleBlock;
// 						break;
// 					default:
// 						A += data.scratch.slice(fromPos);
// 				};
// 				fromPos = pos;
// 				return A;
// 			}, "");
// 			data.scratch = "";
// 		}
// 	});
// }
