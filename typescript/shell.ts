import $ from './shell/main.js';
import * as _support from './type/support.js';

export function ListProps(record: Record<string, string>, keystyles: string[] = [], valstyles: string[] = []) {
    const keys: string[] = [];
    const values: string[] = [];

    Object.entries(record).forEach(([k, v]) => {
        keys.push($.FMT(k, ...keystyles));
        values.push($.FMT(v, ...valstyles));
    });

    return $.list.Level(keys).map((k, i) => k + ": " + $.FMT(values[i], ...valstyles));
}
export function ListSteps(heading: string, steps: string[]) {
    return $.MAKE(
        $.tag.H2(heading, $.preset.primary),
        steps,
        [$.list.Bullets, 0, []],
    );
}
export function ListRecord(heading: string, record: Record<string, string> = {}) {
    return $.MAKE(
        $.tag.H2(heading, $.preset.primary),
        ListProps(record, $.preset.primary, $.preset.text),
        [$.list.Bullets, 0, $.preset.primary]
    );
}

export function ListCatalog(heading: string, items: string[] = []) {
    return $.MAKE(
        $.tag.H2(heading, $.preset.primary),
        items,
        [$.list.Catalog, 0, []]
    );
}
export function ClassChart(heading: string, items: Record<string, string[]>) {
    return Object.keys(items).length ? $.MAKE(
        $.tag.H2(heading, $.preset.primary),
        Object.entries(items).map(([heading, entries]) =>
            $.MAKE(
                $.tag.H5(heading, $.preset.tertiary),
                entries,
                [$.list.Catalog, 0, $.preset.primary]
            ),
        )
    ) : "";
}

export function HashruleError(
    primitive: string,
    cause: string,
    source: string,
    message: string,
    preview: Record<string, string>,
) {
    preview["ERROR BY"] = $.FMT(cause, $.style.AS_Bold, $.style.TC_Normal_Red);
    const error =
        $.tag.Li($.FMT(source, ...$.preset.tertiary), $.preset.failed, $.style.AS_Bold)
        + "\n " + $.tag.Tab(1)
        + $.MAKE(
            $.FMT(primitive, ...$.preset.primary) + " : " + $.FMT(message, ...$.preset.failed),
            ListProps(preview, $.preset.primary, $.preset.tertiary),
            [$.list.Waterfall, 1, $.preset.primary],
        );

    preview["ERROR BY"] = cause;
    const diagnostic: _support.Diagnostic = {
        message: $.MAKE(
            primitive + " : " + message,
            ListProps(preview),
            [$.list.Waterfall, 0, []],
        ),
        sources: [source]
    };

    return {
        error,
        diagnostic
    };
}
export function HashruleReport(
    hashrules: Record<string, string>,
    errors: string[]
) {
    return $.MAKE(ListRecord(
        "Active Hashrules", hashrules),
        errors.length ? [
            $.MAKE(
                $.tag.H4("Invalid Hashrules", $.preset.failed),
                errors
            )
        ] : [],
    );
}

export function GenerateError(
    message: string,
    declaration: string[]
): {
    error: string,
    diagnostic: _support.Diagnostic
} {
    return {
        error: $.MAKE(
            $.tag.Li(message, $.preset.warning),
            declaration,
            [$.list.Bullets, 1, $.preset.tertiary]
        ),
        diagnostic: {
            message: message,
            sources: declaration
        }
    };
}
export function ReportError(message_pass: string, message_fail: string, items: string[]) {
    return $.MAKE(
        Object.keys(items).length === 0
            ? $.tag.H5(message_pass, $.preset.success)
            : $.tag.H5(message_fail, $.preset.failed)
        , items,
        [$.list.Bullets, 0, Object.keys(items).length === 0 ? $.preset.success : $.preset.failed]
    );
}

// export function ReportError(message_pass: string, message_fail: string, items: string[]) {
//     return $.MAKE(
//         Object.keys(items).length === 0
//             ? $.FMT(message_pass, ...$.preset.success, $.style.AS_Bold)
//             : $.FMT(message_fail, ...$.preset.failed, $.style.AS_Bold)
//         , items,
//         [$.list.Bullets, 0, Object.keys(items).length === 0 ? $.preset.success : $.preset.failed]
//     );
// }