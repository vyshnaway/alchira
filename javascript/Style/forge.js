import Use from "../Utils/index.js";
import { CACHE } from "../data-cache.js";
import { INDEX } from "../data-set.js";

function _styleSwitch(object) {
	const switched = Use.object.switch(object);
	const mins = [],
		maxs = [],
		flats = [];
	Object.keys(switched).forEach((key) => {
		const min = key.indexOf("min"),
			max = key.indexOf("max");
		if (key !== "") {
			if (min < max) mins.push(key);
			if (min > max) maxs.push(key);
			if (min === max) flats.push(key);
		}
	});

	const keys = [...flats.sort(), ...mins.sort().reverse(), ...maxs.sort()];
	const result = switched[""] ?? {};
	keys.forEach((key) => (result[key] = switched[key]));
	return result;
}

function BuildFromIndexMap(selectorIndexObject) {
	const preBinds = [], postBinds = [];
	const object = Object.entries(_styleSwitch(
		Object.entries(selectorIndexObject).reduce((A, [selector, index]) => {
			A[selector] = INDEX.STYLE(index).object;
			preBinds.push(...INDEX.STYLE(index).preBinds)
			postBinds.push(...INDEX.STYLE(index).postBinds)
			return A;
		}, {}),
	));

	return { object, preBinds, postBinds }
}

function _loadBindObjectsFromIndex(
	order = [],
) {
	const indexMap = {}, result = {};

	order.forEach((identity) => {
		const index = CACHE.LibraryStyle2Index[identity];
		if (index) {
			const selector = INDEX.STYLE(index).selector;
			const evaluated = (["@", "."].includes(selector[0]) ? "" : ".") + selector
			indexMap[evaluated] = index;
			result[evaluated] = INDEX.STYLE(index).object;
		}
	});

	const object = _styleSwitch(result);
	return { object, indexMap };
}

function buildBinds(
	preBinds = new Set(),
	postBinds = new Set()
) {
	let preLast = preBinds.size, postLast = postBinds.size;

	do {
		preBinds.forEach((element) => {
			if (CACHE.LibraryStyle2Index[element]) {
				INDEX.STYLE(CACHE.LibraryStyle2Index[element]).preBinds.forEach((E) => {
					if (!preBinds.has(E)) preBinds.add(E);
				});
			}
		});
		postBinds.forEach((element) => {
			if (CACHE.LibraryStyle2Index[element]) {
				INDEX.STYLE(CACHE.LibraryStyle2Index[element]).postBinds.forEach((E) => {
					if (!postBinds.has(E)) postBinds.add(E);
				});
			}
		});
	} while (!(preLast === preBinds.size) && postLast === preBinds.size);

	preBinds.forEach((element) => {
		if (postBinds.has(element)) preBinds.delete(element);
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
