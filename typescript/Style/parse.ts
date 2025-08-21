import CSSBLOCK from "./block.js";

import $ from "../Shell/main.js";
import Use from "../Utils/main.js";
import HASHRULE from "../hash-rules.js";
import { RAW, CACHE } from "../Data/cache.js";
import { INDEX } from "../Data/init.js";
import { t_Data_FILING, t_SelectorData, t_SelectorMeta, t_TagRawStyle } from "../types.js";

function xtylemerge(classList: string[] = []) {
	const result: Record<string, object> = {}, attachments: string[] = [];
	classList.reduce((res, className) => {
		const index =
			(CACHE.PortableStyle2Index[className] || 0) +
			(CACHE.LibraryStyle2Index[className] || 0) +
			(CACHE.NativeStyle2Index[className] || 0);
		if (index) {
			const found = INDEX.IMPORT(index);
			attachments.push(...found.attachments);
			res = Use.object.multiMerge([result, found.object], true);
		}
		return res;
	}, {});
	return { result, attachments };
}

function SCANNER(content: string, initial: string, sourceSelector: string, forceImportant = false) {
	const scanned = CSSBLOCK(content);
	const variables = scanned.variables;
	const merged = xtylemerge(scanned.assemble);
	const attachments = [...merged.attachments, ...scanned.attachment.filter(attach => attach[0] !== "/")];

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
		attachments.push(...result.attachments);
		object[selector] = result.object;
	}

	return { object, attachments, variables };
}

function CSSCANNER(content: string, initial = "") {
	const variables: Record<string, string> = {}, attachments: string[] = [];
	const scanned = CSSBLOCK(content, true);
	const object: [string, string | object][] = scanned.XatProps;

	scanned.XallBlocks.forEach(([key, value]) => {
		const result = SCANNER(value, initial, key);
		Object.assign(variables, result.variables);
		attachments.push(...result.attachments);
		object.push([key, result.object]);
	});

	return { object, attachments, variables };
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
			const attachments = scannedStyle.attachments;
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
					attachments: forPortable ? attachments.map(attach => stamp + attach) : attachments,
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
		attachments: string[] = [],
		errors: string[] = [],
		essentials: [string, string | object][] = [];

	const forPortable = file.group === "xtyling";
	const xcope = (forPortable ? "" : raw.scope).toUpperCase();
	const xelector = raw.selector === "" ? "" : file.stamp + raw.selector;
	const declaration = `${file.filePath}:${raw.rowIndex}:${raw.colIndex}`;
	const metaClass = `${xcope}${file.metaFront}\\:${raw.rowIndex}\\:${raw.colIndex}_${Use.string.normalize(raw.selector, [], [], forPortable ? ["$", "/"] : ["$"])}`;
	const variables = {};

	for (const subSelector in raw.styles) {
		const query = HASHRULE.RENDER(subSelector, declaration, forPortable);
		if (!query.status) { errors.push(query.error); }
		const styleObj = SCANNER(raw.styles[subSelector], `${raw.scope.toUpperCase()} : ${file.filePath} ||`, `${raw.selector} => ${subSelector}`);

		attachments.push(...styleObj.attachments);
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
			RAW.WATCH ? `${k} /* ${declaration} */` : k, v
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
				attachments: forPortable ? attachments.map(attach => file.stamp + "$/" + attach) : attachments,
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
		attachments,
		metadata: INDEX.IMPORT(identity.index).metadata,
		errors,
	};
}

export default {
	CSSLIBRARY,
	CSSCANNER,
	TAGSTYLE
};
