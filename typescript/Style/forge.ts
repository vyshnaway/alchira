import Use from "../utils/main.js";
import * as CACHE from "../data/cache.js";
import * as INDEX from "../data/index.js";

export function _styleSwitch(object: Record<string, Record<string, object | string>>) {
	const switched = Use.object.switch(object);
	const mins: string[] = [], maxs: string[] = [], inits: string[] = [], flats: string[] = [];

	Object.keys(switched).forEach((key) => {
		const min = key.indexOf("min");
		const max = key.indexOf("max");
		if (key !== "") {
			if (min === -1 && max === -1) { inits.push(key); }
			if (min < max) { mins.push(key); }
			if (min > max) { maxs.push(key); }
			if (min === max) { flats.push(key); }
		}
	});

	const result: Record<string, object> = {};
	inits.forEach(key => result[key] = switched[key]);
	Object.assign(result, switched[""]);
	[...flats.sort(), ...mins.sort().reverse(), ...maxs.sort()].forEach((key) => (result[key] = switched[key]));
	return result;
}


function BuildFromIndexMap(selectorIndexObject: Record<string, number>) {
	const attachments: string[] = [];
	const object = Object.entries(_styleSwitch(
		Object.entries(selectorIndexObject).reduce((A: Record<string, Record<string, object>>, [selector, index]) => {
			const imported = INDEX.FETCH(index);
			A[selector] = imported.object;
			attachments.push(...imported.attachments);
			return A;
		}, {}),
	));

	return { object, attachments };
}


function _loadAttachObjectsFromIndex(
	order: string[] = [],
) {
	const indexMap: Record<string, number> = {}, result: Record<string, Record<string, object>> = {};

	order.forEach((identity) => {
		const index = CACHE.CLASS.LibraryClass_Index[identity];
		if (index) {
			const selector = INDEX.FETCH(index).selector;
			const evaluated = (["@", "."].includes(selector[0]) ? "" : ".") + selector;
			indexMap[evaluated] = index;
			result[evaluated] = INDEX.FETCH(index).object;
		}
	});

	const object = _styleSwitch(result);
	return { object, indexMap };
}

function buildAttachments(attachments = new Set<string>()) {
	const attachmentLast: number = attachments.size;

	do {
		attachments.forEach((element) => {
			if (CACHE.CLASS.LibraryClass_Index[element]) {
				INDEX.FETCH(CACHE.CLASS.LibraryClass_Index[element]).attachments.forEach((E: string) => {
					if (!attachments.has(E)) { attachments.add(E); }
				});
			}
		});
	} while (!(attachmentLast === attachments.size) && attachmentLast === attachments.size);

	attachments.forEach((element) => {
		if (attachments.has(element)) { attachments.delete(element); }
	});

	const attachmentCollected = _loadAttachObjectsFromIndex(Array.from(attachments));

	return {
		indexMap: attachmentCollected.indexMap,
		object: attachmentCollected.object,
		list: Array.from(attachments),
	};
}

export default {
	attachIndex: buildAttachments,
	indexMaps: BuildFromIndexMap,
};
