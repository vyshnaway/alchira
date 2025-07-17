import fileman from "../fileman.js";
import { APP, CACHE, NAV, RAW, STACK } from "../data-cache.js";
import { INDEX } from "../data-init.js";
import $ from "../Shell/main.js";
import FORGE from "../Style/forge.js";
import RENDER from "../Style/render.js";

const tab = "    ";

function getLibPrifix(string = '') {
    let id = 0, lib = '';
    const chars = string.split("");
    for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        if (ch === "$") id++;
        else if (!id) lib += ch;
        else break;
    }
    return lib.length ? `${lib}.${id}` : `${id}`;
}

export function generateXtyleBlock(selector, object, preBindsList, postBindsList) {
    return [
        "", `### Selector: \`${selector}\``, "",
        "````html",
        "<xtyle",
        ...Object.entries(object).reduce((accum, [subSelector, block]) => {
            if (subSelector === "") {
                accum.push(
                    `${selector}="`,
                    tab + `@pre-bind ${preBindsList.join(" ")}; `,
                    tab + `@post-bind ${postBindsList.join(" ")}; `,
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
    ]
}

function portableCreator(essentials = [], portableName = `${RAW.PACKAGE}@${RAW.VERSION}`) {
    const preBinds = new Set(), postBinds = new Set();
    const portable = [`# ${portableName}`];

    const classList = Object.keys(CACHE.GlobalsStyle2Index);
    portable.push("", `## Xtyle Classes (${classList.length})`, "", ...classList.map((c) => "- `" + c + "`"), "---");

    Object.entries(CACHE.GlobalsStyle2Index).forEach(([selector, index]) => {
        const inStash = INDEX.STYLE(index);
        const object = inStash.object;
        const bindStack = FORGE.bindIndex(new Set(inStash.preBinds), new Set(inStash.postBinds));
        inStash.preBinds.forEach(bind => preBinds.add(bind))
        inStash.postBinds.forEach(bind => postBinds.add(bind))

        portable.push(...generateXtyleBlock(selector, object, bindStack.preBindsList, bindStack.postBindsList));
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

    const bindingStack = {};
    preBinds.forEach(bind => {
        const prefix = getLibPrifix(bind);
        if (bindingStack[prefix]) bindingStack[prefix].add(bind)
        else bindingStack[prefix] = new Set([bind])
    })
    postBinds.forEach(bind => {
        const prefix = getLibPrifix(bind);
        if (bindingStack[prefix]) bindingStack[prefix].add(bind)
        else bindingStack[prefix] = new Set([bind])
    })

    const bindings = Object.entries(bindingStack).reduce((A, [key, value]) => {
        A[key] = RENDER.forPortable(Object.entries(FORGE.bindIndex(value).preBindsObject)).join("\n");
        return A;
    }, {})

    return { portable: portable.join("\n"), bindings };
}

export function GeneratePortable(essentials = []) {
    const portableName = `${RAW.PACKAGE}@${RAW.VERSION}`;
    const content = portableCreator(essentials, portableName)
    const json = { ...RAW.PORTABLEFRAME, readme: RAW.ReadMe, xtyling: content.portable, bindings: content.bindings };
    const jsonPath = NAV.folder.mybundles + "/" + portableName + ".json";

    return { name: RAW.PACKAGE, version: RAW.VERSION, jsonPath: jsonPath, jsonContent: JSON.stringify(json) };
}

export function SplitGlobalForComponents() {
    const t = new Date();
    const date = `${t.getFullYear()}-${(t.getMonth() + 1).toString().padStart(2, "0")}-${t.getDate().toString().padStart(2, "0")}`;
    const time = `${t.getHours().toString().padStart(2, "0")}:${t.getMinutes().toString().padStart(2, "0")}:${t.getSeconds().toString().padStart(2, "0")}`;
    const session = `${date} ${time}`;

    const SaveFiles = {}, Report = [];
    Object.values(STACK.PROXYCACHE).forEach((proxy) => {
        Object.assign(SaveFiles, proxy.ComponentSpilt(session))
    })
    const filePaths = Object.keys(SaveFiles);
    Report.push(
        $.MOLD.std.Block(filePaths, $.list.std.Bullets),
        $.MOLD.std.Footer(`${filePaths.length} files were generated.`),
    )

    return { SaveFiles, ConsoleReport: $.MOLD.std.Block(Report) }
}

export async function FetchPortables(portable = "") {
    const SaveFiles = {}, Status = [];

    let [portableName, portableVersion] = typeof portable === "string" ? portable.split("@") : ["", ""];
    portableVersion = portableVersion || "latest";
    const portableLink = `${APP.PortablesCdn}/${portableName}/${portableVersion}`;
    const references = portableName.length ? { [portableName]: portableLink } : RAW.DEPENDENCIES;

    await Promise.all(
        Object.entries(references).map(async ([Name, Link]) => {
            if (RAW.PACKAGE === Name) {
                Status[Name] = $.MOLD.failed.Text("Can't install a portable with Native-Portable-Name.")
            } else {
                const response = fileman.read.json(Link, true);
                if ((await response).status) {
                    const data = (await response).data;
                    if (typeof data.readme === "string") {
                        SaveFiles[`${NAV.folder.portables}/${Name}/${Name}.md`] = data.readme || "";
                        delete data.readme;
                    }
                    if (typeof data.xtyling === "string") {
                        SaveFiles[`${NAV.folder.portables}/${Name}/${Name}.xcss`] = data.xtyling || "";
                        delete data.xtyling;
                    }
                    if (typeof data.bindings === "object") {
                        Object.entries(data.bindings).forEach(([prefix, content]) => {
                            if (typeof content === "string")
                                SaveFiles[`${NAV.folder.portables}/${Name}/${prefix}.${Name}.css`] = content || "";
                        })
                        delete data.bindings;
                    }
                    SaveFiles[`${NAV.folder.portables}/${Name}/${Name}.json`] = JSON.stringify(data, " ", 2);
                    Status[Name] = $.MOLD.success.Text("Fetch successfull.")
                } else {
                    Status[Name] = $.MOLD.failed.Text("Fetch failed.")
                }
            }
        })
    );

    return { Status, SaveFiles };
}