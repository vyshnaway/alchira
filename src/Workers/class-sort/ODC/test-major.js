import oca from './oca.js';

function generate2dIntegerArray(size) {
    return Array.from({ length: size }, () =>
        Array.from({ length: size }, () => Math.floor(Math.random() * size))
    );
}

function benchmark(sequences, iterations = 10) {
    const results = {};
    const timings = {};

    const name = 'oca';
    const fn = oca;
    timings[name] = [];
    let firstResult;
    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const result = fn(sequences);
        timings[name].push(performance.now() - start);
        if (i === 0) firstResult = { result, resultx: fn(sequences, false) };
    }
    results[name] = firstResult;

    console.log('Results from first run:', results);
    console.log('\nTiming statistics (ms):');
    for (const [name, times] of Object.entries(timings)) {
        const avg = times.reduce((sum, t) => sum + t, 0) / iterations;
        console.log(`${name}: avg=${avg.toFixed(3)}, min=${Math.min(...times).toFixed(3)}, max=${Math.max(...times).toFixed(3)}`);
    }

    return { results, timings };
}

benchmark(generate2dIntegerArray(40), 1);
