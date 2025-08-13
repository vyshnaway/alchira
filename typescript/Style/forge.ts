import Use from "../Utils/main.js";
import { CACHE } from "../Data/cache.js";
import { INDEX } from "../Data/init.js";

export function _styleSwitch(object: Record<string, Record<string, object | string>>) {
	const switched = Use.object.switch(object);
	const mins: string[] = [], maxs: string[] = [], inits: string[] = [], flats: string[] = [];

	Object.keys(switched).forEach((key) => {
		const min = key.indexOf("min"),
			max = key.indexOf("max");
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
	[...flats.sort(), ...mins.sort().reverse(), ...maxs.sort()]
		.forEach((key) => (result[key] = switched[key]));
	return result;
}


function BuildFromIndexMap(selectorIndexObject: Record<string, number>) {
	const preBinds: string[] = [], postBinds: string[] = [];
	const object = Object.entries(_styleSwitch(
		Object.entries(selectorIndexObject).reduce((A: Record<string, Record<string, object>>, [selector, index]) => {
			const imported = INDEX.IMPORT(index);
			A[selector] = imported.object;
			preBinds.push(...imported.preBinds);
			postBinds.push(...imported.postBinds);
			return A;
		}, {}),
	));

	return { object, preBinds, postBinds };
}


function _loadBindObjectsFromIndex(
	order: string[] = [],
) {
	const indexMap: Record<string, number> = {}, result: Record<string, Record<string, object>> = {};

	order.forEach((identity) => {
		const index = CACHE.LibraryStyle2Index[identity];
		if (index) {
			const selector = INDEX.IMPORT(index).selector;
			const evaluated = (["@", "."].includes(selector[0]) ? "" : ".") + selector;
			indexMap[evaluated] = index;
			result[evaluated] = INDEX.IMPORT(index).object;
		}
	});

	const object = _styleSwitch(result);
	return { object, indexMap };
}

function buildBinds(
	preBinds = new Set<string>(),
	postBinds = new Set<string>()
) {
	const preLast: number = preBinds.size, postLast: number = postBinds.size;

	do {
		preBinds.forEach((element) => {
			if (CACHE.LibraryStyle2Index[element]) {
				INDEX.IMPORT(CACHE.LibraryStyle2Index[element]).preBinds.forEach((E: string) => {
					if (!preBinds.has(E)) { preBinds.add(E); }
				});
			}
		});
		postBinds.forEach((element) => {
			if (CACHE.LibraryStyle2Index[element]) {
				INDEX.IMPORT(CACHE.LibraryStyle2Index[element]).postBinds.forEach((E: string) => {
					if (!postBinds.has(E)) { postBinds.add(E); }
				});
			}
		});
	} while (!(preLast === preBinds.size) && postLast === preBinds.size);

	preBinds.forEach((element) => {
		if (postBinds.has(element)) { preBinds.delete(element); }
	});

	const preBindsCollected = _loadBindObjectsFromIndex(Array.from(preBinds));
	const postBindsCollected = _loadBindObjectsFromIndex(Array.from(postBinds));

	return {
		preBindsIndexMap: preBindsCollected.indexMap,
		postBindsIndexMap: postBindsCollected.indexMap,
		postBindsObject: postBindsCollected.object,
		preBindsObject: preBindsCollected.object,
		postBindsList: Array.from(postBinds),
		preBindsList: Array.from(preBinds),
	};
}

export default {
	bindIndex: buildBinds,
	indexMaps: BuildFromIndexMap,
};
