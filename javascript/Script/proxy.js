import LibSetter from "../Worker/lib-setter.js";
import SCRIPT from "./file.js"
import STYLE from "../Style/parse.js"
import $ from "../Shell/index.js"
import { STASH } from "../data-cache.js";
import { xtyleTag } from "./tag.js";
import { DATA } from "../data-meta.js";

export default class Proxy {
    source = "";
    target = "";
    extensions = [];
    extnsProps = {};
    fileCache = {};
    stylesheetPath = '';
    sourceStylesheet = '';
    targetStylesheet = '';
    stylesheetContent = '';

    constructor({
        source,
        target,
        stylesheet,
        extensions,
        fileContents,
        stylesheetContent
    }) {
        this.source = source;
        this.target = target;
        this.extnsProps = extensions;
        this.stylesheet = stylesheet;
        this.extensions = Object.keys(extensions);
        this.stylesheetContent = stylesheetContent;
        this.sourceStylesheet = source + "/" + stylesheet;
        this.targetStylesheet = target + "/" + stylesheet;
        Object.entries(fileContents).forEach(([filePath, fileContent]) => this.SaveFile(filePath, fileContent));
    }

    SaveFile(filePath, fileContent) {
        this._DeleteFile(filePath);
        const file = LibSetter(this.target, this.source, filePath, fileContent, false).data;
        const response = SCRIPT(file, this.extnsProps[file.extension], "read");

        this.fileCache[file.filePath] = file;
        file.content = fileContent;
        file.classGroups = response.classesList;

        file.styleLocals = {};
        file.styleGlobals = {};
        file.errors = [];
        file.essentials = [];
        file.preBinds = [];
        file.postBinds = [];

        response.stylesList.forEach(style => {
            const response = STYLE.TAGSTYLE(style, file.metaFront, file.filePath);
            file.preBinds.push(...response.preBinds)
            file.postBinds.push(...response.postBinds)
            if (response.isEssentials) {
                file.essentials.push(...response.essentials)
            } else {
                file.usedIndexes.add(response.index);
                const styleMap = style.isGlobal ? file.styleGlobals : file.styleLocals;
                styleMap[style.selector] = response.index;
            }

            if (response.errors.length) {
                file.errors.push($.MOLD.tertiary.Topic(`${file.targetPath}:${style.rowMarker}:${style.columnMarker}`)
                    + "\n" + response.errors);
            }
        });

        file.styleMap = {
            file: { group: "target", id: `${DATA.WorkPath}/${file.targetPath}` },
            global: Object.keys(file.styleGlobals),
            local: Object.keys(file.styleLocals)
        }
    }

    Accumulator() {
        const C = {
            report: [],
            errors: [],
            styleMap: [],
            essentials: [],
            classGroups: [],
            classTracks: [],
            styleGlobals: {},
            preBinds: new Set(),
            postBinds: new Set()
        };
        let localCount = 0, globalCount = 0;
        C.styleMap.push({
            file: { group: "stylesheet", id: `${DATA.WorkPath}/${this.targetStylesheet}` },
            global: [],
            local: []
        });
        Object.values(this.fileCache).forEach(file => {

            C.styleMap.push(file.styleMap);
            C.errors.push(...file.errors);
            C.essentials.push(...file.essentials);
            C.classGroups.push(...file.classGroups);
            C.classTracks.push(...this._LoadTracks(file));
            file.preBinds.forEach(bind => C.preBinds.add(bind));
            file.postBinds.forEach(bind => C.postBinds.add(bind));
            Object.assign(C.styleGlobals, file.styleGlobals);

            const fileLocalCount = Object.keys(file.styleLocals).length;
            const fileGlobalCount = Object.keys(file.styleGlobals).length;
            localCount += fileLocalCount;
            globalCount += fileGlobalCount;
            const calcString = `${fileLocalCount}L + ${fileGlobalCount}G = ${(fileLocalCount + fileGlobalCount)}T`
            C.report.push($.MOLD.tertiary.Topic(`[ ${calcString} ] : ${file.targetPath}`, [
                ...Object.keys(file.styleLocals).map(c => $.style.text.White(c)),
                ...Object.keys(file.styleGlobals).map(c => $.style.text.Yellow(c))
            ], $.list.std.Entries));
        });

        const calcString = `${localCount}L + ${globalCount}G = ${(localCount + globalCount)}T`
        C.report.unshift($.MOLD.primary.Section(`PROXY : [ ${calcString} ] : ${this.target} -> ${this.source}`))

        return C;
    }

    RenderFiles(preBinds = new Set(), postBinds = new Set(), Command = "") {
        Object.values(this.fileCache).forEach(file => {
            const result = SCRIPT(file, this.extnsProps[file.extension], Command, { preBinds, postBinds },
                { Library: STASH.LibraryStyle2Index, Local: file.styleLocals, Global: STASH.GlobalsStyle2Index })
            file.midway = result.scribed;
        });
    }

    SummonFiles(SaveFiles = {}, stylesheet) {
        const styleBlock = `<style>${stylesheet}</style>`
        Object.values(this.fileCache).forEach(file => {
            if (file.extension !== "xcss")
                SaveFiles[file.sourcePath] = file.summon ? file.midway.replace(xtyleTag, styleBlock) : file.midway;
        })
        SaveFiles[this.sourceStylesheet] = stylesheet;
    }

    UpdateCache() {
        Object.entries(this.fileCache).forEach(([file, cache]) => {
            const fileContent = cache.content;
            this.SaveFile(file, fileContent);
        })
    }

    ClearFiles() {
        Object.values(this.fileCache).forEach(filePath => this._DeleteFile(filePath));
    }

    _LoadTracks(file) {
        return file.classGroups.reduce((ACC, group) => {
            const indexGroup = group.reduce((indexAcc, className) => {
                const index = (STASH.LibraryStyle2Index[className] ?? 0) +
                    (STASH.GlobalsStyle2Index[className] ?? 0) +
                    (file.styleLocals[className] ?? 0);
                if (index) indexAcc.push(index);
                return indexAcc
            }, [])
            if (indexGroup.length) ACC.push(indexGroup)
            return ACC
        }, [])
    }

    _DeleteFile(filePath) {
        if (this.fileCache[filePath]) {
            this.fileCache[filePath].usedIndexes.forEach(index => STYLE.INDEX.DISPOSE(index))
            delete this.fileCache[filePath];
        }
    }
}