import * as _Config from "../type/config.js";
import * as _File from "../type/file.js";
import * as _Style from "../type/style.js";
import * as _Script from "../type/script.js";
// import * as _Cache from "../type/cache.js";
// import * as _Support from "../type/support.js";

import $ from "../shell/main.js";
import Use from "../utils/main.js";
import NARRATOR from "./file.js";
import Filing from "../data/filing.js";
import Fileman from "../fileman.js";
import StyleParse from "../style/parse.js";

import * as $$ from "../shell.js";
import * as INDEX from "../data/index.js";
import * as CACHE from "../data/cache.js";


export default class C_Proxy {
	source = "";
	target = "";
	stylesheet = "";
	sourceStylesheet = "";
	targetStylesheet = "";
	stylesheetContent = "";

	label: string;
	extensions: string[];
	extnsProps: Record<string, string[]>;
	fileCache: Record<string, _File.Storage> = {};

	constructor(
		{
			source,
			target,
			stylesheet,
			extensions,
			fileContents,
			stylesheetContent,
		}: _Config.ProxyStorage,
		label: string
	) {
		extensions["xcss"] = [];

		this.source = source;
		this.target = target;
		this.stylesheet = stylesheet;
		this.sourceStylesheet = Fileman.path.join(source, stylesheet);
		this.targetStylesheet = Fileman.path.join(target, stylesheet);

		this.label = label;
		this.extnsProps = extensions;
		this.extensions = Object.keys(extensions);
		this.stylesheetContent = stylesheetContent || '';
		Object.entries(fileContents || {}).forEach(([filePath, fileContent], index) => {
			this.SaveFile(filePath, fileContent, index);
		});
	}

	SaveFile(filePath: string, fileContent: string, fileIndex: number = Object.keys(this.fileCache).length) {

		if (this.fileCache[filePath]) {
			this.fileCache[filePath].styleData.usedIndexes.forEach((index) => INDEX.DISPOSE(index));
			Object.keys(this.fileCache[filePath].styleData.globalClasses).forEach(key => INDEX.DISPOSE(Number(key)));
			delete this.fileCache[filePath];
		}

		const FILE = Filing(
			"target",
			filePath,
			fileContent,
			this.target,
			this.source,
			`${this.label}_${Use.string.enCounter(fileIndex)}`);
		this.fileCache[FILE.filePath] = FILE;

		const ParseResponse = NARRATOR(FILE, this.extnsProps[FILE.extension]);
		FILE.styleData.classTracks.push(...ParseResponse.classesList);
		FILE.styleData.attachments.push(...ParseResponse.attachments);

		ParseResponse.stylesList.forEach((tagStyle) => {
			if (tagStyle.selector === "") {
				const E = $$.GenerateError("Classname missing declaration scope.", [`${FILE.targetPath}:${tagStyle.rowIndex}:${tagStyle.colIndex}`]);
				FILE.manifesting.errors.push(E.error);
				FILE.manifesting.diagnostics.push(E.diagnostic);
			} else {
				const IndexMap =
					tagStyle.scope === _Style._Type.GLOBAL ? FILE.styleData.globalClasses
						: tagStyle.scope === _Style._Type.LOCAL ? FILE.styleData.localClasses
							: tagStyle.scope === _Style._Type.PUBLIC ? FILE.styleData.publicClasses
								: {};

				const skeletonMap =
					tagStyle.scope === _Style._Type.LOCAL ? FILE.manifesting.local
						: tagStyle.scope === _Style._Type.GLOBAL ? FILE.manifesting.global
							: tagStyle.scope === _Style._Type.PUBLIC ? FILE.manifesting.global
								: {};

				const response = StyleParse.TagStyleScanner(tagStyle, FILE, IndexMap);
				const classdata = INDEX.FETCH(response.index);

				if (classdata.declarations.length === 1) {
					skeletonMap[response.classname] = classdata.metadata;
					FILE.styleData.usedIndexes.add(response.index);
				}

				FILE.manifesting.errors.push(...response.errors);
				FILE.manifesting.diagnostics.push(...response.diagnostics);
			}
		});

		Object.assign(CACHE.CLASS.Global___Index, FILE.styleData.globalClasses);
		Object.assign(FILE.manifesting.lookup, { group: "target", id: FILE.targetPath });
		FILE.midway = ParseResponse.stream;
	}

	Accumulator() {
		const Cumulates: _Script.Cumulated = {
			report: [],
			globalClasses: {},
			publicClasses: {},
			fileManifests: {}
		};

		Cumulates.fileManifests[this.targetStylesheet] = {
			lookup: {
				id: this.targetStylesheet,
				type: "STYLESHEET",
			},
			public: {},
			global: {},
			local: {},
			errors: [],
			diagnostics: [],
		};


		Cumulates.report.push($.tag.H2(`PROXY : ${this.target} -> ${this.source}`, $.preset.primary, $.style.AS_Bold));

		Object.values(this.fileCache).forEach((file) => {
			Cumulates.fileManifests[file.manifesting.lookup.id] = file.manifesting;

			Object.assign(Cumulates.globalClasses, file.styleData.globalClasses);
			Object.assign(Cumulates.publicClasses, file.styleData.publicClasses);

			const localKeys = Object.keys(file.styleData.localClasses);
			const publicKeys = Object.keys(file.styleData.publicClasses);
			const globalKeys = Object.keys(file.styleData.globalClasses);

			if (localKeys.length + globalKeys.length + publicKeys.length) {
				Cumulates.report.push(
					$.MAKE(
						$.tag.H6(file.targetPath, $.preset.tertiary),
						[
							...$.list.Catalog(localKeys, 0, $.preset.text),
							...$.list.Catalog(globalKeys, 0, $.preset.primary),
							...$.list.Catalog(publicKeys, 0, $.preset.primary, $.style.AS_Bold),
						]
					)
				);
			}
		});

		return Cumulates;
	}

	GetTracks(classTracks: number[][] = [], attachments: number[] = []) {

		Object.values(this.fileCache).forEach((filedata) => {
			filedata.styleData.attachments.forEach((attchment) => {
				const found = INDEX.FIND(attchment, true, filedata.styleData.localClasses);
				if (found.index) { attachments.push(found.index); }
			});

			filedata.styleData.classTracks.forEach((group) => {
				const indexGroup = group.reduce((indexAcc, className) => {
					const found = INDEX.FIND(className, true, filedata.styleData.localClasses);
					if (found.index) {
						indexAcc.push(found.index);
						attachments.push(found.index);
						INDEX.FETCH(found.index).attachments.forEach(attchment => {
							const i = INDEX.FIND(attchment, true, filedata.styleData.localClasses).index;
							if (i) { attachments.push(i); }
						});
					}
					return indexAcc;
				}, [] as number[]);

				if (indexGroup.length) { classTracks.push(indexGroup); }
			});
		});

		return { classTracks, attachments };
	}


	SyncClassnames(action: _Script._Actions) {
		Object.values(this.fileCache).forEach((filedata) => {
			filedata.scratch = NARRATOR(
				filedata,
				this.extnsProps[filedata.extension],
				action,
			).stream;
		});
	}

	SummonFiles(
		SaveFiles: Record<string, string> = {},
		stylesheet: string,
		summonBlock: string,
		stapleBlock: string
	) {
		SaveFiles[this.sourceStylesheet] = stylesheet;

		Object.values(this.fileCache).forEach((data) => {
			if (data.extension !== "xcss") {
				let fromPos = 0;
				SaveFiles[data.sourcePath] = data.styleData.tagReplacements.reduce((A, [elid, pos]) => {
					switch (elid) {
						case CACHE.ROOT.customElements.staple:
							A += data.scratch.slice(fromPos, pos) + stapleBlock;
							break;
						case CACHE.ROOT.customElements.summon:
							A += data.scratch.slice(fromPos, pos) + summonBlock;
							break;
						case CACHE.ROOT.customElements.style:
							A += data.scratch.slice(fromPos, pos);
							break;
						default:
							A += data.scratch.slice(fromPos);
					};
					fromPos = pos;
					return A;
				}, "");
				data.scratch = "";
			}
		});
	}

	UpdateCache() {
		Object.entries(this.fileCache).forEach(([filepath, filedata], index) => {
			this.SaveFile(filepath, filedata.content, index);
		});
	}

	ClearFiles() {
		Object.entries(this.fileCache).forEach(([filePath, fileCache]) => {
			fileCache.styleData.usedIndexes.forEach((index) => INDEX.DISPOSE(index));
			delete this.fileCache[filePath];
		});
	}


	// ComponentSpilt(timeStamp: string) {
	// 	const SavedFiles: Record<string, string> = {};

	// 	Object.values(this.fileCache).forEach((file) => {
	// 		if (file.extension === "xcss") {
	// 			if (Object.keys(SavedFiles).includes(file.targetPath)) { SavedFiles[file.targetPath] += "\n\n" + file.content; }
	// 		} else if (Object.keys(file.styleData.styleGlobals).length) {
	// 			SavedFiles[file.targetPath] = SCRIPTPARSE(file, this.extnsProps[file.extension], "artifact").scribed;
	// 			SavedFiles[file.targetPath + ".xcss"] = Object.entries(file.styleData.styleGlobals).reduce((A, [selector, index]) => {
	// 				const inStash = INDEX.IMPORT(index);
	// 				const object = inStash.object;
	// 				const bindStack = FORGE.bindIndex(new Set(inStash.preBinds), new Set(inStash.postBinds));
	// 				A.push(...GenerateXtyleBlock(selector, object, bindStack.preBindsList, bindStack.postBindsList));
	// 				return A;
	// 			}, [`## ${timeStamp}`]).join("\n");
	// 		}
	// 	});

	// 	return SavedFiles;
	// }
}
