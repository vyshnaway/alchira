import SCRIPTPARSE from "./file.js";
import { styleTag, snippetTag, stylesheetTag } from "./tag.js";
import FORGE from "../Style/forge.js";

import $ from "../Shell/main.js";
import FILING from "../data-filing.js";
import STYLEPARSE from "../Style/parse.js";
import { INDEX } from "../data-init.js";
import { RAW, CACHE } from "../data-cache.js";
import { generateXtyleBlock as GenerateXtyleBlock } from "../Worker/portable.js";

export default class Proxy {
	source = "";
	target = "";
	stylesheetPath = "";
	sourceStylesheet = "";
	targetStylesheet = "";
	stylesheetContent = "";
	fileCache = {};
	extnsProps = {};
	extensions = [];

	constructor({
		source,
		target,
		stylesheet,
		extensions,
		fileContents,
		stylesheetContent,
	}) {
		extensions["xcss"] = []

		this.source = source;
		this.target = target;
		this.extnsProps = extensions;
		this.stylesheet = stylesheet;
		this.extensions = Object.keys(extensions);
		this.stylesheetContent = stylesheetContent;
		this.sourceStylesheet = source + "/" + stylesheet;
		this.targetStylesheet = target + "/" + stylesheet;
		Object.entries(fileContents).forEach(([filePath, fileContent]) => this.SaveFile(filePath, fileContent));
	}

	SaveFile(filePath, fileContent) {
		if (this.fileCache[filePath]) {
			this.fileCache[filePath].usedIndexes.forEach((index) => INDEX.DISPOSE(index));
			Object.keys(this.fileCache[filePath].styleGlobals).forEach(key => delete CACHE.GlobalsStyle2Index[key])
			delete this.fileCache[filePath];
		}
		const file = FILING(this.target, this.source, filePath, fileContent, false);
		const globalSkeletons = {}, localSkeletons = {};
		this.fileCache[file.filePath] = file;

		const sciptResponse = SCRIPTPARSE(file, this.extnsProps[file.extension]);
		file.classGroups.push(...sciptResponse.classesList)

		sciptResponse.stylesList.forEach((style) => {
			const IndexMap = style.scope === "global" ? file.styleGlobals : style.scope === "local" ? file.styleLocals : {};
			const skeletonMap = style.scope === "global" ? globalSkeletons : style.scope === "local" ? localSkeletons : {};
			const response = STYLEPARSE.TAGSTYLE(style, {
				metaFront: file.metaFront,
				normalPath: file.filePath,
				filePath: file.targetPath,
				fullPath: RAW.WorkPath + file.targetPath
			}, IndexMap);

			if (style.scope === "essential") {
				file.preBinds.push(...response.preBinds);
				file.postBinds.push(...response.postBinds);
				file.essentials.push(...response.essentials)
			} else if (response.isOriginal) {
				skeletonMap[response.selector] = response.metadata;
				file.usedIndexes.add(response.index);
			}

			if (response.errors.length) file.errors.push(...response.errors);
		});
		Object.assign(CACHE.GlobalsStyle2Index, file.styleGlobals);

		Object.assign(file.styleMap, {
			file: { group: "target", id: RAW.WorkPath + file.targetPath },
			global: globalSkeletons,
			local: localSkeletons
		});
	}

	Accumulator() {
		let localCount = 0, globalCount = 0;
		const C = {
			report: [],
			errors: [],
			indexes: [],
			styleMap: [],
			essentials: [],
			preBinds: new Set(),
			postBinds: new Set(),
		}, styleGlobals = {};

		C.styleMap.push({ file: { group: "stylesheet", id: RAW.WorkPath + this.targetStylesheet, }, global: {}, local: {}, });

		Object.values(this.fileCache).forEach((file) => {
			C.indexes.push(...Object.values(file.styleLocals))
			C.indexes.push(...Object.values(file.styleGlobals))
			const fileLocalCount = Object.keys(file.styleLocals).length;
			localCount += fileLocalCount;
			const fileGlobalCount = Object.keys(file.styleGlobals).length;
			globalCount += fileGlobalCount;
			if (fileLocalCount + fileGlobalCount) {
				C.report.push($.MOLD.tertiary.Topic(
					`[ ${fileLocalCount} Local + ${fileGlobalCount} Global ] : ${file.targetPath}`, [
					...$.list.secondary.Entries(Object.keys(file.styleGlobals)),
					$.canvas.divider.mid,
					...$.list.text.Entries(Object.keys(file.styleLocals)),
				]));
			}
			Object.values(file.styleLocals).forEach((index) => {
				const InStash = INDEX.STYLE(index);
				if (InStash.declarations.length > 1)
					C.errors.push($.MOLD.failed.List("Multiple declarations: " + InStash.selector, InStash.declarations, $.list.text.Bullets));
			});

			C.errors.push(...file.errors);
			C.styleMap.push(file.styleMap);
			C.essentials.push(...file.essentials);
			Object.assign(styleGlobals, file.styleGlobals);
			file.preBinds.forEach((bind) => C.preBinds.add(bind));
			file.postBinds.forEach((bind) => C.postBinds.add(bind));
		});

		Object.values(styleGlobals).forEach((index) => {
			const InStash = INDEX.STYLE(index);
			if (InStash.declarations.length > 1)
				C.errors.push($.MOLD.failed.List("Multiple declarations: " + InStash.selector, InStash.declarations, $.list.text.Bullets));
		});

		C.report.unshift($.MOLD.primary.Section(`PROXY : [ ${localCount} Locals + ${globalCount} Globals ] : ${this.target} -> ${this.source}`));
		return C;
	}

	RenderFiles(preBinds = new Set(), postBinds = new Set(), Command = "") {
		Object.values(this.fileCache).forEach((file) => {
			file.midway = SCRIPTPARSE(file, this.extnsProps[file.extension], Command,
				{ preBinds, postBinds },
				{
					Local: file.styleLocals,
					Global: CACHE.GlobalsStyle2Index,
					Native: CACHE.NativeStyle2Index,
					Library: CACHE.LibraryStyle2Index,
					Portable: CACHE.PortableStyle2Index
				},
			).scribed;
		});
	}

	SummonFiles(SaveFiles = {}, stylesheet, styleBlock, stylesheetBlock, snippetBlock) {
		const tagSummons = [this.sourceStylesheet];

		Object.values(this.fileCache).forEach((file) => {
			if (file.extension !== "xcss") {
				let fileContent = file.midway;
				if (file.summon) {
					if(file.hasStyleTag) fileContent = fileContent.replace(styleTag, styleBlock)
					if(file.hasStylesheetTag) fileContent = fileContent.replace(stylesheetTag, stylesheetBlock)
					if(file.hasSnippetTag) fileContent = fileContent.replace(snippetTag, snippetBlock)
					tagSummons.push(file.sourcePath);
				}
				SaveFiles[file.sourcePath] = fileContent;
			}
		});

		SaveFiles[this.sourceStylesheet] = stylesheet;
		return tagSummons;
	}

	ComponentSpilt(timeStamp) {
		const SaveFiles = {};

		Object.values(this.fileCache).forEach((file) => {
			if (file.extension === "xcss") {
				if (Object.keys(SaveFiles).includes(file.targetPath)) SaveFiles[file.targetPath] += "\n\n" + file.content;
			} else if (Object.keys(file.styleGlobals).length) {
				SaveFiles[file.targetPath] = SCRIPTPARSE(file, this.extnsProps[file.extension], "split").scribed;
				SaveFiles[file.targetPath + ".xcss"] = Object.entries(file.styleGlobals).reduce((A, [selector, index]) => {
					const inStash = INDEX.STYLE(index);
					const object = inStash.object;
					const bindStack = FORGE.bindIndex(new Set(inStash.preBinds), new Set(inStash.postBinds));
					A.push(...GenerateXtyleBlock(selector, object, bindStack.preBindsList, bindStack.postBindsList));
					return A;
				}, [`## ${timeStamp}`]).join("\n");
			}
		});

		return SaveFiles
	}

	UpdateCache() {
		Object.entries(this.fileCache).forEach(([file, cache]) => {
			this.SaveFile(file, cache.content);
		});
	}


	LoadTracks() {
		const classTracks = [];

		Object.values(this.fileCache).forEach((file) => {
			file.classGroups.forEach((group) => {
				const indexGroup = group.reduce((indexAcc, className) => {
					const index =
						(CACHE.PortableStyle2Index[className] || 0) +
						(CACHE.LibraryStyle2Index[className] || 0) +
						(CACHE.GlobalsStyle2Index[className] || 0) +
						(file.styleLocals[className] || 0);
					if (index) indexAcc.push(index);
					return indexAcc;
				}, []);
				if (indexGroup.length) classTracks.push(indexGroup);
			});
		});
		return classTracks;
	}

	ClearFiles() {
		Object.entries(this.fileCache).forEach(([filePath, fileCache]) => {
			fileCache.usedIndexes.forEach((index) => INDEX.DISPOSE(index));
			delete this.fileCache[filePath];
		});
	}
}
