import LibSetter from "./Worker/lib-setter.js";
import SCRIPT from "./Script/file.js"
import STYLE from "./Style/parse.js"
import $ from "./Shell/index.js"
import { UnresIndexes, STASH } from "./craftsmen.js";

export default class Proxy {
    source = "";
    target = "";
    extensions = [];
    extnsProps = {};
    fileCache = {};
    cumulated = {}

    constructor({
        source,
        target,
        stylesheet,
        extensions,
        fileContents
    }) {
        this.source = source;
        this.target = target;
        this.extnsProps = extensions;
        this.extensions = Object.keys(extensions);
        this.sourceStylesheet = source + "/" + stylesheet;
        this.targetStylesheet = target + "/" + stylesheet;
        Object.entries(fileContents).forEach(([filePath, fileContent]) => this._UploadFile(filePath, fileContent));
    }

    _UploadFile(filePath, fileContent) {
        const file = LibSetter(this.target, this.source, filePath, fileContent, false).data;
        const response = SCRIPT.read(file, this.extnsProps[file.extension])
        this.fileCache[file.targetPath] = file;

        file.parsed = response.scribed;
        file.classGroups = response.classesList;

        file.styleLocals = {};
        file.styleGlobals = {};
        file.errors = [];
        file.preBinds = []
        file.postBinds = []
        file.essentials = []

        response.stylesList.forEach(style => {
            const response = STYLE.TAGSTYLE(style, file.metaFront, file.filePath);
            const styleMap = style.isGlobal ? file.styleGlobals : file.styleLocals;
            styleMap[style.selector] = response.index;

            file.preBinds.push(...response.preBinds)
            file.postBinds.push(...response.postBinds)
            file.essentials.push(...response.essentials)
            if (response.errors.length) {
                const block = $.MOLD.failed.Note(`${file.targetPath}:${style.rowMarker}:${style.columnMarker}`, response.errors, $.list.failed.Bullets);
                file.errors.push(block);
            }
        });

        file.styleMap = {
            file: { group: "target", id: `${file.targetPath}` },
            global: Object.keys(file.styleGlobals),
            local: Object.keys(file.styleLocals)
        }

        file.report = $.MOLD.std.Section(`File :  ${file.targetPath}`, [
            $.MOLD.std.Item((file.styleMap.global.length + file.styleMap.local.length) + " style definitions.\n"),
            $.MOLD.secondary.Footer("Global styles : " + file.styleMap.global.length, file.styleMap.global, $.list.secondary.Entries),
            $.MOLD.secondary.Footer("Local styles : " + file.styleMap.local.length, file.styleMap.local, $.list.secondary.Entries)
        ], $.list.std.Blocks)
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

    Accumulator() {
        this.cumulated.styleMap = [];
        this.cumulated.report = [];
        this.cumulated.errors = [];
        this.cumulated.preBinds = new Set();
        this.cumulated.postBinds = new Set();
        this.cumulated.styleGlobals = {};
        this.cumulated.classGroups = [];
        this.cumulated.classTracks = [];
        this.cumulated.essentials = [];

        Object.values(this.fileCache).forEach(file => {
            this.cumulated.styleMap.push(file.styleMap);
            this.cumulated.report.push(file.report);
            this.cumulated.errors.push(...file.errors);
            this.cumulated.essentials.push(...file.essentials);
            this.cumulated.classGroups.push(...file.classGroups);
            this.cumulated.classTracks.push(...this._LoadTracks(file));
            Object.assign(this.cumulated.styleGlobals, file.styleGlobals);
            file.preBinds.forEach(bind => this.cumulated.preBinds.add(bind));
            file.postBinds.forEach(bind => this.cumulated.postBinds.add(bind));
        })
    }

    SaveFile(filePath, fileContent) {
        this._UploadFile(filePath, fileContent)
        this.Accumulator();
    }

    DeleteFile(filePath) {
        UnresIndexes.push(
            ...Object.values(this.fileCache[filePath].styleLocals),
            ...Object.values(this.fileCache[filePath].styleGlobals))
        delete this.fileCache[filePath];
        this.Accumulator();
    }

    RenderFiles(Command = "", LibraryStyles = {}, GlobalStyles = {}) {

    }
}