package target

import (
	
)

// func (This *Class)Accumulator() {
// 	const Cumulates: _Script.Cumulated = {
// 		report: [],
// 		globalClasses: {},
// 		publicClasses: {},
// 		fileManifests: {}
// 	};

// 	Cumulates.fileManifests[this.targetStylesheet] = {
// 		lookup: {
// 			id: this.targetStylesheet,
// 			type: "STYLESHEET",
// 		},
// 		public: {},
// 		global: {},
// 		local: {},
// 		errors: [],
// 		diagnostics: [],
// 	};


// 	Cumulates.report.push($.tag.H2(`PROXY : ${this.target} -> ${this.source}`, $.preset.primary, $.style.AS_Bold));

// 	Object.values(this.fileCache).forEach((file) => {
// 		Cumulates.fileManifests[file.manifesting.lookup.id] = file.manifesting;

// 		Object.assign(Cumulates.globalClasses, file.styleData.globalClasses);
// 		Object.assign(Cumulates.publicClasses, file.styleData.publicClasses);

// 		const localKeys = Object.keys(file.styleData.localClasses);
// 		const publicKeys = Object.keys(file.styleData.publicClasses);
// 		const globalKeys = Object.keys(file.styleData.globalClasses);

// 		if (localKeys.length + globalKeys.length + publicKeys.length) {
// 			Cumulates.report.push(
// 				$.MAKE(
// 					$.tag.H6(file.targetPath, $.preset.tertiary),
// 					// [
// 					// 	...$.list.Catalog(localKeys, 0, $.preset.text),
// 					// 	...$.list.Catalog(globalKeys, 0, $.preset.primary),
// 					// 	...$.list.Catalog(publicKeys, 0, $.preset.primary, $.style.AS_Bold),
// 					// ],
// 					$.list.Catalog([
// 						...localKeys,
// 						...globalKeys,
// 						...publicKeys
// 					], 0, $.preset.primary, $.style.AS_Bold)
// 				)
// 			);
// 		}
// 	});

// 	return Cumulates;
// }

// func (This *Class)GetTracks(classTracks: number[][] = [], attachments: number[] = []) {

// 	Object.values(this.fileCache).forEach((filedata) => {
// 		filedata.styleData.attachments.forEach((attchment) => {
// 			const found = INDEX.FIND(attchment, filedata.styleData.localClasses);
// 			if (found.index) { attachments.push(found.index); }
// 		});

// 		filedata.styleData.classTracks.forEach((group) => {
// 			const indexGroup = group.reduce((indexAcc, className) => {
// 				const found = INDEX.FIND(className, filedata.styleData.localClasses);
// 				if (found.index) {
// 					indexAcc.push(found.index);
// 					attachments.push(found.index);
// 					INDEX.FETCH(found.index).attachments.forEach(attchment => {
// 						const i = INDEX.FIND(attchment, filedata.styleData.localClasses).index;
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
// 	const exports: Record<string, _Style.ExportStyle> = {};

// 	Object.values(this.fileCache).forEach((filedata) => {
// 		Object.values(filedata.styleData.publicClasses).forEach((pubindex) => {
// 			const exporting = RENDER.Artifact(pubindex);
// 			exports[exporting.symclass] = exporting;
// 			INDEX.FETCH(pubindex).attachments.forEach(attchment => {
// 				const subindex = INDEX.FIND(attchment, filedata.styleData.localClasses).index;
// 				if (subindex) {
// 					const subexporting = RENDER.Artifact(subindex);
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
