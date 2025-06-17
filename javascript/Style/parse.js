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
	const response = CSSBLOCK(content);
	const variables = response.variables;
	const merged = xtylemerge(response.assemble);
	const preBinds = [...merged.preBinds, ...response.preBinds],
		postBinds = [...merged.postBinds, ...response.postBinds];

	const object = Use.object.deepMerge(merged.result, {
		...Object.entries(response.atProps).reduce((acc, [propKey, propValue]) => {
			acc[propKey] = RAW.WATCH ? `${propValue}/* ${initial} ${sourceSelector} */` : propValue;
			return acc;
		}, {}),
		...Object.entries(response.properties).reduce(
			(acc, [propKey, propValue]) => {
				acc[propKey] = RAW.WATCH ? `${propValue}/* ${initial} ${sourceSelector} */` : propValue;
				return acc;
			}, {},),
	});

	for (let selector in response.allBlocks) {
		const result = SCANNER(response.allBlocks[selector], initial, sourceSelector + " -> " + selector);
		Object.assign(variables, result.variables);
		preBinds.push(...result.preBinds);
		postBinds.push(...result.postBinds);
		object[selector] = result.object;
	}

	return { object, preBinds, postBinds, variables };
}

function CSSCANNER(content, initial = "") {
	const variables = {}, preBinds = [], postBinds = [];
	const response = CSSBLOCK(content, true);
	const object = response.XatProps;

	response.XallBlocks.forEach(([key, value]) => {
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
			const skeleton = { Info: {}, Variables: scannedStyle.variables, PreBinds: preBinds, PostBinds: postBinds, Skeleton: Use.object.skeleton(object) };

			const index = (IndexMap[stampSelector] || 0) + (selectors[stampSelector] || 0);
			if (index) {
				const InStash = INDEX.STYLE(index);
				InStash.declarations.push(declaration);
			} else {
				const identity = INDEX.DECLARE({
					scope: group,
					selector,
					object,
					skeleton,
					preBinds: forPortable ? preBinds.map(bind => stamp + bind) : preBinds,
					postBinds: forPortable ? postBinds.map(bind => stamp + bind) : postBinds,
					metaClass: metaFront + "_" + Use.string.normalize(stampSelector, [], [], ["$", "/"]),
					declarations: [declaration],
				});
				source.usedIndexes.add(identity.index);
				selectors[stampSelector] = identity.index;
				indexSkeleton[stampSelector] = skeleton;
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
	metaFront,
	filePath,
	normalPath,
	IndexMap = {},
	selectorPrefix = "",
) {
	const object = {}, preBinds = [], postBinds = [], errors = [], essentials = [];

	const forPortable = scope === "xtyling";
	const xcope = (forPortable ? "" : scope).toUpperCase();
	const declaration = `${normalPath}:${rowMarker}:${columnMarker}`;
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
	let skeleton = { Info: comments, Variables: variables, PreBinds: preBinds, PostBinds: postBinds, Skeleton: Use.object.skeleton(object) };
	let xelector = selector === "" ? "" : selectorPrefix + selector;
	if (selector === "") {
		essentials.push(...Object.entries(object).map(([k, v]) => [`${k} /* ${declaration} */`, v]));
	} else {
		const index = (IndexMap[xelector] || 0) + (CACHE.LibraryStyle2Index[xelector] || 0) + (CACHE.GlobalsStyle2Index[xelector] || 0);
		if (index) {
			const InStash = INDEX.STYLE(index);
			InStash.declarations.push(declaration);
			isOriginal = false;
		} else {
			isOriginal = true;
			identity = INDEX.DECLARE({
				scope,
				selector,
				object,
				skeleton,
				preBinds: forPortable ? preBinds.map(bind => selectorPrefix + "$/" + bind) : preBinds,
				postBinds: forPortable ? postBinds.map(bind => selectorPrefix + "$/" + bind) : postBinds,
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
		skeleton,
		errors,
	};
}

export default {
	CSSLIBRARY,
	CSSCANNER,
	TAGSTYLE,
	INDEX,
};
