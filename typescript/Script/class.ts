import * as _Config from "../type/config.js";
import * as _File from "../type/file.js";
// import * as _Style from "../type/style.js";
import * as _Script from "../type/script.js";
// import * as _Cache from "../type/cache.js";
// import * as _Support from "../type/support.js";

import SEEK from "./file.js";
import fileman from "../fileman.js";

import $ from "../shell/main.js";
import FILING from "../data/filing.js";
import STYLEPARSE from "../style/parse.js";
import { INDEX } from "../data/action.js";
import * as CACHE from "../data/cache.js";
import Use from "../utils/main.js";

function stringReplacementByPosition(master_string: string, ranges: [number, number][], replace_with: string) {
	const result = ranges.reduce((modified, [from, to]) => {
		modified = master_string.slice(0, from) + replace_with + master_string.slice(to);
		return modified;
	}, master_string);
	return result;
};

export default class C_Proxy {
	source = "";
	target = "";
	stylesheetPath = "";
	sourceStylesheet = "";
	targetStylesheet = "";
	stylesheetContent = "";

	label: string;
	extensions: string[];
	extnsProps: Record<string, string[]>;
	fileCache: Record<string, _File.Storage> = {};

	constructor({
		source,
		target,
		stylesheet,
		extensions,
		fileContents,
		stylesheetContent,
	}: _Config.ProxyStorage, identifier: string) {
		extensions["xcss"] = [];

		this.source = source;
		this.target = target;
		this.stylesheetPath = stylesheet;
		this.sourceStylesheet = fileman.path.join(source, stylesheet);
		this.targetStylesheet = fileman.path.join(target, stylesheet);

		this.label = identifier;
		this.extnsProps = extensions;
		this.extensions = Object.keys(extensions);
		this.stylesheetContent = stylesheetContent || '';
		Object.entries(fileContents || {}).forEach(([filePath, fileContent], index) => {
			this.SaveFile(filePath, fileContent, `_${identifier}_${Use.string.enCounter(index + 768)}_`);
		});
	}

	SaveFile(filePath: string, fileContent: string, label: string) {

		if (this.fileCache[filePath]) {
			this.fileCache[filePath].styleData.usedIndexes.forEach((index) => INDEX.DISPOSE(index));
			Object.keys(this.fileCache[filePath].styleData.globalClasses).forEach(key => INDEX.DISPOSE(Number(key)));
			delete this.fileCache[filePath];
		}

		const FILE = FILING("target", filePath, fileContent, this.target, this.source, label);
		this.fileCache[FILE.filePath] = FILE;

		const ParseResponse = SEEK(FILE, this.extnsProps[FILE.extension]);
		FILE.styleData.classesList.push(...ParseResponse.classesList);
		FILE.styleData.attachments.push(...ParseResponse.attachments);

		ParseResponse.stylesList.forEach((style) => {
			const IndexMap =
				style.scope === "GLOBAL" ? FILE.styleData.globalClasses
					: style.scope === "LOCAL" ? FILE.styleData.localClasses
						: style.scope === "PUBLIC" ? FILE.styleData.publicClasses
							: {};

			const skeletonMap =
				style.scope === "LOCAL" ? FILE.manifest.local
					: style.scope === "GLOBAL" ? FILE.manifest.global
						: style.scope === "PUBLIC" ? FILE.manifest.global
							: {};

			const response = STYLEPARSE.TAGSTYLE(style, FILE, IndexMap);
			const classdata = INDEX.FETCH(response.identity.index);

			if (classdata.declarations.length === 1) {
				skeletonMap[response.classname] = classdata.metadata;
				FILE.styleData.usedIndexes.add(response.identity.index);
			}

			FILE.manifest.errors.push(...response.errors);
			FILE.manifest.diagnostics.push(...response.diagnostics);
		});

		Object.assign(CACHE.DYNAMIC.GlobalClass__Index, FILE.styleData.globalClasses);
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

		Cumulates.report.push($.MAKE($.tag.H2(`PROXY : ${this.target} -> ${this.source}`)));
		Cumulates.fileManifests[fileman.path.join(CACHE.STATIC.WorkPath, this.targetStylesheet)] = {
			refer: {
				group: "STYLESHEET",
				id: fileman.path.join(CACHE.STATIC.WorkPath, this.targetStylesheet),
			},
			public: {},
			global: {},
			local: {},
			errors: [],
			diagnostics: [],
		};

		Object.values(this.fileCache).forEach((file) => {
			Cumulates.errors.push(...file.manifest.errors);
			Cumulates.diagnostics.push(...file.manifest.diagnostics);
			Cumulates.fileManifests[file.manifest.refer.id] = file.manifest;
			Object.assign(Cumulates.globalClasses, file.styleData.globalClasses);
			Object.assign(Cumulates.publicClasses, file.styleData.publicClasses);


			const localIndexes = Object.values(file.styleData.localClasses);
			const publicIndexes = Object.values(file.styleData.publicClasses);
			const globalIndexes = Object.values(file.styleData.globalClasses);

			Cumulates.usedIndexes.push(...localIndexes);
			Cumulates.usedIndexes.push(...publicIndexes);
			Cumulates.usedIndexes.push(...globalIndexes);

			if (localIndexes.length + publicIndexes.length + globalIndexes.length) {
				Cumulates.report.push(
					$.MAKE(
						$.tag.H4(`[ ${localIndexes.length} L + ${publicIndexes.length} G + ${globalIndexes.length} P ] : ${file.targetPath}`, $.preset.tertiary),
						[
							...$.list.Catalog(Object.keys(file.styleData.globalClasses)),
							$.canvas.divider.mid,
							...$.list.Catalog(Object.keys(file.styleData.localClasses)),
							$.canvas.divider.mid,
							...$.list.Catalog(Object.keys(file.styleData.publicClasses)),
						]
					)
				);
			}


			[...localIndexes, ...publicIndexes, ...globalIndexes,].forEach(
				(index) => {
					const InStash = INDEX.FETCH(index);
					if (InStash.declarations.length > 1) {
						Cumulates.errors.push(
							$.MAKE(
								$.tag.H5("Multiple declarations: " + InStash.selector, $.preset.failed),
								InStash.declarations,
								[$.list.Bullets, 0, $.preset.failed]
							)
						);
						Cumulates.diagnostics.push({
							error: "Multiple declarations: " + InStash.selector,
							source: InStash.declarations,
						});
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
			filedata.midway = SEEK(
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
				fileContent = stringReplacementByPosition(
					fileContent,
					file.styleData.stapleTagReplaces,
					AttachBlock
				);
				fileContent = stringReplacementByPosition(
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
		Object.entries(this.fileCache).forEach(([filepath, filedata]) => {
			this.SaveFile(filepath, filedata.content, filedata.label);
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
