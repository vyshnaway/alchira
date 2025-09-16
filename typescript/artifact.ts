import fileman from "./fileman.js";
import $ from "./shell/main.js";

import * as $$ from "./shell.js";
import * as CACHE from "./data/cache.js";
import * as _Config from "./type/config.js";
import * as _Style from "./type/style.js";


function ARCHIVE() {
    delete CACHE.STATIC.Archive.tweaks;
    delete CACHE.STATIC.Archive.vendors;
    delete CACHE.STATIC.Archive.proxymap;
    delete CACHE.STATIC.Archive.artifacts;


    CACHE.STATIC.Archive.exportsheet = Object.values(Object.values(CACHE.FILES.TARGETDIR).reduce((a, i) => {
        Object.assign(a, i.GetExports()); return a;
    }, {} as Record<string, _Style.ExportStyle>))
        .map(i => {
            if (i.symclass.includes('$$$')) { CACHE.STATIC.Archive.exportclasses?.push(i.symclass); }

            return [
                ('<' + [
                    i.element,
                    ...Object.entries(i.stylesheet).map(([A, V]) => {
                        const attachments = i.attachments.length? `${CACHE.ROOT.customOperations["attach"]} ${i.attachments.join(" ")};`: "";
                        if (A === "") {
                            return `${i.symclass}="${attachments}${V}"`;
                        } else {
                            return `${"{" + JSON.parse(i.symclass).join("}&{") + "}&"}="${V}"`;
                        }
                    })
                ].join(' ') + '>'),
                i.innertext,
                `</${i.element}>`,
                ``
            ].join(" ");
        }).join("\n\n");

    return CACHE.STATIC.Archive;
}

function DEPLOY(OUTFILES: Record<string, string> = {}) {
    const latest = JSON.stringify(CACHE.STATIC.Archive);
    OUTFILES[fileman.path.join(CACHE.PATH.folder.arcversion.path, `latest.json`)] = latest;
    OUTFILES[fileman.path.join(CACHE.PATH.folder.arcversion.path, `${CACHE.STATIC.Archive.version}.json`)] = latest;
    OUTFILES[CACHE.PATH.json.archive.path] = JSON.stringify(fileman.path.listFiles(CACHE.PATH.folder.arcversion.path));
}

export async function FETCH() {
    const outs: Record<string, string> = {}, Results: Record<string, string> = {};
    let message = "", status = true;

    if (CACHE.STATIC.Archive.artifacts) {
        await Promise.all(Object.entries(CACHE.STATIC.Archive.artifacts).map(async ([identifier, source]) => {

            const fetched = await (async function () {
                const [name, version] = typeof source === "string" ? source.split("@") : ["", ""];

                const result1 = await fileman.read.json(source, true);
                if (result1.status) { return result1.data; };

                const result2 = await fileman.read.json(CACHE.ROOT.url.Artifacts + `${name}/${version || "latest"}`, true);
                if (result2.status) { return result2.data; };

                return {};
            })() as _Config.Archive;

            if (CACHE.STATIC.Archive.name === identifier) {
                Results[identifier] = $.tag.Span("Artifact identifer collition with project.", $.preset.failed);
                status = false;
            } else if (Object.keys(fetched).length === 0) {
                Results[identifier] = $.tag.Span("Unavailable", $.preset.failed);
                status = false;
            } else {
                if (fetched.libraries) {
                    Object.entries(fetched.libraries).forEach(([lib, str]) => {
                        outs[fileman.path.join(CACHE.PATH.folder.artifact.path, identifier, `${lib}.${identifier}.css`)] = str;
                    });
                    delete fetched.libraries;
                }
                if (fetched.exportsheet) {
                    outs[fileman.path.join(CACHE.PATH.folder.artifact.path, identifier, `${identifier}.${CACHE.ROOT.extension}`)] = ([
                        `# ${fetched.name}@${fetched.version}`,
                        "",
                        "## Available SymClasses",
                        "",
                        ...(fetched.exportclasses ? fetched.exportclasses.map(i => `/${identifier}/${i}`) : []),
                        "",
                        "---",
                        "",
                        fetched.exportsheet,
                    ]).join("\n");
                    delete fetched.exportsheet;
                }
                if (fetched.readme) {
                    outs[fileman.path.join(CACHE.PATH.folder.artifact.path, identifier, `readme.md`)] = fetched.readme;
                    delete fetched.readme;
                }
                if (fetched.licence) {
                    outs[fileman.path.join(CACHE.PATH.folder.artifact.path, identifier, `licence.md`)] = fetched.licence;
                    delete fetched.licence;
                }
                Results[identifier] = $.tag.Span("Successfull", $.preset.success);
            }
        }));
    }
    message = $.MAKE("", $$.ListProps(Results), [$.list.Bullets, 0, $.preset.text]);
    return { status, outs, message };
}

export default {
    ARCHIVE,
    DEPLOY,
    FETCH,
};