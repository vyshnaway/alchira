import CSSBLOCK from "./block.js";

import $ from "../Shell/main.js";
import Use from "../Utils/main.js";
import HASHRULE from "../hash-rules.js";
import { RAW, CACHE } from "../Data/cache.js";
import { INDEX } from "../Data/init.js";
import { t_Data_FILING, t_SelectorData, t_SelectorMeta, t_TagRawStyle } from "../types.js";

function xtylemerge(classList: string[] = []) {
	const result: Record<string, object> = {}, preBinds: string[] = [], postBinds: string[] = [];
	classList.reduce((res, className) => {
		const index =
			(CACHE.PortableStyle2Index[className] || 0) +
			(CACHE.LibraryStyle2Index[className] || 0) +
			(CACHE.NativeStyle2Index[className] || 0);
		if (index) {
			const found = INDEX.IMPORT(index);
			preBinds.push(...found.preBinds);
			postBinds.push(...found.postBinds);
			res = Use.object.multiMerge([result, found.object], true);
		}
		return res;
	}, {});
	return { result, preBinds, postBinds };
}

function SCANNER(content: string, initial: string, sourceSelector: string, forceImportant = false) {
	const scanned = CSSBLOCK(content);
	const variables = scanned.variables;
	const merged = xtylemerge(scanned.compose);
	const preBinds = [...merged.preBinds, ...scanned.preBinds.filter(bind => bind[0] !== "/")],
		postBinds = [...merged.postBinds, ...scanned.postBinds.filter(bind => bind[0] !== "/")];

	const object = Use.object.deepMerge(merged.result, {
		...Object.entries(scanned.atProps).map(([propKey, propValue]) => {
			return [propKey, RAW.WATCH ? `${propValue}/* ${initial} ${sourceSelector} */` : propValue];
		}),
		...Object.entries(scanned.properties).map(([propKey, propValue]) => {
			return [propKey, (
				(RAW.WATCH ? `${propValue}/* ${initial} ${sourceSelector} */` : propValue) +
				(forceImportant ? ' !important' : '')
			)];
		}),
	});

	for (const selector in scanned.allBlocks) {
		const result = SCANNER(scanned.allBlocks[selector], initial, sourceSelector + " -> " + selector);
		Object.assign(variables, result.variables);
		preBinds.push(...result.preBinds);
		postBinds.push(...result.postBinds);
		object[selector] = result.object;
	}

	return { object, preBinds, postBinds, variables };
}

function CSSCANNER(content: string, initial = "") {
	const variables: Record<string, string> = {}, preBinds: string[] = [], postBinds: string[] = [];
	const scanned = CSSBLOCK(content, true);
	const object: [string, string | object][] = scanned.XatProps;

	scanned.XallBlocks.forEach(([key, value]) => {
		const result = SCANNER(value, initial, key);
		Object.assign(variables, result.variables);
		preBinds.push(...result.preBinds);
		postBinds.push(...result.postBinds);
		object.push([key, result.object]);
	});

	return { object, preBinds, postBinds, variables };
}

function CSSLIBRARY(fileDatas: t_Data_FILING[] = [], initial = "", forPortable = false) {
	const selectorList: string[] = [],
		selectors: Record<string, number> = {},
		indexSkeleton: Record<string, t_SelectorMeta> = {};
	const IndexMap = forPortable ? CACHE.PortableStyle2Index : CACHE.LibraryStyle2Index;

	fileDatas.forEach((source) => {
		const { stamp, filePath, metaFront, content, group } = source;

		CSSBLOCK(content, true).XallBlocks.forEach(([selector, OBJECT]) => {
			const declaration = source.sourcePath;
			const stampSelector = stamp + Use.string.normalize(selector, [], ["\\", "."]);
			const scannedStyle = SCANNER(OBJECT, initial + " : " + filePath + " ||", selector,);
			const preBinds = scannedStyle.preBinds, postBinds = scannedStyle.postBinds;
			const object = { "": scannedStyle.object };

			const index = (IndexMap[stampSelector] || 0) + (selectors[stampSelector] || 0);
			if (index) {
				const InStash = INDEX.IMPORT(index);
				InStash.declarations.push(declaration);
			} else {
				const metadata: t_SelectorMeta = {
					info: [],
					variables: scannedStyle.variables,
					skeleton: Use.object.skeleton(object),
					declarations: [] // manifest and cross-check declarations assigned later from parse.js
				};
				const identity = INDEX.DECLARE({
					portable: forPortable ? source.fileName : "",
					scope: group,
					selector,
					object,
					metadata,
					preBinds: forPortable ? preBinds.map(bind => stamp + bind) : preBinds,
					postBinds: forPortable ? postBinds.map(bind => stamp + bind) : postBinds,
					metaClass: metaFront + "_" + Use.string.normalize(stampSelector, [], [], ["$", "/"]),
					declarations: [declaration], // only library declarations
					snippets: {
						Main: '',
						Style: '',
						Attach: '',
						Stencil: '',
					}
				} as t_SelectorData);

				source.styleData.usedIndexes.add(identity.index);
				selectors[stampSelector] = identity.index;
				indexSkeleton[stampSelector] = metadata;
				selectorList.push(stampSelector);
			}
		});
	});
	for (const selector in selectors) {
		IndexMap[selector] = selectors[selector];
	}

	return { indexMetaCollection: indexSkeleton, selectorList };
}

function TAGSTYLE(
	raw: t_TagRawStyle,
	file: t_Data_FILING,
	IndexMap: Record<string, number> = {},
) {
	const
		object: Record<string, Record<string, object>> = {},
		preBinds: string[] = [],
		postBinds: string[] = [],
		errors: string[] = [],
		essentials: [string, string | object][] = [];

	const forPortable = file.group === "xtyling";
	const xcope = (forPortable ? "" : raw.scope).toUpperCase();
	const xelector = raw.selector === "" ? "" : file.stamp + raw.selector;
	const declaration = `${file.filePath}:${raw.rowMarker}:${raw.columnMarker}`;
	const metaClass = `${xcope}${file.metaFront}\\:${raw.rowMarker}\\:${raw.columnMarker}_${Use.string.normalize(raw.selector, [], [], forPortable ? ["$", "/"] : ["$"])}`;
	const variables = {};

	for (const subSelector in raw.styles) {
		const query = HASHRULE.RENDER(subSelector, declaration, forPortable);
		if (!query.status) { errors.push(query.error); }
		const styleObj = SCANNER(raw.styles[subSelector], `${raw.scope.toUpperCase()} : ${file.filePath} ||`, `${raw.selector} => ${subSelector}`);

		postBinds.push(...styleObj.postBinds);
		preBinds.push(...styleObj.preBinds);
		Object.assign(variables, styleObj.variables);

		if (Object.keys(styleObj).length) {
			if (raw.selector === "") {
				if (query.rule === "") {
					if (query.subSelector !== "") {
						object[query.subSelector] = styleObj.object;
					}
				} else {
					if (query.subSelector === "") {
						object[query.rule] = styleObj.object;
					} else {
						if (!object[query.rule]) { object[query.rule] = {}; }
						object[query.rule][query.subSelector] = styleObj.object;
					}
				}
			} else {
				if (!object[query.rule]) { object[query.rule] = {}; }
				if (query.subSelector === "") { object[query.rule] = { ...object[query.rule], ...styleObj.object }; }
				else { object[query.rule]["&" + query.subSelector] = styleObj.object; }
			}
		}
	}

	let isOriginal = false;
	let identity = { index: 0, class: '' };
	if (raw.selector === "") {
		essentials.push(...Object.entries(object).map(([k, v]) => [
			RAW.WATCH ? `${k} /* ${declaration} */` : k,v
		]) as [string, string | object][]);
	} else {
		const index = (IndexMap[xelector] || 0) + (CACHE.LibraryStyle2Index[xelector] || 0) + (CACHE.GlobalsStyle2Index[xelector] || 0);
		if (index) {
			const InStash = INDEX.IMPORT(index);
			InStash.metadata.declarations.push(declaration);
			if (CACHE.LibraryStyle2Index[xelector] || 0) {
				errors.push($.MOLD.failed.List("Multiple declarations: " + InStash.selector, InStash.metadata.declarations, $.list.text.Bullets));
			}
		} else {
			const declarations = [declaration];
			isOriginal = true;
			identity = INDEX.DECLARE({
				portable: forPortable ? file.fileName : "",
				scope: raw.scope,
				selector: raw.selector,
				object,
				metadata: {
					info: raw.comments,
					variables: variables,
					skeleton: Use.object.skeleton(object),
					declarations
				},
				preBinds: forPortable ? preBinds.map(bind => file.stamp + "$/" + bind) : preBinds,
				postBinds: forPortable ? postBinds.map(bind => file.stamp + "$/" + bind) : postBinds,
				metaClass,
				declarations,
				snippets: {
					Main: '',
					Style: '',
					Attach: '',
					Stencil: '',
				}
			});
			IndexMap[xelector] = identity.index;
		}
	}

	return {
		selector: xelector,
		index: identity.index,
		isOriginal,
		essentials,
		postBinds,
		preBinds,
		metadata: INDEX.IMPORT(identity.index).metadata,
		errors,
	};
}

export default {
	CSSLIBRARY,
	CSSCANNER,
	TAGSTYLE
};
