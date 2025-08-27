import $ from './shell/main.js';

export function PropMap(record: Record<string, string>, preset: string[] = [], ...styles: string[]) {
    const keys: string[] = [];
    const values: string[] = [];

    Object.entries(record).forEach(([k, v]) => {
        keys.push(k);
        values.push(v);
    });

    return keys.map((k, i) => k + ": " + $.FMT(values[i], ...preset, ...styles));
}
