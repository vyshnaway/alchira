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

function MERGER(classList: string[] = []) {
	const
		attachments: string[] = [],
		mergables: object[] = [],
		variables: Record<string, string> = {};

	classList.forEach((className) => {
		const found = INDEX.FIND(className);

		if (found.group === _Style._Type.LIBRARY) {
			const classdata = INDEX.FETCH(found.index);
			Object.assign(variables, classdata.metadata.variables);
			attachments.push(...classdata.attachments);
			mergables.push(classdata.style_object);
		}
	});
	const result = Use.object.multiMerge(mergables, true);

	return { result, attachments, variables };
}

function SCANNER(content: string, initial: string, sourceSelector: string, merge_n_flatten: boolean) {
	const scanned = CSSBlockScanner(content);
	const assigned = MERGER(scanned.assign);
	const variables = { ...assigned.variables, ...scanned.variables };
	const attachments = [...assigned.attachments, ...scanned.attachment.filter(attach => attach[0] !== "/")];

	const scannedAst = Object.fromEntries([
		...Object.keys(assigned.variables).reduce((acc, varkey) => {
			if (scanned.properties[varkey]) {
				acc.push([varkey, CACHE.STATIC.DEBUG ? `${scanned.properties[varkey]}/* ${initial} ${sourceSelector} */` : scanned.properties[varkey]]);
			}
			return acc;
		}, [] as [string, string][]),
		...Object.entries(scanned.atProps).map(([propKey, propValue]) =>
			[propKey, CACHE.STATIC.DEBUG ? `${propValue}/* ${initial} ${sourceSelector} */` : propValue]
		),
		...Object.entries(scanned.properties).map(([propKey, propValue]) =>
			[propKey, CACHE.STATIC.DEBUG ? `${propValue}/* ${initial} ${sourceSelector} */` : propValue]
		)
	]);

	const mergedAst = Use.object.multiMerge([assigned.result, { "": scannedAst }], true);

	const styles = merge_n_flatten ? Object.entries(mergedAst).reduce((a, [k, v]) => {
		if (k === "") {
			Object.assign(a, v);
		} else {
			a[k] = v;
		}
		return a;
	}, {} as Record<string, string | object>) : mergedAst;
	const target = merge_n_flatten ? styles : styles[""];

	for (const selector in scanned.allBlocks) {
		const result = SCANNER(scanned.allBlocks[selector], initial, sourceSelector + " -> " + selector, true);
		Object.assign(variables, result.variables);
		attachments.push(...result.attachments);
		target[selector] = result.styles;
	}

	return { styles, attachments, variables };
}

function CSSFileScanner(content: string, initial = "") {
	const scanned = CSSBlockScanner(Use.code.uncomment.Script(content), true);
	const styles: [string, string | object][] = scanned.XatProps;

	const variables: Record<string, string> = {}, attachments: string[] = [];
	scanned.XallBlocks.forEach(([key, value]) => {
		const result = SCANNER(value, initial, key, true);
		Object.assign(variables, result.variables);
		attachments.push(...result.attachments);
		styles.push([key, result.styles]);
	});

	return { styles, attachments, variables };
}

function CSSBulkScanner(fileDatas: _File.Storage[], forArtifact = false) {
	const selectorList: string[] = [],
		selectors: Record<string, number> = {},
		indexMetaCollection: Record<string, _Style.Metadata> = {};
	const IndexMap = forArtifact ? CACHE.CLASS.Artifact_Index : CACHE.CLASS.Library__Index;

	fileDatas.forEach((source) => {
		const { classFront, filePath, debugclassFront, content, manifesting: manifest } = source;

		CSSBlockScanner(Use.code.uncomment.Script(content), true).XallBlocks.forEach(([SELECTOR, OBJECT]) => {
			const declaration = source.sourcePath;
			const classname = classFront + Use.string.normalize(SELECTOR, [], ["\\", "."]);
			const scannedStyle = SCANNER(OBJECT, `${manifest.lookup.type} : ${filePath} |`, SELECTOR, false);
			const attachments = scannedStyle.attachments;
			const object = scannedStyle.styles;

			const index = (IndexMap[classname] || 0) + (selectors[classname] || 0);
			if (index) {
				const InStash = INDEX.FETCH(index);
				InStash.metadata.declarations.push(declaration);
			} else {
				const selectorData: _Style.Classdata = {
					index: 0,
					artifact: forArtifact ? source.artifact : "",
					definent: SELECTOR,
					symclass: classname,
					metadata: {
						info: [],
						watchclass: '',
						variables: scannedStyle.variables,
						skeleton: Use.object.skeleton(object),
						declarations: [declaration],
						summon: '',
						attributes: {}
					},
					style_object: object,
					attachments: forArtifact ? attachments.map(attach => classFront + attach) : attachments,
					debugclass: debugclassFront + "_" + Use.string.normalize(classname, [], [], ["$", "/"]),
					declarations: [declaration],
					snippet_staple: '',
					snippet_style: { [SELECTOR]: object[""] },
				};
				const identity = INDEX.DECLARE(selectorData);

				source.styleData.usedIndexes.push(identity);
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
	const errors: string[] = [];
	const diagnostics: _Support.Diagnostic[] = [];

	const forArtifact = file.manifesting.lookup.type === "ARTIFACT";
	const declaration = `${file.targetPath}:${raw.rowIndex}:${raw.colIndex}`;

	const symzero = raw.symclasses[0].replace(/^-\$/, "$");
	const symclass = file.classFront + (forArtifact ? symzero.replace("$$$", "$") : symzero);
	const normalsymclass = Use.string.normalize(symclass, [], [], forArtifact ? ["$", "/"] : ["$"]);

	const scope = _Style._Import[raw.scope === _Style._Type.ARTIFACT ? _Style._Type.NULL : raw.scope];
	const debugclass = `${scope}${file.debugclassFront}\\:${raw.rowIndex}\\:${raw.colIndex}_${normalsymclass}`;

	const styleScanned = SCANNER(
		Use.code.uncomment.Script(raw.styles['']),
		`${_Style._Import[raw.scope]} : ${file.filePath} ||`, `${raw.symclasses} => []`,
		false
	);
	const object: Record<string, Record<string, object>> = styleScanned.styles;
	const attachments: string[] = styleScanned.attachments;
	const variables: Record<string, string> = styleScanned.variables;
	for (const subSelector in raw.styles) {
		if (subSelector !== "") {
			const query = HASHRULE.RENDER(subSelector, declaration);
			if (query.status) {
				const styleScanned = SCANNER(
					Use.code.uncomment.Script(raw.styles[subSelector]),
					`${_Style._Import[raw.scope]} : ${file.filePath} |`, `${raw.symclasses} => ${subSelector}`,
					true
				);
				attachments.push(...styleScanned.attachments);
				Object.assign(variables, styleScanned.variables);
				if (Object.keys(styleScanned).length) {
					object[JSON.stringify(query.wrappers)] = styleScanned.styles;
				}
			} else {
				errors.push(query.error);
				diagnostics.push(query.diagnostic);
			}
		}
	}

	// eslint-disable-next-line prefer-const
	let { index, group } = INDEX.FIND(symclass, IndexMap);
	if (group !== _Style._Type.NULL) {
		const InStash = INDEX.FETCH(index);
		InStash.metadata.declarations.push(declaration);
	} else {
		const style_snippet = SCANNER(
			raw.elid === CACHE.ROOT.customElements.style ? Use.code.uncomment.Script(raw.attachstring) : '',
			`${_Style._Import[raw.scope]}:ATTACHMENT : ${file.filePath}:${raw.rowIndex}:${raw.colIndex} |`,
			`${raw.symclasses[0]}`,
			true
		);

		attachments.push(...style_snippet.attachments);
		Object.assign(variables, style_snippet.variables);
		
		index = INDEX.DECLARE({
			index: 0,
			artifact: forArtifact ? file.artifact : CACHE.STATIC.Archive.name,
			definent: raw.symclasses[0],
			symclass,
			style_object: object,
			metadata: {
				info: raw.comments,
				watchclass: '',
				variables: variables,
				skeleton: Use.object.skeleton(object),
				declarations: [declaration],
				summon: raw.elid === CACHE.ROOT.customElements.summon ? raw.attachstring : "",
				attributes: raw.elid === CACHE.ROOT.customElements.summon ? raw.attributes : {}
			},
			attachments: forArtifact
				? attachments.map(a => file.classFront + (a.includes("$$$") ? a.replace("$$$", "$") : `$/${a}`))
				: attachments,
			debugclass,
			declarations: [declaration],
			snippet_staple: raw.elid === CACHE.ROOT.customElements.staple ? raw.attachstring : "",
			snippet_style: style_snippet.styles,
		});
		IndexMap[symclass] = index;
	}

	return {
		symclass,
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
