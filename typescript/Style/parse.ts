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
import HASHRULE from "../hashrule.js";

function MERGER(classList: string[] = [], refpacks: boolean, flatmerge: boolean) {
	const
		attachments: string[] = [],
		mergables: object[] = [],
		variables: Record<string, string> = {};

	classList.forEach((className) => {
		const found = INDEX.FIND(className);

		if (
			(refpacks && found.group === _Style._Type.EXTERNAL)
			|| found.group === _Style._Type.ARTATTACH
			|| found.group === _Style._Type.LIBRARY
		) {
			const classdata = INDEX.FETCH(found.index);
			Object.assign(variables, classdata.metadata.variables);
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

	return { result, attachments, variables };
}

function SCANNER(content: string, initial: string, sourceSelector: string, refpacks: boolean, flatmerge: boolean) {
	const scanned = CSSBlockScanner(content);
	const assigned = MERGER(scanned.assign, refpacks, flatmerge);
	const variables = { ...scanned.variables, ...assigned.variables };
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
		Object.assign(variables, result.variables);
		attachments.push(...result.attachments);
		styles[selector] = result.styles;
	}

	return { styles, attachments, variables: variables };
}

function CSSFileScanner(content: string, initial = "", refpacks: boolean) {
	const scanned = CSSBlockScanner(Use.code.uncomment.Script(content), true);
	const styles: [string, string | object][] = scanned.XatProps;

	const variables: Record<string, string> = {}, attachments: string[] = [];
	scanned.XallBlocks.forEach(([key, value]) => {
		const result = SCANNER(value, initial, key, refpacks, true);
		Object.assign(variables, result.variables);
		attachments.push(...result.attachments);
		styles.push([key, result.styles]);
	});

	return { styles, attachments, variables };
}

function CSSBulkScanner(fileDatas: _File.Storage[], forPortable = false) {
	const selectorList: string[] = [],
		selectors: Record<string, number> = {},
		indexMetaCollection: Record<string, _Style.Metadata> = {};
	const IndexMap = forPortable ? CACHE.CLASS.External_Index : CACHE.CLASS.Library__Index;

	fileDatas.forEach((source) => {
		const { classFront, filePath, debugclassFront, content, manifesting: manifest } = source;

		CSSBlockScanner(Use.code.uncomment.Script(content), true).XallBlocks.forEach(([SELECTOR, OBJECT]) => {
			const declaration = source.sourcePath;
			const classname = classFront + Use.string.normalize(SELECTOR, [], ["\\", "."]);
			const scannedStyle = SCANNER(OBJECT, `${manifest.lookup.type} : ${filePath} ||`, SELECTOR, false, false);
			const attachments = scannedStyle.attachments;
			const object = { "": scannedStyle.styles };

			const index = (IndexMap[classname] || 0) + (selectors[classname] || 0);
			if (index) {
				const InStash = INDEX.FETCH(index);
				InStash.metadata.declarations.push(declaration);
			} else {
				const selectorData: _Style.Classdata = {
					artifact: forPortable ? source.artifact : "",
					selector: SELECTOR,
					classname,
					metadata: {
						info: [],
						watchclass: '',
						variables: scannedStyle.variables,
						skeleton: Use.object.skeleton(object),
						declarations: [declaration],
						summon: '',
						style: ''
					},
					style_object: object,
					snippet_staple: '',
					attachments: forPortable ? attachments.map(attach => classFront + attach) : attachments,
					debugclass: debugclassFront + "_" + Use.string.normalize(classname, [], [], ["$", "/"]),
					declarations: [declaration],
					snippet_style: { [SELECTOR]: object[""] },
				};
				const identity = INDEX.DECLARE(selectorData);

				source.styleData.usedIndexes.add(identity);
				selectors[classname] = identity;
				indexMetaCollection[classname] = selectorData.metadata;
				selectorList.push(classname);
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
	const scope = raw.scope === _Style._Type.EXTERNAL ? _Style._Type.NULL : raw.scope;
	const forExternal = file.manifesting.lookup.type === "EXTERNAL";
	const declaration = `${file.targetPath}:${raw.rowIndex}:${raw.colIndex}`;

	const object: Record<string, Record<string, object>> = {};
	const diagnostics: _Support.Diagnostic[] = [];
	const errors: string[] = [];
	const attachments: string[] = [];
	const variables = {};

	const classname = raw.selector === "" ? "" : file.classFront + raw.selector.replace(/^-\$/, "$").replace("$$$", "$");
	const debugclass = `${scope}${file.debugclassFront}\\:${raw.rowIndex}\\:${raw.colIndex}_${Use.string.normalize(classname, [], [], forExternal ? ["$", "/"] : ["$"])}`;

	for (const subSelector in raw.styles) {
		const styleScanned = SCANNER(
			Use.code.uncomment.Script(raw.styles[subSelector]),
			`${raw.scope} : ${file.filePath} ||`, `${raw.selector} => ${subSelector}`,
			false, subSelector !== ""
		);
		attachments.push(...styleScanned.attachments);
		Object.assign(variables, styleScanned.variables);

		if (Object.keys(styleScanned).length) {
			if (subSelector === "") {
				object[""] = styleScanned.styles;
			} else {
				const query = HASHRULE.RENDER(subSelector, declaration);
				if (query.status) {
					HASHRULE.WRAPPER(object, query.wrappers.reverse(), styleScanned.styles);
				} else {
					errors.push(query.error);
					diagnostics.push(query.diagnostic);
				}
			}
		}
	}

	let { index, group } = INDEX.FIND(classname, false, IndexMap);
	if (
		_Style._Type.EXTERNAL === group ||
		_Style._Type.LIBRARY === group ||
		_Style._Type.GLOBAL === group ||
		_Style._Type.LOCAL === group
	) {
		const InStash = INDEX.FETCH(index);
		InStash.metadata.declarations.push(declaration);
	} else {
		const style_snippet = SCANNER(
			raw.elid === CACHE.ROOT.customElements.style ? Use.code.uncomment.Script(raw.attachstring) : '',
			`${raw.scope}:ATTACHMENT : ${file.filePath} ||`,
			`${raw.selector}`,
			true, true
		);

		attachments.push(...style_snippet.attachments);
		Object.assign(variables, style_snippet.variables);

		group = _Style._Type.NULL;
		index = INDEX.DECLARE({
			artifact: forExternal ? file.artifact : CACHE.STATIC.Artifact.name,
			selector: raw.selector,
			style_object: object,
			classname,
			metadata: {
				info: raw.comments,
				watchclass: '',
				variables: variables,
				skeleton: Use.object.skeleton(object),
				declarations: [declaration],
				summon: raw.elid === CACHE.ROOT.customElements.summon ? raw.attachstring : "",
				style: raw.styleAttribute
			},
			snippet_staple: raw.elid === CACHE.ROOT.customElements.staple ? raw.attachstring : "",
			attachments: forExternal ?
				attachments.map(a => file.classFront + (a.includes("$$$") ? a.replace("$$$", "$") : `$/${a}`)) : attachments,
			debugclass,
			declarations: [declaration],
			snippet_style: style_snippet.styles,
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
