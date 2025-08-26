import $ from './Shell/main.js'

function PropMap(record: Record<string, string>, color: keyof typeof $.list) {
    const keys: string[] = [];
    const values: string[] = [];

    Object.entries(record).forEach(([k, v]) => {
        keys.push(k);
        values.push(v);
    });

    const coloredKeys = $.list[color].Level(keys.map(k => $.MAKE(k, $.style.AS_Bold)));
    return coloredKeys.map((k, i) => k + ": " + values[i]);
}

export const Props = {
    std: (record: Record<string, string>) => PropMap(record, 'std'),
    title: (record: Record<string, string>) => PropMap(record, 'title'),
    text: (record: Record<string, string>) => PropMap(record, 'text'),
    primary: (record: Record<string, string>) => PropMap(record, 'primary'),
    secondary: (record: Record<string, string>) => PropMap(record, 'secondary'),
    tertiary: (record: Record<string, string>) => PropMap(record, 'tertiary'),
    warning: (record: Record<string, string>) => PropMap(record, 'warning'),
    failed: (record: Record<string, string>) => PropMap(record, 'failed'),
    success: (record: Record<string, string>) => PropMap(record, 'success'),
};