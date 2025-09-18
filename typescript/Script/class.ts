import * as _Config from "../type/config.js";
import * as _File from "../type/file.js";
import * as _Style from "../type/style.js";
import * as _Script from "../type/script.js";
// import * as _Cache from "../type/cache.js";
// import * as _Support from "../type/support.js";

import $ from "../shell/main.js";
import Use from "../utils/main.js";
import NARRATOR from "./file.js";
import Fileman from "../fileman.js";
import Filing from "../data/filing.js";
import RENDER from "../style/render.js";
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
		extensions[CACHE.ROOT.extension] = [];

		this.source = source;
		this.target = target;
		this.stylesheet = stylesheet;
		this.sourceStylesheet = Fileman.path.join(source, stylesheet);
		this.targetStylesheet = Fileman.path.join(target, stylesheet);

		this.label = label;
		this.extnsProps = extensions;
		this.extensions = Object.keys(extensions);
		this.stylesheetContent = stylesheetContent || '';
		Object.entries(fileContents || {}).forEach(([filePath, fileContent], index) => this.SaveFile(filePath, fileContent, index));
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
		if (FILE.extension !== CACHE.ROOT.extension) {
			FILE.styleData.classTracks.push(...ParseResponse.classesList);
			FILE.styleData.attachments.push(...ParseResponse.attachments);
		}

		ParseResponse.stylesList.forEach((tagStyle) => {
			if (tagStyle.symclasses.length === 0) {
				const E = $$.GenerateError("Symclass missing declaration scope.", [`${FILE.targetPath}:${tagStyle.rowIndex}:${tagStyle.colIndex}`]);
				FILE.manifesting.errors.push(E.error);
				FILE.manifesting.diagnostics.push(E.diagnostic);
			} else if (tagStyle.symclasses.length > 1) {
				const E = $$.GenerateError("Multiple Symclasses declaration scope.", [`${FILE.targetPath}:${tagStyle.rowIndex}:${tagStyle.colIndex}`]);
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
					skeletonMap[response.symclass] = classdata.metadata;
					FILE.styleData.usedIndexes.add(response.index);
				}

				FILE.manifesting.errors.push(...response.errors);
				FILE.manifesting.diagnostics.push(...response.diagnostics);
			}
		});

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
						// [
						// 	...$.list.Catalog(localKeys, 0, $.preset.text),
						// 	...$.list.Catalog(globalKeys, 0, $.preset.primary),
						// 	...$.list.Catalog(publicKeys, 0, $.preset.primary, $.style.AS_Bold),
						// ],
						$.list.Catalog([
							...localKeys,
							...globalKeys,
							...publicKeys
						], 0, $.preset.primary, $.style.AS_Bold)
					)
				);
			}
		});

		return Cumulates;
	}

	GetTracks(classTracks: number[][] = [], attachments: number[] = []) {

		Object.values(this.fileCache).forEach((filedata) => {
			filedata.styleData.attachments.forEach((attchment) => {
				const found = INDEX.FIND(attchment, filedata.styleData.localClasses);
				if (found.index) { attachments.push(found.index); }
			});

			filedata.styleData.classTracks.forEach((group) => {
				const indexGroup = group.reduce((indexAcc, className) => {
					const found = INDEX.FIND(className, filedata.styleData.localClasses);
					if (found.index) {
						indexAcc.push(found.index);
						attachments.push(found.index);
						INDEX.FETCH(found.index).attachments.forEach(attchment => {
							const i = INDEX.FIND(attchment, filedata.styleData.localClasses).index;
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

	GetExports() {
		const exports: Record<string, _Style.ExportStyle> = {};

		Object.values(this.fileCache).forEach((filedata) => {
			Object.values(filedata.styleData.publicClasses).forEach((pubindex) => {
				const exporting = RENDER.Artifact(pubindex);
				exports[exporting.symclass] = exporting;
				INDEX.FETCH(pubindex).attachments.forEach(attchment => {
					const subindex = INDEX.FIND(attchment, filedata.styleData.localClasses).index;
					if (subindex) {
						const subexporting = RENDER.Artifact(subindex);
						exporting.attachments.push(subexporting.symclass);
						exports[subexporting.symclass] = subexporting;
					}
				});
			});
		});

		return exports;
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
		styleBlock: string,
		summonBlock: string,
		stapleBlock: string,
	) {
		SaveFiles[this.sourceStylesheet] = stylesheet;

		Object.values(this.fileCache).forEach((data) => {
			if (data.extension !== CACHE.ROOT.extension) {
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
							A += data.scratch.slice(fromPos, pos) + styleBlock;
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
}
