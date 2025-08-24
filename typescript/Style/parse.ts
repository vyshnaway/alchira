import CSSBLOCK from "./block.js";

import $ from "../Shell/main.js";
import Use from "../Utils/main.js";
import HASHRULE from "../hash-rules.js";
import { CACHE_STATIC, CACHE_DYNAMIC, ORIGIN } from "../Data/cache.js";
import { INDEX } from "../Data/init.js";
import { t_FILE_Storage, t_ClassMeta, t_TagRawStyle, t_Diagnostic, t_ClassData } from "../types.js";

function xtylemerge(classList: string[] = []) {
	const
		result: Record<string, object> = {},
		attachments: string[] = [],
		variables: Record<string, string> = {};

	classList.reduce((res, className) => {
		const index =
			CACHE_DYNAMIC.PackageClass_Index[className]
			|| CACHE_DYNAMIC.ArchiveClass_Index[className]
			|| CACHE_DYNAMIC.LibraryClass_Index[className]
			|| 0;

		if (index) {
			const found = INDEX.IMPORT(index);
			Object.assign(variables, found.metadata.variables);
			attachments.push(...found.attachments);
			res = Use.object.multiMerge([result, found.object], true);
		}
		return res;
	}, {});

	return { result, attachments, variables };
}

function SCANNER(content: string, initial: string, sourceSelector: string) {
	const scanned = CSSBLOCK(content);
	const assembled = xtylemerge(scanned.assemble);
	const variables = { ...scanned.variables, ...assembled.variables };
	const attachments = [...assembled.attachments, ...scanned.attachment.filter(attach => attach[0] !== "/")];

	const object = Use.object.deepMerge(assembled.result, Object.fromEntries([
		...Object.entries(scanned.atProps).map(([propKey, propValue]) =>
			[propKey, CACHE_STATIC.WATCH ? `${propValue}/* ${initial} ${sourceSelector} */` : propValue]
		),
		...Object.entries(scanned.properties).map(([propKey, propValue]) =>
			[propKey, CACHE_STATIC.WATCH ? `${propValue}/* ${initial} ${sourceSelector} */` : propValue]
		)
	]));

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

function CSSLIBRARY(fileDatas: t_FILE_Storage[] = [], initial = "", forPortable = false) {
	const selectorList: string[] = [],
		selectors: Record<string, number> = {},
		indexSkeleton: Record<string, t_ClassMeta> = {};
	const IndexMap = forPortable ? CACHE_DYNAMIC.PackageClass_Index : CACHE_DYNAMIC.LibraryClass_Index;

	fileDatas.forEach((source) => {
		const { xcssclassFront: stamp, filePath, metaclassFront: metaFront, content, manifest } = source;

		CSSBLOCK(content, true).XallBlocks.forEach(([SELECTOR, OBJECT]) => {
			const declaration = source.sourcePath;
			const stampSelector = stamp + Use.string.normalize(SELECTOR, [], ["\\", "."]);
			const scannedStyle = SCANNER(OBJECT, initial + " : " + filePath + " ||", SELECTOR,);
			const attachments = scannedStyle.attachments;
			const object = { "": scannedStyle.object };

			const index = (IndexMap[stampSelector] || 0) + (selectors[stampSelector] || 0);
			if (index) {
				const InStash = INDEX.IMPORT(index);
				InStash.declarations.push(declaration);
			} else {
				const selectorData: t_ClassData = {
					package: forPortable ? source.packageName : "",
					scope: manifest.refer.group,
					selector: SELECTOR,
					object,
					watchclass: '',
					metadata: {
						info: [],
						variables: scannedStyle.variables,
						skeleton: Use.object.skeleton(object),
						declarations: [], // manifest and cross-check declarations assigned later from parse.js
						element: '',
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
	raw: t_TagRawStyle,
	file: t_FILE_Storage,
	IndexMap: Record<string, number> = {},
) {
	const scope = raw.scope === "PACKAGE" ? "" : raw.scope;
	const forPackage = file.manifest.refer.group === "PACKAGE";
	const declaration = `${file.targetPath}:${raw.rowIndex}:${raw.colIndex}`;

	const object: Record<string, Record<string, object>> = {};
	const diagnostics: t_Diagnostic[] = [];
	const attachments: string[] = [];
	const errors: string[] = [];
	const variables = {};

	let isOriginal = false;
	let identity = { index: 0, class: '' };
	const xelector = raw.selector === "" ? "" : file.xcssclassFront + raw.selector.replace(/^-\$/, "$");
	const debugclass = `${scope}${file.metaclassFront}\\:${raw.rowIndex}\\:${raw.colIndex}_${Use.string.normalize(raw.selector, [], [], forPackage ? ["$", "/"] : ["$"])}`;
	const index_found =
		IndexMap[xelector]
		|| CACHE_DYNAMIC.PackageClass_Index[xelector]
		|| CACHE_DYNAMIC.LibraryClass_Index[xelector]
		|| CACHE_DYNAMIC.GlobalClass__Index[xelector]
		|| 0;

	if (raw.selector === "") {
		diagnostics.push({
			source: declaration,
			cause: "Classname missing declaration scope."
		});
		errors.push($.MOLD.failed.List(
			"Classname missing declaration scope.",
			[declaration],
			$.list.text.Bullets
		));
	} else {
		for (const subSelector in raw.styles) {
			const query = HASHRULE.RENDER(subSelector, declaration);
			if (!query.status) {
				errors.push(query.error);
				diagnostics.push(query.diagnostic);
			}

			const styleObj = SCANNER(raw.styles[subSelector], `${raw.scope} : ${file.filePath} ||`, `${raw.selector} => ${subSelector}`);
			attachments.push(...styleObj.attachments);
			Object.assign(variables, styleObj.variables);

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
			const InStash = INDEX.IMPORT(index_found);
			InStash.metadata.declarations.push(declaration);
			errors.push($.MOLD.failed.List("Multiple declarations: " + InStash.selector, InStash.metadata.declarations, $.list.text.Bullets));
			diagnostics.push({
				source: declaration,
				cause: $.MOLD.std.List("Multiple declarations: " + InStash.selector, InStash.metadata.declarations, $.list.std.Bullets)
			});
		} else {
			const declarations = [declaration];
			const style_snippet = SCANNER(
				raw.element === ORIGIN.customTag["stencil"] ? raw.attachstring : '',
				`${raw.scope}:ATTACHMENT : ${file.filePath} ||`,
				`${raw.selector}`
			);
			attachments.push(...style_snippet.attachments);
			Object.assign(variables, style_snippet.variables);

			isOriginal = true;
			identity = INDEX.DECLARE({
				package: forPackage ? file.packageName : CACHE_STATIC.PROJECT_NAME,
				scope: raw.scope,
				selector: raw.selector,
				object,
				watchclass: '',
				metadata: {
					info: raw.comments,
					variables,
					skeleton: Use.object.skeleton(object),
					declarations,
					element: '',
					watchclass: '',
					stencil: '',
				},
				attachments: forPackage ? attachments.map(attach => file.xcssclassFront + "$/" + attach) : attachments,
				debugclass,
				declarations,
				attached_style: style_snippet.object,
				attached_staple: raw.element === ORIGIN.customTag["staple"] ? raw.attachstring : "",
				attached_stencil: raw.element === ORIGIN.customTag["stencil"] ? raw.attachstring : "",
			});
			IndexMap[xelector] = identity.index;
		}
	}

	return {
		selector: xelector,
		index: identity.index,
		attachments,
		diagnostics,
		isOriginal,
		errors,
	};
}

export default {
	CSSLIBRARY,
	CSSCANNER,
	TAGSTYLE
};
