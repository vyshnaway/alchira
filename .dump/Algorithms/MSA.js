// Function to compute the score for a given column (array of elements)
function computeScore(elements) {
    const freq = {};
    for (const e of elements) {
        freq[e] = (freq[e] || 0) + 1;
    }
    let score = 0;
    for (const v in freq) {
        if (freq[v] >= 2) {
            score += freq[v];
        }
    }
    return score;
}

// Main function to maximize the score
function maxScore(sequences) {
    const N = sequences.length; // Number of rows
    const k = sequences.map(seq => seq.length); // Number of elements per row
    const memo = new Map(); // Memoization table

    // DP function: pos is an array where pos[i] is the next index to place in row i
    function dp(pos) {
        // Convert pos array to a string key for memoization
        const state = pos.join(',');
        if (memo.has(state)) {
            return memo.get(state);
        }

        // Base case: all rows are fully processed
        if (pos.every((p, i) => p > k[i])) {
            return 0;
        }

        let maxScoreFromHere = 0;
        // Try all non-empty subsets using bitmask (1 to 2^N - 1)
        for (let mask = 1; mask < (1 << N); mask++) {
            const S = []; // Elements placed in this column
            const nextPos = [...pos]; // Next state
            let valid = true;

            // Build the subset based on the mask
            for (let i = 0; i < N; i++) {
                if (mask & (1 << i)) {
                    if (pos[i] > k[i]) {
                        valid = false;
                        break;
                    }
                    S.push(sequences[i][pos[i] - 1]); // Place the element
                    nextPos[i]++; // Advance position in this row
                }
            }

            // Skip if invalid or empty subset
            if (!valid || S.length === 0) {
                continue;
            }

            // Compute score for this column and recurse
            const scoreS = computeScore(S);
            const total = scoreS + dp(nextPos);
            maxScoreFromHere = Math.max(maxScoreFromHere, total);
        }

        memo.set(state, maxScoreFromHere);
        return maxScoreFromHere;
    }

    // Start with all rows at position 1
    const initialPos = Array(N).fill(1);
    return dp(initialPos);
}

function reconstructArrangement(sequences) {
    const N = sequences.length;
    const k = sequences.map(seq => seq.length);
    const memo = new Map();
    const choice = new Map(); // To store the chosen subset at each state

    function dp(pos) {
        const state = pos.join(',');
        if (memo.has(state)) {
            return memo.get(state);
        }
        if (pos.every((p, i) => p > k[i])) {
            return 0;
        }

        let maxScoreFromHere = 0;
        let bestMask = 0;
        for (let mask = 1; mask < (1 << N); mask++) {
            const S = [];
            const nextPos = [...pos];
            let valid = true;
            for (let i = 0; i < N; i++) {
                if (mask & (1 << i)) {
                    if (pos[i] > k[i]) {
                        valid = false;
                        break;
                    }
                    S.push(sequences[i][pos[i] - 1]);
                    nextPos[i]++;
                }
            }
            if (!valid || S.length === 0) continue;

            const scoreS = computeScore(S);
            const total = scoreS + dp(nextPos);
            if (total > maxScoreFromHere) {
                maxScoreFromHere = total;
                bestMask = mask;
            }
        }
        memo.set(state, maxScoreFromHere);
        choice.set(state, bestMask);
        return maxScoreFromHere;
    }

    const initialPos = Array(N).fill(1);
    dp(initialPos);

    // Reconstruct the table
    const arrangement = Array(N).fill().map(() => []);
    let pos = initialPos;
    while (!pos.every((p, i) => p > k[i])) {
        const state = pos.join(',');
        const mask = choice.get(state);
        for (let i = 0; i < N; i++) {
            if (mask & (1 << i)) {
                arrangement[i].push(sequences[i][pos[i] - 1]);
                pos[i]++;
            } else {
                arrangement[i].push(0);
            }
        }
    }

    return arrangement;
}


const sequences =
    [
        [1, 2, 3],
        [1, 5, 3],
        [7, 8,],
        [7, 9, 1],
        [10, 5, 1],
        [5, 1, 10],
    ];
// console.log(maxScore(sequences)); // Outputs: 6

// Print the arrangement
const arrangement = reconstructArrangement(sequences);
console.log("Optimal Arrangement:");
arrangement.forEach(row => console.log(row));