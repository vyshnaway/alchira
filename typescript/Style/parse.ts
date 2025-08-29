// import * as _Config from "../type/config.js";
import * as _File from "../type/file.js";
import * as _Style from "../type/style.js";
import * as _Script from "../type/script.js";
// import * as _Cache from "../type/cache.js";
import * as _Support from "../type/support.js";


import * as CACHE from "../data/cache.js";
import * as INDEX from "../data/index.js";

import Use from "../utils/main.js";
import CSSBlockScanner from "./block.js";
import HASHRULE from "../hash-rules.js";

function classmerge(classList: string[] = [], refpacks = false) {
	const
		result: Record<string, object> = {},
		attachments: string[] = [],
		constants: Record<string, string> = {};

	classList.reduce((res, className) => {
		const index =
			(refpacks ? CACHE.CLASS.Package_Index[className] : 0)
			|| CACHE.CLASS.Archive_Index[className]
			|| CACHE.CLASS.Library_Index[className]
			|| 0;

		if (index) {
			const found = INDEX.FETCH(index);
			Object.assign(constants, found.metadata.constants);
			attachments.push(...found.attachments);
			res = Use.object.multiMerge([result, found.object], true);
		}
		return res;
	}, {});

	return { result, attachments, constants };
}

function SCANNER(content: string, initial: string, sourceSelector: string, refpacks = false) {
	const scanned = CSSBlockScanner(content);
	const assigned = classmerge(scanned.assign, refpacks);
	const constants = { ...scanned.constants, ...assigned.constants };
	const attachments = [...assigned.attachments, ...scanned.attachment.filter(attach => attach[0] !== "/")];

	const object = Use.object.deepMerge(assigned.result, Object.fromEntries([
		...Object.entries(scanned.atProps).map(([propKey, propValue]) =>
			[propKey, CACHE.STATIC.DEBUG ? `${propValue}/* ${initial} ${sourceSelector} */` : propValue]
		),
		...Object.entries(scanned.properties).map(([propKey, propValue]) =>
			[propKey, CACHE.STATIC.DEBUG ? `${propValue}/* ${initial} ${sourceSelector} */` : propValue]
		)
	]));

	for (const selector in scanned.allBlocks) {
		const result = SCANNER(scanned.allBlocks[selector], initial, sourceSelector + " -> " + selector, refpacks);
		Object.assign(constants, result.constants);
		attachments.push(...result.attachments);
		object[selector] = result.object;
	}

	return { object, attachments, constants };
}

function CSSFileScanner(content: string, initial = "", refpacks = false) {
	const scanned = CSSBlockScanner(Use.code.uncomment.Script(content), true);
	const object: [string, string | object][] = scanned.XatProps;

	const constants: Record<string, string> = {}, attachments: string[] = [];
	scanned.XallBlocks.forEach(([key, value]) => {
		const result = SCANNER(value, initial, key, refpacks);
		Object.assign(constants, result.constants);
		attachments.push(...result.attachments);
		object.push([key, result.object]);
	});

	return { object, attachments, constants };
}

function CSSCollectionScanner(fileDatas: _File.Storage[] = [], initial = "", forPortable = false) {
	const selectorList: string[] = [],
		selectors: Record<string, number> = {},
		indexSkeleton: Record<string, _Style.Metadata> = {};
	const IndexMap = forPortable ? CACHE.CLASS.Package_Index : CACHE.CLASS.Library_Index;

	fileDatas.forEach((source) => {
		const { classFront: stamp, filePath, debugclassFront: metaFront, content, manifest } = source;

		CSSBlockScanner(Use.code.uncomment.Script(content), true).XallBlocks.forEach(([SELECTOR, OBJECT]) => {
			const declaration = source.sourcePath;
			const stampSelector = stamp + Use.string.normalize(SELECTOR, [], ["\\", "."]);
			const scannedStyle = SCANNER(OBJECT, initial + " : " + filePath + " ||", SELECTOR, false);
			const attachments = scannedStyle.attachments;
			const object = { "": scannedStyle.object };

			const index = (IndexMap[stampSelector] || 0) + (selectors[stampSelector] || 0);
			if (index) {
				const InStash = INDEX.FETCH(index);
				InStash.declarations.push(declaration);
			} else {
				const selectorData: _Style.Classdata = {
					package: forPortable ? source.packageName : "",
					scope: manifest.refer.group,
					selector: SELECTOR,
					object,
					watchclass: '',
					metadata: {
						info: [],
						constants: scannedStyle.constants,
						skeleton: Use.object.skeleton(object),
						declarations: [], // manifest and cross-check declarations assigned later from parse.js
						stencil: '',
						watchclass: '',
					},
					attachments: forPortable ? attachments.map(attach => stamp + attach) : attachments,
					debugclass: metaFront + "_" + Use.string.normalize(stampSelector, [], [], ["$", "/"]),
					declarations: [declaration], // only library declarations
					attached_style: { [SELECTOR]: object },
					attached_staple: '',
					attached_stencil: '',
				};
				const identity = INDEX.DECLARE(selectorData);

				selectorData.metadata.watchclass = identity.class;
				source.styleData.usedIndexes.add(identity.index);
				selectors[stampSelector] = identity.index;
				indexSkeleton[stampSelector] = selectorData.metadata;
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
	raw: _Script.RawStyle,
	file: _File.Storage,
	IndexMap: Record<string, number> = {},
) {
	const scope = raw.scope === "PACKAGE" ? "" : raw.scope;
	const forPackage = file.manifest.refer.group === "PACKAGE";
	const declaration = `${file.targetPath}:${raw.rowIndex}:${raw.colIndex}`;

	const object: Record<string, Record<string, object>> = {};
	const diagnostics: _Support.Diagnostic[] = [];
	const errors: string[] = [];
	const attachments: string[] = [];
	const constants = {};

	let identity = { index: 0, class: '' };
	const classname = raw.selector === "" ? "" : file.classFront + raw.selector.replace(/^-\$/, "$");
	const debugclass = `${scope}${file.debugclassFront}\\:${raw.rowIndex}\\:${raw.colIndex}_${Use.string.normalize(raw.selector, [], [], forPackage ? ["$", "/"] : ["$"])}`;
	const index_found =
		IndexMap[classname]
		|| CACHE.CLASS.Package_Index[classname]
		|| CACHE.CLASS.Library_Index[classname]
		|| CACHE.CLASS.Global__Index[classname]
		|| 0;

	for (const subSelector in raw.styles) {
		const query = HASHRULE.RENDER(subSelector, declaration);
		if (!query.status) {
			errors.push(query.error);
			diagnostics.push(query.diagnostic);
		}

		const styleObj = SCANNER(
			Use.code.uncomment.Script(raw.styles[subSelector]),
			`${raw.scope} : ${file.filePath} ||`, `${raw.selector} => ${subSelector}`,
			false
		);
		attachments.push(...styleObj.attachments);
		Object.assign(constants, styleObj.constants);

		if (Object.keys(styleObj).length) {
			if (!object[query.rule]) {
				object[query.rule] = {};
			}
			if (query.subSelector === "") {
				Object.assign(object[query.rule], styleObj.object);
			} else {
				object[query.rule]["&" + query.subSelector] = styleObj.object;
			}
		}
	}


	if (index_found) {
		const InStash = INDEX.FETCH(index_found);
		InStash.metadata.declarations.push(declaration);
	} else {
		const declarations = [declaration];
		const style_snippet = SCANNER(
			raw.element === CACHE.ROOT.customElements["stencil"] ? Use.code.uncomment.Script(raw.attachstring) : '',
			`${raw.scope}:ATTACHMENT : ${file.filePath} ||`,
			`${raw.selector}`,
			true
		);
		attachments.push(...style_snippet.attachments);
		Object.assign(constants, style_snippet.constants);

		identity = INDEX.DECLARE({
			package: forPackage ? file.packageName : CACHE.STATIC.Archive.name,
			scope: raw.scope,
			selector: raw.selector,
			object,
			watchclass: '',
			metadata: {
				info: raw.comments,
				constants,
				skeleton: Use.object.skeleton(object),
				declarations,
				watchclass: '',
				stencil: '',
			},
			attachments: forPackage ? attachments.map(attach => file.classFront + "$/" + attach) : attachments,
			debugclass,
			declarations,
			attached_style: style_snippet.object,
			attached_staple: raw.element === CACHE.ROOT.customElements["staple"] ? raw.attachstring : "",
			attached_stencil: raw.element === CACHE.ROOT.customElements["stencil"] ? raw.attachstring : "",
		});
		IndexMap[classname] = identity.index;
	}

	return {
		classname,
		identity,
		attachments,
		diagnostics,
		errors,
	};
}

export default {
	CSSCLUSTR: CSSCollectionScanner,
	CSSCANNER: CSSFileScanner,
	TAGSTYLE
};
