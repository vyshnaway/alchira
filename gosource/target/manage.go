package target

import (
	_cache_ "main/cache"
	// _fileman_ "main/fileman"
	// _types_ "main/types"
	// _maps_ "maps"
)

func (This *Class)Savefile(filepath string, filecontent string, fileindex int) {

	// if (This.fileCache[filePath]) {
	// 	This.fileCache[filePath].styleData.usedIndexes.forEach((index) => INDEX.DISPOSE(index));
	// 	Object.keys(This.fileCache[filePath].styleData.globalClasses).forEach(key => INDEX.DISPOSE(Number(key)));
	// 	delete This.fileCache[filePath];
	// }

	// const FILE = Filing(
	// 	"target",
	// 	filePath,
	// 	fileContent,
	// 	This.target,
	// 	This.source,
	// 	`${This.label}_${Use.string.enCounter(fileIndex)}`);
	// This.fileCache[FILE.filePath] = FILE;

	// const ParseResponse = NARRATOR(FILE, This.extnsProps[FILE.extension]);
	// if (FILE.extension !== CACHE.ROOT.extension) {
	// 	FILE.styleData.classTracks.push(...ParseResponse.classesList);
	// 	FILE.styleData.attachments.push(...ParseResponse.attachments);
	// }

	// ParseResponse.stylesList.forEach((tagStyle) => {
	// 	if (tagStyle.symclasses.length === 0) {
	// 		const E = $$.GenerateError("Symclass missing declaration scope.", [`${FILE.targetPath}:${tagStyle.rowIndex}:${tagStyle.colIndex}`]);
	// 		FILE.manifesting.errors.push(E.error);
	// 		FILE.manifesting.diagnostics.push(E.diagnostic);
	// 	} else if (tagStyle.symclasses.length > 1) {
	// 		const E = $$.GenerateError("Multiple Symclasses declaration scope.", [`${FILE.targetPath}:${tagStyle.rowIndex}:${tagStyle.colIndex}`]);
	// 		FILE.manifesting.errors.push(E.error);
	// 		FILE.manifesting.diagnostics.push(E.diagnostic);
	// 	} else {
	// 		const IndexMap =
	// 			tagStyle.scope === _Style._Type.GLOBAL ? FILE.styleData.globalClasses
	// 				: tagStyle.scope === _Style._Type.LOCAL ? FILE.styleData.localClasses
	// 					: tagStyle.scope === _Style._Type.PUBLIC ? FILE.styleData.publicClasses
	// 						: {};

	// 		const skeletonMap =
	// 			tagStyle.scope === _Style._Type.LOCAL ? FILE.manifesting.local
	// 				: tagStyle.scope === _Style._Type.GLOBAL ? FILE.manifesting.global
	// 					: tagStyle.scope === _Style._Type.PUBLIC ? FILE.manifesting.global
	// 						: {};

	// 		const response = StyleParse.TagStyleScanner(tagStyle, FILE, IndexMap);
	// 		const classdata = INDEX.FETCH(response.index);

	// 		if (classdata.declarations.length === 1) {
	// 			skeletonMap[response.symclass] = classdata.metadata;
	// 			FILE.styleData.usedIndexes.push(response.index);
	// 		}

	// 		FILE.manifesting.errors.push(...response.errors);
	// 		FILE.manifesting.diagnostics.push(...response.diagnostics);
	// 	}
	// });

	// Object.assign(FILE.manifesting.lookup, { group: "target", id: FILE.targetPath });
	// FILE.midway = ParseResponse.stream;
}


func (This *Class)UpdateCache() {
	index := 1
	for filepath, filedata := range This.FileCache {
		This.Savefile(filepath, filedata.Content, index)
		index++
	}
}

func (This *Class)ClearFiles() {
	for filepath, filedata := range This.FileCache {
		for i := range filedata.StyleData.UsedIndexes {
			_cache_.Index_Dispose(i)
		}
		delete(This.FileCache, filepath)
	}
}