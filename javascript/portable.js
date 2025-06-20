import fileman from "../interface/fileman.js";
import { CACHE, NAV, RAW } from "./data-cache.js";
import { INDEX } from "./data-set.js";
import $ from "./Shell/index.js";
import FORGE from "./Style/forge.js";
import RENDER from "./Style/render.js";

function portableCreator(essentials = [], portableName = `${RAW.PACKAGE}@${RAW.VERSION}`) {
    const preBinds = new Set(), postBinds = new Set();
    const tab = "    ", portable = [`# ${portableName}`], binding = [];

    const classList = Object.keys(CACHE.GlobalsStyle2Index);
    portable.push("", `## Xtyle Classes (${classList.length})`, "", ...classList.map((c) => "- `" + c + "`"), "---");

    Object.entries(CACHE.GlobalsStyle2Index).forEach(([selector, index]) => {
        const inStash = INDEX.STYLE(index);
        const object = inStash.object;
        const bindstack = FORGE.bindIndex(new Set(inStash.preBinds), new Set(inStash.postBinds));
        inStash.preBinds.forEach(bind => preBinds.add(bind))
        inStash.postBinds.forEach(bind => postBinds.add(bind))

        portable.push(
            "", `### Selector: \`${selector}\``, "",
            "````html",
            "<xtyle",
            ...Object.entries(object).reduce((accum, [subSelector, block]) => {
                if (subSelector === "") {
                    accum.push(
                        `${selector}="`,
                        tab + `@pre-bind ${bindstack.preBindsList.join(" ")}; `,
                        tab + `@post-bind ${bindstack.postBindsList.join(" ")}; `,
                        ...RENDER.forPortable(Object.entries(block), tab).map((line) => tab + line),
                        '"',
                    );
                } else {
                    if (subSelector[0] === "@") {
                        const ind = subSelector.indexOf(" ");
                        const rule = subSelector.slice(1, ind);
                        const query = subSelector.slice(ind + 1);

                        subSelector = `${rule}@{${query}}`;
                    }
                    accum.push(
                        `${subSelector}="`,
                        ...RENDER.forPortable(Object.entries(block), tab).map(
                            (line) => tab + line,
                        ),
                        '"',
                    );
                }
                return accum;
            }, []).map((line) => tab + line),
            "/>",
            "````",
        );
    });

    // Essentials
    portable.push(
        "",
        "## Portable Essentials",
        "",
        "````html",
        "<xtyle",
        ...essentials
            .reduce((accum, [subSelector, block]) => {
                if (subSelector[0] === "@") {
                    const ind = subSelector.indexOf(" ");
                    const rule = subSelector.slice(1, ind);
                    const query = subSelector.slice(ind + 1);

                    subSelector = `${rule}@{${query}}`;
                }
                accum.push(
                    `${subSelector}="`,
                    ...RENDER.forPortable(Object.entries(block), tab).map((line) => tab + line),
                    '"',
                );
                return accum;
            }, [])
            .map((line) => tab + line),
        "/>",
        "````",
    );

    const bindingResponse = FORGE.bindIndex(preBinds, postBinds);
    // console.log({ bindingResponse, preBinds, postBinds })

    return {
        portable: portable.join("\n"),
        binding: binding.join("\n"),
    };
}


export function GeneratePortable(essentials = []) {
    const portableName = `${RAW.PACKAGE}@${RAW.VERSION}`;
    const content = portableCreator(essentials, portableName)
    const json = { ...RAW.PORTABLEFRAME, readme: RAW.ReadMe, xtyling: content.portable, bindings: content.binding };
    const jsonPath = NAV.folder.portableNative + "/" + portableName + ".json";

    return { name: RAW.PACKAGE, version: RAW.VERSION, jsonPath: jsonPath, jsonContent: JSON.stringify(json) };
}

export async function FetchPortables() {
    const SaveFiles = {}, Status = [];

    await Promise.all(
        Object.entries(RAW.DEPENDENCIES).map(async ([Name, Link]) => {
            const response = fileman.read.json(Link, true);
            if ((await response).status) {
                const data = (await response).data;
                if (typeof data.readme === "string") {
                    SaveFiles[`${NAV.folder.portables}/${Name}/${Name}.md`] = data.readme;
                    delete data.readme;
                }
                if (typeof data.portable === "string") {
                    SaveFiles[`${NAV.folder.portables}/${Name}/${Name}.json`] = data.portable;
                    delete data.portable;
                }
                if (typeof data.bindings === "object") {
                    Object.entries(data.bindings).forEach(([prefix, content]) => {
                        if (typeof content === "string")
                            SaveFiles[`${NAV.folder.portables}/${Name}/${prefix}.${Name}.json`] = data.portable;
                    })
                    delete data.bindings;
                }
                SaveFiles[`${NAV.folder.portables}/${Name}/${Name}.json`] = JSON.stringify(data, " ", 2);
                Status[Name] = $.MOLD.success.Text("Fetch successfull.")
            } else {
                Status[Name] = $.MOLD.failed.Text("Fetch failed.")
            }
        })
    );
    
    return { Status, SaveFiles };
}