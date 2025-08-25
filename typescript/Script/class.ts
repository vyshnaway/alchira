import SCRIPTPARSE from "./file.js";
import {
	TagFn_ReplaceStyle,
	TagFn_ReplaceStaple,
	TagFn_ReplaceStencil,
} from "./file.js";
import fileman from "../fileman.js";

import $ from "../Shell/main.js";
import FILING from "../Data/filing.js";
import STYLEPARSE from "../Style/parse.js";
import { INDEX } from "../Data/action.js";
import { CACHE_STATIC, CACHE_DYNAMIC } from "../Data/cache.js";
import { t_FILE_Storage, t_ProxyMapStatic, t_Cumulates } from "../types.js";
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
	fileCache: Record<string, t_FILE_Storage> = {};

	constructor({
		source,
		target,
		stylesheet,
		extensions,
		fileContents,
		stylesheetContent,
	}: t_ProxyMapStatic) {
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
			Object.keys(this.fileCache[filePath].styleData.globalClasses).forEach(key => INDEX.DISPOSE(Number(key)));
			delete this.fileCache[filePath];
		}

		const FILE = FILING("target", filePath, fileContent, this.target, this.source);
		this.fileCache[FILE.filePath] = FILE;

		const ParseResponse = SCRIPTPARSE(FILE, this.extnsProps[FILE.extension]);
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
			const classdata = INDEX.IMPORT(response.identity.index);

			if (classdata.declarations.length === 1) {
				skeletonMap[response.classname] = classdata.metadata;
				FILE.styleData.usedIndexes.add(response.identity.index);
			}

			FILE.manifest.errors.push(...response.errors);
			FILE.manifest.diagnostics.push(...response.diagnostics);
		});

		Object.assign(CACHE_DYNAMIC.GlobalClass__Index, FILE.styleData.globalClasses);
		Object.assign(FILE.manifest.refer, { group: "target", id: CACHE_STATIC.WorkPath + FILE.targetPath });
	}

	Accumulator() {
		const Cumulates: t_Cumulates = {
			report: [],
			errors: [],
			diagnostics: [],
			usedIndexes: [],
			globalClasses: {},
			publicClasses: {},
			fileManifests: {}
		};

		Cumulates.report.push($.MOLD.primary.Section(`PROXY : ${this.target} -> ${this.source}`));
		Cumulates.fileManifests[fileman.path.join(CACHE_STATIC.WorkPath, this.targetStylesheet)] = {
			refer: {
				group: "STYLESHEET",
				id: fileman.path.join(CACHE_STATIC.WorkPath, this.targetStylesheet),
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
				Cumulates.report.push($.MOLD.tertiary.Topic(
					`[ ${localIndexes.length} L + ${publicIndexes.length} G + ${globalIndexes.length} P ] : ${file.targetPath}`, [
					...$.list.secondary.Entries(Object.keys(file.styleData.globalClasses)),
					$.canvas.divider.mid,
					...$.list.text.Entries(Object.keys(file.styleData.localClasses)),
					$.canvas.divider.mid,
					...$.list.text.Entries(Object.keys(file.styleData.publicClasses)),
				]));
			}


			[...localIndexes, ...publicIndexes, ...globalIndexes,].forEach(
				(index) => {
					const InStash = INDEX.IMPORT(index);
					if (InStash.declarations.length > 1) {
						Cumulates.errors.push($.MOLD.failed.List(
							"Multiple declarations: " + InStash.selector,
							InStash.declarations,
							$.list.text.Bullets
						));
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
					const index =
						(CACHE_DYNAMIC.PackageClass_Index[className] || 0) +
						(CACHE_DYNAMIC.LibraryClass_Index[className] || 0) +
						(CACHE_DYNAMIC.ArchiveClass_Index[className] || 0) +
						(CACHE_DYNAMIC.GlobalClass__Index[className] || 0) +
						(file.styleData.localClasses[className] || 0);
					if (index) {
						indexAcc.push(index);
						attachments.add(index);
						INDEX.IMPORT(index).attachments.forEach(attchment => {
							const index =
								(CACHE_DYNAMIC.PackageClass_Index[attchment] || 0) +
								(CACHE_DYNAMIC.LibraryClass_Index[attchment] || 0) +
								(CACHE_DYNAMIC.ArchiveClass_Index[attchment] || 0) +
								(CACHE_DYNAMIC.GlobalClass__Index[attchment] || 0) +
								(file.styleData.localClasses[attchment] || 0);
							if (index) {
								attachments.add(index);
							}
						});
					}
					return indexAcc;
				}, [] as number[]);

				if (indexGroup.length) { classTracks.push(indexGroup); }
			});

			file.styleData.attachments.forEach((className) => {
				const index =
					(CACHE_DYNAMIC.PackageClass_Index[className] || 0) +
					(CACHE_DYNAMIC.LibraryClass_Index[className] || 0) +
					(CACHE_DYNAMIC.ArchiveClass_Index[className] || 0) +
					(CACHE_DYNAMIC.GlobalClass__Index[className] || 0) +
					(file.styleData.localClasses[className] || 0);
				if (index) {
					attachments.add(index);
				}
			});
		});

		return { classTracks, attachments };
	}


	RenderFiles(Command: t_Actions, OrderedClassList: Record<string, Record<number, string>> = {}) {
		Object.values(this.fileCache).forEach((file) => {
			file.midway = SCRIPTPARSE(
				file,
				this.extnsProps[file.extension],
				Command,
				{
					Local: file.styleData.localClasses,
					Global: CACHE_DYNAMIC.GlobalClass__Index,
					Native: CACHE_DYNAMIC.ArchiveClass_Index,
					Library: CACHE_DYNAMIC.LibraryClass_Index,
					Portable: CACHE_DYNAMIC.PackageClass_Index
				},
				OrderedClassList
			).scribed;
		});
	}

	SummonFiles(
		SaveFiles: Record<string, string> = {},
		stylesheet: string,
		StyleBlock: string,
		AttachBlock: string,
		StencilBlock: string,
	) {
		const tagSummons = [this.sourceStylesheet];

		Object.values(this.fileCache).forEach((file) => {
			if (file.extension !== "xcss") {
				let fileContent = file.midway;
				if (file.styleData.hasStyleTag) { fileContent = TagFn_ReplaceStyle(fileContent, StyleBlock); }
				if (file.styleData.hasAttachTag) { fileContent = TagFn_ReplaceStaple(fileContent, AttachBlock); }
				if (file.styleData.hasStencilTag) { fileContent = TagFn_ReplaceStencil(fileContent, StencilBlock); }
				tagSummons.push(file.sourcePath);
				SaveFiles[file.sourcePath] = fileContent;
			}
		});

		SaveFiles[this.sourceStylesheet] = stylesheet;
		return tagSummons;
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
