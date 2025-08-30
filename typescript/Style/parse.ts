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

function MERGER(classList: string[] = [], refpacks: boolean, flatmerge: boolean) {
	const
		attachments: string[] = [],
		mergables: object[] = [],
		constants: Record<string, string> = {};

	classList.forEach((className) => {
		const found = INDEX.FIND(className);

		if (
			(refpacks && found.group === _Style._Type.PACKAGE)
			|| found.group === _Style._Type.ARCHIVE
			|| found.group === _Style._Type.ARCBIND
			|| found.group === _Style._Type.LIBRARY
		) {
			const classdata = INDEX.FETCH(found.index);
			Object.assign(constants, classdata.metadata.constants);
			attachments.push(...classdata.attachments);
			mergables.push(classdata.style_object);
		}
	});
	const result = flatmerge ? Use.object.multiMerge(mergables, true) :
		Object.entries(Use.object.multiMerge(mergables, true)).reduce((a, [k, v]) => {
			if (k === "") {
				Object.assign(a, v);
			} else {
				a[k] = v;
			}
			return a;
		}, {} as Record<string, string | object>);

	return { result, attachments, constants };
}

function SCANNER(content: string, initial: string, sourceSelector: string, refpacks: boolean, flatmerge: boolean) {
	const scanned = CSSBlockScanner(content);
	const assigned = MERGER(scanned.assign, refpacks, flatmerge);
	const constants = { ...scanned.constants, ...assigned.constants };
	const attachments = [...assigned.attachments, ...scanned.attachment.filter(attach => attach[0] !== "/")];

	const styles = Use.object.deepMerge(assigned.result, Object.fromEntries([
		...Object.entries(scanned.atProps).map(([propKey, propValue]) =>
			[propKey, CACHE.STATIC.DEBUG ? `${propValue}/* ${initial} ${sourceSelector} */` : propValue]
		),
		...Object.entries(scanned.properties).map(([propKey, propValue]) =>
			[propKey, CACHE.STATIC.DEBUG ? `${propValue}/* ${initial} ${sourceSelector} */` : propValue]
		)
	]));

	for (const selector in scanned.allBlocks) {
		const result = SCANNER(scanned.allBlocks[selector], initial, sourceSelector + " -> " + selector, refpacks, true);
		Object.assign(constants, result.constants);
		attachments.push(...result.attachments);
		styles[selector] = result.styles;
	}

	return { styles, attachments, constants };
}

function CSSFileScanner(content: string, initial = "", refpacks = false) {
	const scanned = CSSBlockScanner(Use.code.uncomment.Script(content), true);
	const styles: [string, string | object][] = scanned.XatProps;

	const constants: Record<string, string> = {}, attachments: string[] = [];
	scanned.XallBlocks.forEach(([key, value]) => {
		const result = SCANNER(value, initial, key, refpacks, true);
		Object.assign(constants, result.constants);
		attachments.push(...result.attachments);
		styles.push([key, result.styles]);
	});

	return { styles, attachments, constants };
}

function CSSBulkScanner(fileDatas: _File.Storage[], forPortable = false) {
	const selectorList: string[] = [],
		selectors: Record<string, number> = {},
		indexMetaCollection: Record<string, _Style.Metadata> = {};
	const IndexMap = forPortable ? CACHE.CLASS.Package_Index : CACHE.CLASS.Library_Index;

	fileDatas.forEach((source) => {
		const { classFront, filePath, debugclassFront, content, manifest } = source;

		CSSBlockScanner(Use.code.uncomment.Script(content), true).XallBlocks.forEach(([SELECTOR, OBJECT]) => {
			const declaration = source.sourcePath;
			const stampSelector = classFront + Use.string.normalize(SELECTOR, [], ["\\", "."]);
			const scannedStyle = SCANNER(OBJECT, `${_File._Import[manifest.refer.type]} : ${filePath} ||`, SELECTOR, false, false);
			const attachments = scannedStyle.attachments;
			const object = { "": scannedStyle.styles };

			const index = (IndexMap[stampSelector] || 0) + (selectors[stampSelector] || 0);
			if (index) {
				const InStash = INDEX.FETCH(index);
				InStash.declarations.push(declaration);
			} else {
				const selectorData: _Style.Classdata = {
					package: forPortable ? source.packageName : "",
					selector: SELECTOR,
					style_object: object,
					watchclass: '',
					metadata: {
						info: [],
						constants: scannedStyle.constants,
						skeleton: Use.object.skeleton(object),
						declarations: [declaration],
						stencil: '',
					},
					attachments: forPortable ? attachments.map(attach => classFront + attach) : attachments,
					debugclass: debugclassFront + "_" + Use.string.normalize(stampSelector, [], [], ["$", "/"]),
					declarations: [declaration],
					attached_style: { [SELECTOR]: object },
					attached_staple: '',
					attached_stencil: '',
				};
				const identity = INDEX.DECLARE(selectorData);

				source.styleData.usedIndexes.add(identity);
				selectors[stampSelector] = identity;
				indexMetaCollection[stampSelector] = selectorData.metadata;
				selectorList.push(stampSelector);
			}
		});
	});
	for (const selector in selectors) {
		IndexMap[selector] = selectors[selector];
	}

	return { indexMetaCollection, selectorList };
}

function TagStyleScanner(
	raw: _Script.RawStyle,
	file: _File.Storage,
	IndexMap: Record<string, number> = {},
) {
	const scope = raw.scope === _Style._Type.PACKAGE ? _Style._Type.NULL : raw.scope;
	const forPackage = file.manifest.refer.type === _File._Type.PACKAGE;
	const declaration = `${file.targetPath}:${raw.rowIndex}:${raw.colIndex}`;

	const object: Record<string, Record<string, object>> = {};
	const diagnostics: _Support.Diagnostic[] = [];
	const errors: string[] = [];
	const attachments: string[] = [];
	const constants = {};

	const classname = raw.selector === "" ? "" : file.classFront + raw.selector.replace(/^-\$/, "$");
	const debugclass = `${scope}${file.debugclassFront}\\:${raw.rowIndex}\\:${raw.colIndex}_${Use.string.normalize(classname, [], [], forPackage ? ["$", "/"] : ["$"])}`;

	for (const subSelector in raw.styles) {
		const query = HASHRULE.RENDER(subSelector, declaration);
		if (!query.status) {
			errors.push(query.error);
			diagnostics.push(query.diagnostic);
		}

		const styleObj = SCANNER(
			Use.code.uncomment.Script(raw.styles[subSelector]),
			`${raw.scope} : ${file.filePath} ||`, `${raw.selector} => ${subSelector}`,
			false, subSelector !== ""
		);
		attachments.push(...styleObj.attachments);
		Object.assign(constants, styleObj.constants);

		if (Object.keys(styleObj).length) {
			if (!object[query.rule]) {
				object[query.rule] = {};
			}
			if (query.subSelector === "") {
				Object.assign(object[query.rule], styleObj.styles);
			} else {
				object[query.rule]["&" + query.subSelector] = styleObj.styles;
			}
		}
	}

	let { index, group } = INDEX.FIND(classname, false, IndexMap);
	console.log({ index, group });
	if (
		_Style._Type.PACKAGE === group ||
		_Style._Type.LIBRARY === group ||
		_Style._Type.GLOBAL === group ||
		_Style._Type.LOCAL === group
	) {
		const InStash = INDEX.FETCH(index);
		InStash.metadata.declarations.push(declaration);
	} else {
		const style_snippet = SCANNER(
			raw.element === CACHE.ROOT.customElements["stencil"] ? Use.code.uncomment.Script(raw.attachstring) : '',
			`${raw.scope}:ATTACHMENT : ${file.filePath} ||`,
			`${raw.selector}`,
			true, true
		);
		attachments.push(...style_snippet.attachments);
		Object.assign(constants, style_snippet.constants);

		group = _Style._Type.NULL;
		index = INDEX.DECLARE({
			package: forPackage ? file.packageName : CACHE.STATIC.Archive.name,
			selector: raw.selector,
			style_object: object,
			watchclass: '',
			metadata: {
				info: raw.comments,
				constants,
				skeleton: Use.object.skeleton(object),
				declarations: [declaration],
				stencil: '',
			},
			attachments: forPackage ? attachments.map(attach => file.classFront + "$/" + attach) : attachments,
			debugclass,
			declarations: [declaration],
			attached_style: style_snippet.styles,
			attached_staple: raw.element === CACHE.ROOT.customElements["staple"] ? raw.attachstring : "",
			attached_stencil: raw.element === CACHE.ROOT.customElements["stencil"] ? raw.attachstring : "",
		});
		IndexMap[classname] = index;
	}

	return {
		classname,
		index,
		attachments,
		diagnostics,
		errors,
	};
}

export default {
	TagStyleScanner,
	CSSBulkScanner,
	CSSFileScanner,
};
