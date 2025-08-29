import * as _Config from "../type/config.js";
import * as _File from "../type/file.js";
// import * as _Style from "../type/style.js";
import * as _Script from "../type/script.js";
// import * as _Cache from "../type/cache.js";
// import * as _Support from "../type/support.js";


import $ from "../shell/main.js";
import Use from "../utils/main.js";
import Seek from "./file.js";
import Filing from "../data/filing.js";
import Fileman from "../fileman.js";
import StyleParse from "../style/parse.js";

import * as $$ from "../shell.js";
import * as INDEX from "../data/index.js";
import * as CACHE from "../data/cache.js";

function stringInjections(master_string: string, ranges: number[], replace_with: string) {
	const result = ranges.reduce((modified, pos) => {
		modified = master_string.slice(0, pos) + replace_with + master_string.slice(pos);
		return modified;
	}, master_string);
	return result;
};

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
			`_${this.label}_${Use.string.enCounter(fileIndex + 768)}_`);
		this.fileCache[FILE.filePath] = FILE;

		const ParseResponse = Seek(FILE, this.extnsProps[FILE.extension]);
		FILE.styleData.classesList.push(...ParseResponse.classesList);
		FILE.styleData.attachments.push(...ParseResponse.attachments);

		ParseResponse.stylesList.forEach((tagStyle) => {
			if (tagStyle.selector === "") {
				const E = $$.GenerateError("Classname missing declaration scope.", [`${FILE.targetPath}:${tagStyle.rowIndex}:${tagStyle.colIndex}`]);
				FILE.manifest.errors.push(E.error);
				FILE.manifest.diagnostics.push(E.diagnostic);
			} else {
				const IndexMap =
					tagStyle.scope === "GLOBAL" ? FILE.styleData.globalClasses
						: tagStyle.scope === "LOCAL" ? FILE.styleData.localClasses
							: tagStyle.scope === "PUBLIC" ? FILE.styleData.publicClasses
								: {};

				const skeletonMap =
					tagStyle.scope === "LOCAL" ? FILE.manifest.local
						: tagStyle.scope === "GLOBAL" ? FILE.manifest.global
							: tagStyle.scope === "PUBLIC" ? FILE.manifest.global
								: {};

				const response = StyleParse.TAGSTYLE(tagStyle, FILE, IndexMap);
				const classdata = INDEX.FETCH(response.identity.index);

				if (classdata.declarations.length === 1) {
					skeletonMap[response.classname] = classdata.metadata;
					FILE.styleData.usedIndexes.add(response.identity.index);
				}

				FILE.manifest.errors.push(...response.errors);
				FILE.manifest.diagnostics.push(...response.diagnostics);
			}
		});

		Object.assign(CACHE.CLASS.Global__Index, FILE.styleData.globalClasses);
		Object.assign(FILE.manifest.refer, { group: "target", id: CACHE.STATIC.WorkPath + FILE.targetPath });
	}

	Accumulator() {
		const Cumulates: _Script.Cumulates = {
			report: [],
			errors: [],
			diagnostics: [],
			usedIndexes: [],
			globalClasses: {},
			publicClasses: {},
			fileManifests: {}
		};

		Cumulates.fileManifests[Fileman.path.join(CACHE.STATIC.WorkPath, this.targetStylesheet)] = {
			refer: {
				group: "STYLESHEET",
				id: Fileman.path.join(CACHE.STATIC.WorkPath, this.targetStylesheet),
			},
			public: {},
			global: {},
			local: {},
			errors: [],
			diagnostics: [],
		};

		Cumulates.report.push($.tag.H2(`PROXY : ${this.target} -> ${this.source}`, $.preset.primary));

		Object.values(this.fileCache).forEach((file) => {
			Cumulates.errors.push(...file.manifest.errors);
			Cumulates.diagnostics.push(...file.manifest.diagnostics);
			Cumulates.fileManifests[file.manifest.refer.id] = file.manifest;
			Object.assign(Cumulates.globalClasses, file.styleData.globalClasses);
			Object.assign(Cumulates.publicClasses, file.styleData.publicClasses);


			const localKeys = Object.keys(file.styleData.localClasses);
			const publicKeys = Object.keys(file.styleData.publicClasses);
			const globalKeys = Object.keys(file.styleData.globalClasses);
			const localIndexes = Object.values(file.styleData.localClasses);
			const publicIndexes = Object.values(file.styleData.publicClasses);
			const globalIndexes = Object.values(file.styleData.globalClasses);

			Cumulates.usedIndexes.push(...localIndexes);
			Cumulates.usedIndexes.push(...publicIndexes);
			Cumulates.usedIndexes.push(...globalIndexes);

			if (localKeys.length + globalKeys.length + publicKeys.length) {
				Cumulates.report.push(
					$.MAKE(
						$.tag.H5(file.targetPath),
						[
							$.MAKE("", $.list.Catalog(localKeys, 0, $.preset.tertiary)),
							$.MAKE("", $.list.Catalog(globalKeys, 0, $.preset.tertiary)),
							$.MAKE("", $.list.Catalog(publicKeys, 0, $.preset.tertiary)),
						]
					)
				);
			}


			[...localIndexes, ...publicIndexes, ...globalIndexes,].forEach(
				(index) => {
					const InStash = INDEX.FETCH(index);
					const E = $$.GenerateError("Multiple declarations: " + InStash.selector, InStash.declarations);
					if (InStash.declarations.length > 1) {
						Cumulates.errors.push(E.error);
						Cumulates.diagnostics.push(E.diagnostic);
					}
				}
			);

		});



		return Cumulates;
	}

	GetTracks(classTracks: number[][] = [], attachments = new Set<number>()) {

		Object.values(this.fileCache).forEach((file) => {
			file.styleData.classesList.forEach((group) => {

				const indexGroup = group.reduce((indexAcc, className) => {
					const found = INDEX.FIND(className, true, file.styleData.localClasses);
					if (found.index) {
						indexAcc.push(found.index);
						attachments.add(found.index);
						INDEX.FETCH(found.index).attachments.forEach(attchment => {
							const i = INDEX.FIND(attchment, true, file.styleData.localClasses).index;
							if (i) {
								attachments.add(i);
							}
						});
					}
					return indexAcc;
				}, [] as number[]);

				if (indexGroup.length) { classTracks.push(indexGroup); }
			});

			file.styleData.attachments.forEach((attchment) => {
				const found = INDEX.FIND(attchment, true, file.styleData.localClasses);
				if (found.index) {
					attachments.add(found.index);
				}
			});
		});

		return { classTracks, attachments };
	}


	RenderFiles(action: _Script.Actions) {
		Object.values(this.fileCache).forEach((filedata) => {
			filedata.midway = Seek(
				filedata,
				this.extnsProps[filedata.extension],
				action,
			).scribed;
		});
	}

	SummonFiles(
		SaveFiles: Record<string, string> = {},
		stylesheet: string,
		StyleBlock: string,
		AttachBlock: string,
	) {
		const DeployedFiles = [this.sourceStylesheet];

		Object.values(this.fileCache).forEach((file) => {
			if (file.extension !== "xcss") {
				let fileContent = file.midway;
				fileContent = stringInjections(
					fileContent,
					file.styleData.stapleTagReplaces,
					AttachBlock
				);
				fileContent = stringInjections(
					fileContent,
					file.styleData.styleTagReplaces,
					StyleBlock
				);
				DeployedFiles.push(file.sourcePath);
				SaveFiles[file.sourcePath] = fileContent;
			}
		});

		SaveFiles[this.sourceStylesheet] = stylesheet;
		return DeployedFiles;
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
	// 			SavedFiles[file.targetPath] = SCRIPTPARSE(file, this.extnsProps[file.extension], "archive").scribed;
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
