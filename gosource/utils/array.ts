
/**
 * Returns a new array with only the last occurrence of each unique item kept.
 * @param array Input array with possible duplicates.
 */
function setback<T>(array: T[]): T[] {
	const lastSeen = new Map<T, number>();
	array.forEach((item, index) => lastSeen.set(item, index));

	return array.filter((item, index) => lastSeen.get(item) === index);
}

/**
 * Converts a numbered object into an array up to `maxKey`.
 * Missing entries are replaced with empty arrays.
 * @param obj Number-indexed object.
 * @param maxKey Maximum index to include.
 */
function fromNumberedObject<T>(obj: Record<number, T[]>, maxKey: number): T[][] {
	return Array.from({ length: maxKey + 1 }, (_, i) => obj[i] ?? []);
}

/**
 * Finds the longest sub-chain from `child` that appears in `parent` in the same order.
 * @param parent Reference sequence.
 * @param child Subsequence to check.
 */
function longestSubChain<T>(parent: T[] = [], child: T[] = []): T[] {
	if (parent.length === 0 || child.length === 0) { return []; }

	const results: T[][] = [];
	let remainingChild = [...child];
	let maxScore = 0;
	let resultIndex = 0;
	let parentInNow = 0;
	let parentInLast = 0;

	while (remainingChild.length) {
		parentInLast = -1;
		const currentChain: T[] = [];
		const remainingChildNext: T[] = [];

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
			) {
				remainingChildNext.push(child[index]);
			}
		}

		if (maxScore < currentChain.length) {
			maxScore = currentChain.length;
			resultIndex = results.length;
			results.push(currentChain);
		}

		remainingChild = remainingChildNext;
	}

	return results[resultIndex] ?? [];
}


/**
 * Check if subseq is a subsequence of sequence (maintains order)
 */
function isSubsequence(subseq: number[], sequence: number[]): boolean {
	if (subseq.length === 0) {
		return true;
	}

	let subseqIndex = 0;

	for (const element of sequence) {
		if (subseqIndex < subseq.length && element === subseq[subseqIndex]) {
			subseqIndex++;
			if (subseqIndex === subseq.length) {
				return true;
			}
		}
	}

	return subseqIndex === subseq.length;
}

function findArrSuperParent(array: number[], findFromArrays: number[][]): number[] | null {
	for (const candidate of findFromArrays) {
		if (isSubsequence(array, candidate)) {
			return candidate;
		}
	}

	return null;
}

export default {
	setback,
	fromNumberedObject,
	longestSubChain,
	isSubsequence,
	findArrSuperParent
};