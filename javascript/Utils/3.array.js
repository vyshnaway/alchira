export default {
	setback: (array) => {
		const lastSeen = new Map();
		array.forEach((item, index) => lastSeen.set(item, index));
		return array.filter((item, index) => lastSeen.get(item) === index);
	},
	fromNumberedObject: (obj, maxKey) => {
		return Array.from({ length: maxKey + 1 }, (_, i) => obj[i] ?? []);
	},
	longestSubChain: (parent = [], child = []) => {
		if (parent.length === 0 || child.length === 0) return [];
		let results = [];
		let remainingChild = [...child];
		let maxScore = 0,
			resultIndex = 0,
			parentInNow = 0,
			parentInLast = 0;

		while (remainingChild.length) {
			parentInLast = -1;
			const currentChain = [],
				remainingChildx = [];

			for (
				let index = child.indexOf(remainingChild[0]);
				index < child.length;
				index++
			) {
				parentInNow = parent.indexOf(child[index]);
				if (parentInLast < parentInNow) {
					currentChain.push(child[index]);
					parentInLast = parentInNow;
				} else if (
					remainingChild.includes(child[index]) &&
					parent.includes(child[index])
				)
					remainingChildx.push(child[index]);
			}

			if (maxScore < currentChain.length) {
				maxScore = currentChain.length;
				resultIndex = results.length;
				results.push(currentChain);
			}

			remainingChild = remainingChildx;
		}

		return results[resultIndex] ?? [];
	},
};
