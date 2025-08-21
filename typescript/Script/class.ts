import SCRIPTPARSE from "./file.js";
import {
	TagFn_ReplaceMain,
	TagFn_ReplaceStyle,
	TagFn_ReplaceAttach,
	TagFn_ReplaceStencil,
} from "./tag.js";
import fileman from "../fileman.js";

import $ from "../Shell/main.js";
import FILING from "../Data/filing.js";
import STYLEPARSE from "../Style/parse.js";
import { INDEX } from "../Data/init.js";
import { RAW, CACHE } from "../Data/cache.js";
import { t_Data_FILING, t_FileManifest, t_ProxyMap } from "../types.js";
import { t_Actions } from "./value.js";

export default class C_Proxy {
	source = "";
	target = "";
	stylesheetPath = "";
	sourceStylesheet = "";
	targetStylesheet = "";
	stylesheetContent = "";

	extensions: string[] = [];
	extnsProps: Record<string, string[]> = {};
	fileCache: Record<string, t_Data_FILING> = {};

	constructor({
		source,
		target,
		stylesheet,
		extensions,
		fileContents,
		stylesheetContent,
	}: t_ProxyMap) {
		extensions["xcss"] = [];

		this.source = source;
		this.target = target;
		this.stylesheetPath = stylesheet;
		this.sourceStylesheet = fileman.path.join(source, stylesheet);
		this.targetStylesheet = fileman.path.join(target, stylesheet);

		this.extnsProps = extensions;
		this.extensions = Object.keys(extensions);
		this.stylesheetContent = stylesheetContent || '';
		Object.entries(fileContents || {}).forEach(([filePath, fileContent]) => this.SaveFile(filePath, fileContent));
	}

	SaveFile(filePath: string, fileContent: string) {

		if (this.fileCache[filePath]) {
			this.fileCache[filePath].styleData.usedIndexes.forEach((index) => INDEX.DISPOSE(index));
			Object.keys(this.fileCache[filePath].styleData.styleGlobals).forEach(key => INDEX.DISPOSE(Number(key)));
			delete this.fileCache[filePath];
		}

		const file = FILING(this.target, this.source, filePath, fileContent, false);
		const fileStyle = file.styleData;
		this.fileCache[file.filePath] = file;

		const sciptResponse = SCRIPTPARSE(file, this.extnsProps[file.extension]);
		fileStyle.classGroups.push(...sciptResponse.classesList);

		sciptResponse.stylesList.forEach((style) => {
			const IndexMap = style.scope === "global" ? fileStyle.styleGlobals : style.scope === "local" ? fileStyle.styleLocals : {};
			const skeletonMap = style.scope === "global" ? file.manifest.global : style.scope === "local" ? file.manifest.global : {};
			const response = STYLEPARSE.TAGSTYLE(style, file, IndexMap);

			if (style.scope === "essential") {
				file.styleData.attachments.push(...response.attachments);
				file.styleData.essentials.push(...response.essentials);
			} else if (response.isOriginal) {
				skeletonMap[response.selector] = response.metadata;
				file.styleData.usedIndexes.add(response.index);
			}

			file.styleData.errors.push(...response.errors);
		});

		Object.assign(CACHE.GlobalsStyle2Index, file.styleData.styleGlobals);
		Object.assign(file.manifest.file, { group: "target", id: RAW.WorkPath + file.targetPath });
	}

	Accumulator() {
		let localCount = 0, globalCount = 0;
		const C: {
			report: string[],
			errors: string[],
			indexes: number[],
			styleMap: t_FileManifest[],
			essentials: [string, string | object][],
			attachments: Set<string>,
		} = {
			report: [],
			errors: [],
			indexes: [],
			styleMap: [],
			essentials: [],
			attachments: new Set(),
		}, styleGlobals: Record<string, number> = {};

		C.styleMap.push({ file: { group: "stylesheet", id: RAW.WorkPath + this.targetStylesheet, }, global: {}, local: {}, });

		Object.values(this.fileCache).forEach((file) => {
			C.indexes.push(...Object.values(file.styleData.styleLocals));
			C.indexes.push(...Object.values(file.styleData.styleGlobals));
			const fileLocalCount = Object.keys(file.styleData.styleLocals).length;
			localCount += fileLocalCount;
			const fileGlobalCount = Object.keys(file.styleData.styleGlobals).length;
			globalCount += fileGlobalCount;
			if (fileLocalCount + fileGlobalCount) {
				C.report.push($.MOLD.tertiary.Topic(
					`[ ${fileLocalCount} Local + ${fileGlobalCount} Global ] : ${file.targetPath}`, [
					...$.list.secondary.Entries(Object.keys(file.styleData.styleGlobals)),
					$.canvas.divider.mid,
					...$.list.text.Entries(Object.keys(file.styleData.styleLocals)),
				]));
			}
			Object.values(file.styleData.styleLocals).forEach((index) => {
				const InStash = INDEX.IMPORT(index);
				if (InStash.declarations.length > 1) {
					C.errors.push($.MOLD.failed.List("Multiple declarations: " + InStash.selector, InStash.declarations, $.list.text.Bullets));
				}
			});

			C.styleMap.push(file.manifest);
			C.errors.push(...file.styleData.errors);
			C.essentials.push(...file.styleData.essentials);
			Object.assign(styleGlobals, file.styleData.styleGlobals);
			file.styleData.attachments.forEach((bind) => C.attachments.add(bind));
		});

		Object.values(styleGlobals).forEach((index) => {
			const InStash = INDEX.IMPORT(index);
			if (InStash.declarations.length > 1) {
				C.errors.push($.MOLD.failed.List("Multiple declarations: " + InStash.selector, InStash.declarations, $.list.text.Bullets));
			}
		});

		C.report.unshift($.MOLD.primary.Section(`PROXY : [ ${localCount} Locals + ${globalCount} Globals ] : ${this.target} -> ${this.source}`));
		return C;
	}


	RenderFiles(attachments = new Set<string>(), Command: t_Actions, OrderedClassList: Record<string, Record<number, string>> = {}) {
		Object.values(this.fileCache).forEach((file) => {
			file.midway = SCRIPTPARSE(
				file,
				this.extnsProps[file.extension],
				Command,
				attachments,
				{
					Local: file.styleData.styleLocals,
					Global: CACHE.GlobalsStyle2Index,
					Native: CACHE.NativeStyle2Index,
					Library: CACHE.LibraryStyle2Index,
					Portable: CACHE.PortableStyle2Index
				},
				OrderedClassList
			).scribed;
		});
	}

	SummonFiles(
		SaveFiles: Record<string, string> = {},
		stylesheet: string,
		MainBlock: string,
		StyleBlock: string,
		AttachBlock: string,
		StencilBlock: string,
	) {
		const tagSummons = [this.sourceStylesheet];

		Object.values(this.fileCache).forEach((file) => {
			if (file.extension !== "xcss") {
				let fileContent = file.midway;
				if (file.styleData.hasMainTag) { fileContent = TagFn_ReplaceMain(fileContent, MainBlock); }
				if (file.styleData.hasStyleTag) { fileContent = TagFn_ReplaceStyle(fileContent, StyleBlock); }
				if (file.styleData.hasAttachTag) { fileContent = TagFn_ReplaceAttach(fileContent, AttachBlock); }
				if (file.styleData.hasStencilTag) { fileContent = TagFn_ReplaceStencil(fileContent, StencilBlock); }
				tagSummons.push(file.sourcePath);
				SaveFiles[file.sourcePath] = fileContent;
			}
		});

		SaveFiles[this.sourceStylesheet] = stylesheet;
		return tagSummons;
	}

	GetTracks() {
		const classTracks: number[][] = [];

		Object.values(this.fileCache).forEach((file) => {
			file.styleData.classGroups.forEach((group) => {
				const indexGroup = group.reduce((indexAcc: number[], className) => {
					const index =
						(CACHE.PortableStyle2Index[className] || 0) +
						(CACHE.LibraryStyle2Index[className] || 0) +
						(CACHE.GlobalsStyle2Index[className] || 0) +
						(CACHE.NativeStyle2Index[className] || 0) +
						(file.styleData.styleLocals[className] || 0);
					if (index) { indexAcc.push(index); }
					return indexAcc;
				}, []);
				if (indexGroup.length) { classTracks.push(indexGroup); }
			});
		});
		return classTracks;
	}

	UpdateCache() {
		Object.entries(this.fileCache).forEach(([file, cache]) => {
			this.SaveFile(file, cache.content);
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
