import fn1 from './1.js';
import fn2 from './2.js';
import fn3 from './3.js';

function generate2dIntegerArray(size) {
    const matrix = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => Math.floor(Math.random() * size))
    );
    return matrix;
}

const sequences = generate2dIntegerArray(40);

function benchmark(sequences, iterations = 10) {
    // Define the functions to benchmark
    const functions = { fn1, fn2, fn3 };
    const results = {};  // Store outputs from the first run (result and resultx)
    const timings = {};  // Store timing measurements

    // Run each function for the specified number of iterations
    for (const [name, fn] of Object.entries(functions)) {
        timings[name] = [];
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();  // Start time
            const result = fn(sequences);     // Execute function without true
            const resultx = fn(sequences, false); // Execute function with true
            const end = performance.now();    // End time
            timings[name].push(end - start);  // Record combined time
            if (i === 0) {
                results[name] = { result, resultx }; // Save both results from first run
            }
        }
    }

    // Log results from the first run for verification
    console.log('Results from first run:');
    for (const [name, { result, resultx }] of Object.entries(results)) {
        console.log(`${name} (weighted):`, result);
        console.log(`${name} (boolean):`, resultx);
    }

    // Calculate and log timing statistics
    console.log('\nTiming statistics (ms, combined for both calls):');
    for (const [name, times] of Object.entries(timings)) {
        const min = Math.min(...times);
        const max = Math.max(...times);
        const average = times.reduce((sum, t) => sum + t, 0) / iterations;
        console.log(`${name}: avg=${average.toFixed(3)}, min=${min.toFixed(3)}, max=${max.toFixed(3)}`);
    }

    // Return results and timings for further use if needed
    return { results, timings };
}

// Run the benchmark
benchmark(sequences, 1);