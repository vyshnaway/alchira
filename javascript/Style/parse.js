import CSSBLOCK from "./block.js";

import Use from "../Utils/index.js";
import HASHRULE from "../hash-rules.js";
import { RAW, CACHE } from "../data-cache.js";
import { INDEX } from "../data-set.js";

function xtylemerge(classList = []) {
	let result = {}, preBinds = [], postBinds = [];
	classList.forEach((className) => {
		const index = (CACHE.LibraryStyle2Index[className] || 0);
		if (index) {
			const found = INDEX.STYLE(index);
			preBinds.push(...found.preBinds);
			postBinds.push(...found.postBinds);
			result = Use.object.multiMerge([result, found.object[""]], true);
		}
	});
	return { result, preBinds, postBinds };
}

function SCANNER(content, initial, sourceSelector) {
	const scanned = CSSBLOCK(content);
	const variables = scanned.variables;
	const merged = xtylemerge(scanned.assemble);
	const preBinds = [...merged.preBinds, ...scanned.preBinds.filter(bind => bind[0] !== "/")],
		postBinds = [...merged.postBinds, ...scanned.postBinds.filter(bind => bind[0] !== "/")];

	const object = Use.object.deepMerge(merged.result, {
		...Object.entries(scanned.atProps).reduce((acc, [propKey, propValue]) => {
			acc[propKey] = RAW.WATCH ? `${propValue}/* ${initial} ${sourceSelector} */` : propValue;
			return acc;
		}, {}),
		...Object.entries(scanned.properties).reduce(
			(acc, [propKey, propValue]) => {
				acc[propKey] = RAW.WATCH ? `${propValue}/* ${initial} ${sourceSelector} */` : propValue;
				return acc;
			}, {},),
	});

	for (let selector in scanned.allBlocks) {
		const result = SCANNER(scanned.allBlocks[selector], initial, sourceSelector + " -> " + selector);
		Object.assign(variables, result.variables);
		preBinds.push(...result.preBinds);
		postBinds.push(...result.postBinds);
		object[selector] = result.object;
	}

	return { object, preBinds, postBinds, variables };
}

function CSSCANNER(content, initial = "") {
	const variables = {}, preBinds = [], postBinds = [];
	const scanned = CSSBLOCK(content, true);
	const object = scanned.XatProps;

	scanned.XallBlocks.forEach(([key, value]) => {
		const result = SCANNER(value, initial, key);
		Object.assign(variables, result.variables);
		preBinds.push(...result.preBinds);
		postBinds.push(...result.postBinds);
		object.push([key, result.object]);
	});

	return { object, preBinds, postBinds, variables };
}

function CSSLIBRARY(fileDatas = [], initial = "", forPortable = false) {
	const selectors = {}, indexSkeleton = {}, IndexMap = forPortable ? CACHE.PortableStyle2Index : CACHE.LibraryStyle2Index;

	fileDatas.forEach((source) => {
		const { stamp, filePath, metaFront, content, group } = source;

		CSSBLOCK(content, true).XallBlocks.forEach(([selector, OBJECT]) => {
			const declaration = source.sourcePath;
			const stampSelector = stamp + Use.string.normalize(selector, [], ["\\", "."]);
			const scannedStyle = SCANNER(OBJECT, initial + " : " + filePath + " ||", selector,);
			const preBinds = scannedStyle.preBinds, postBinds = scannedStyle.postBinds;
			const object = { "": scannedStyle.object };
			const metadata = { Info: {}, Variables: scannedStyle.variables, PreBinds: preBinds, PostBinds: postBinds, Skeleton: Use.object.skeleton(object) };

			const index = (IndexMap[stampSelector] || 0) + (selectors[stampSelector] || 0);
			if (index) {
				const InStash = INDEX.STYLE(index);
				InStash.declarations.push(declaration);
			} else {
				const identity = INDEX.DECLARE({
					portable: forPortable ? source.fileName : "",
					scope: group,
					selector,
					object,
					metadata,
					preBinds: forPortable ? preBinds.map(bind => stamp + bind) : preBinds,
					postBinds: forPortable ? postBinds.map(bind => stamp + bind) : postBinds,
					metaClass: metaFront + "_" + Use.string.normalize(stampSelector, [], [], ["$", "/"]),
					declarations: [declaration],
				});
				source.usedIndexes.add(identity.index);
				selectors[stampSelector] = identity.index;
				indexSkeleton[stampSelector] = metadata;
			}
		})
	});
	for (const selector in selectors) {
		IndexMap[selector] = selectors[selector];
	}

	return indexSkeleton;
}

function TAGSTYLE(
	{ scope, selector, comments, styles, rowMarker, columnMarker },
	{ metaFront = "", fileName = "", fullPath = "", filePath = "", prefix = "" },
	IndexMap = {},
) {
	const object = {}, preBinds = [], postBinds = [], errors = [], essentials = [];

	const forPortable = scope === "xtyling";
	const xcope = (forPortable ? "" : scope).toUpperCase();
	const declaration = `${fullPath}:${rowMarker}:${columnMarker}`;
	const metaClass = `${xcope}${metaFront}\\:${rowMarker}\\:${columnMarker}_${Use.string.normalize(selector, [], [], forPortable ? ["$", "/"] : ["$"])}`;
	const variables = {};

	for (let subSelector in styles) {
		const query = HASHRULE.RENDER(subSelector, declaration, forPortable);
		if (!query.status) errors.push(query.error);
		const styleObj = SCANNER(styles[subSelector], `${scope.toUpperCase()} : ${filePath} ||`, `${selector} => ${subSelector}`);

		postBinds.push(...styleObj.postBinds);
		preBinds.push(...styleObj.preBinds);
		Object.assign(variables, styleObj.variables);

		if (Object.keys(styleObj).length) {
			if (selector === "") {
				if (query.rule === "") {
					if (query.subSelector !== "") {
						object[query.subSelector] = styleObj.object;
					}
				} else {
					if (query.subSelector === "") {
						object[query.rule] = styleObj.object;
					} else {
						if (!object[query.rule]) object[query.rule] = {};
						object[query.rule][query.subSelector] = styleObj.object;
					}
				}
			} else {
				if (!object[query.rule]) object[query.rule] = {};
				if (query.subSelector === "")
					object[query.rule] = { ...object[query.rule], ...styleObj.object };
				else object[query.rule]["&" + query.subSelector] = styleObj.object;
			}
		}
	}

	let isOriginal;
	let identity = { index: 0, class: '' };
	let metadata = { Info: comments, Variables: variables, PreBinds: preBinds, PostBinds: postBinds, Skeleton: Use.object.skeleton(object) };
	let xelector = selector === "" ? "" : prefix + selector;
	if (selector === "") {
		essentials.push(...Object.entries(object).map(([k, v]) => [RAW.WATCH ? `${k} /* ${declaration} */` : k, v]));
	} else {
		const index = (IndexMap[xelector] || 0) + (CACHE.LibraryStyle2Index[xelector] || 0) + (CACHE.GlobalsStyle2Index[xelector] || 0);
		if (index) {
			const InStash = INDEX.STYLE(index);
			InStash.declarations.push(declaration);
			isOriginal = false;
		} else {
			isOriginal = true;
			identity = INDEX.DECLARE({
				portable: forPortable ? fileName : "",
				scope,
				selector,
				object,
				metadata,
				preBinds: forPortable ? preBinds.map(bind => prefix + "$/" + bind) : preBinds,
				postBinds: forPortable ? postBinds.map(bind => prefix + "$/" + bind) : postBinds,
				metaClass,
				declarations: [declaration]
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
		skeleton: metadata,
		errors,
	};
}

export default {
	CSSLIBRARY,
	CSSCANNER,
	TAGSTYLE,
	INDEX,
};
