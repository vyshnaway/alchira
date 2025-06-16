import FILING from "../data-filing.js";
import SCRIPT from "./file.js";
import STYLE from "../Style/parse.js";
import $ from "../Shell/index.js";
import { CACHE } from "../data-cache.js";
import { xtyleTag } from "./tag.js";
import { RAW } from "../data-cache.js";

export default class Proxy {
  source = "";
  target = "";
  extensions = [];
  extnsProps = {};
  fileCache = {};
  stylesheetPath = "";
  sourceStylesheet = "";
  targetStylesheet = "";
  stylesheetContent = "";

  constructor({
    source,
    target,
    stylesheet,
    extensions,
    fileContents,
    stylesheetContent,
  }) {
    this.source = source;
    this.target = target;
    this.extnsProps = extensions;
    this.stylesheet = stylesheet;
    this.extensions = Object.keys(extensions);
    this.stylesheetContent = stylesheetContent;
    this.sourceStylesheet = source + "/" + stylesheet;
    this.targetStylesheet = target + "/" + stylesheet;
    Object.entries(fileContents).forEach(([filePath, fileContent]) =>
      this.SaveFile(filePath, fileContent),
    );
  }

  SaveFile(filePath, fileContent) {
    this._DeleteFile(filePath);
    const file = FILING(this.target, this.source, filePath, fileContent, false);
    const sciptResponse = SCRIPT(file, this.extnsProps[file.extension]);

    this.fileCache[file.filePath] = file;
    file.content = fileContent;
    file.classGroups = sciptResponse.classesList;

    file.styleLocals = {};
    file.styleGlobals = {};
    file.errors = [];
    file.essentials = [];
    file.preBinds = [];
    file.postBinds = [];

    sciptResponse.stylesList.forEach((style) => {
      const IndexMap =
        style.scope === "GLOBAL"
          ? file.styleGlobals
          : style.scope === "LOCAL"
            ? file.styleLocals
            : {};
      const response = STYLE.TAGSTYLE(
        style,
        file.metaFront,
        file.filePath,
        RAW.WorkPath + "/" + file.targetPath,
        IndexMap,
      );

      file.preBinds.push(...response.preBinds);
      file.postBinds.push(...response.postBinds);

      if (style.scope === "ESSENTIAL")
        file.essentials.push(...response.essentials);
      else if (!response.isDuplicate) file.usedIndexes.add(response.index);

      if (response.errors.length) file.errors.push(...response.errors);
    });

    file.styleMap = {
      file: { group: "target", id: `${RAW.WorkPath}/${file.targetPath}` },
      global: Object.keys(file.styleGlobals),
      local: Object.keys(file.styleLocals),
    };
  }

  Accumulator() {
    let localCount = 0,
      globalCount = 0;
    const C = {
      report: [],
      errors: [],
      styleMap: [],
      essentials: [],
      classGroups: [],
      styleGlobals: {},
      preBinds: new Set(),
      postBinds: new Set(),
    };

    C.styleMap.push({
      file: {
        group: "stylesheet",
        id: `${RAW.WorkPath}/${this.targetStylesheet}`,
      },
      global: [],
      local: [],
    });

    Object.values(this.fileCache).forEach((file) => {
      C.styleMap.push(file.styleMap);
      C.errors.push(...file.errors);
      C.essentials.push(...file.essentials);
      C.classGroups.push(...file.classGroups);
      file.preBinds.forEach((bind) => C.preBinds.add(bind));
      file.postBinds.forEach((bind) => C.postBinds.add(bind));
      Object.assign(C.styleGlobals, file.styleGlobals);

      const fileLocalCount = Object.keys(file.styleLocals).length;
      const fileGlobalCount = Object.keys(file.styleGlobals).length;
      const calcString = `${fileLocalCount}L + ${fileGlobalCount}G = ${fileLocalCount + fileGlobalCount}T`;
      if (fileLocalCount + fileGlobalCount)
        C.report.push(
          $.MOLD.tertiary.Topic(
            `[ ${calcString} ] : ${file.targetPath}`,
            [
              ...Object.keys(file.styleLocals).map((c) =>
                $.style.text.White(c),
              ),
              ...Object.keys(file.styleGlobals).map((c) =>
                $.style.text.Yellow(c),
              ),
            ],
            $.list.std.Entries,
          ),
        );

      localCount += fileLocalCount;
      globalCount += fileGlobalCount;

      Object.values(file.styleLocals).forEach((index) => {
        const InStash = CACHE.Index2StylesObject[index];
        if (InStash.declarations.length > 1)
          C.errors.push(
            $.MOLD.failed.List(
              "Multiple declarations: " + InStash.selector,
              InStash.declarations,
              $.list.text.Bullets,
            ),
          );
      });
    });
    Object.values(C.styleGlobals).forEach((index) => {
      const InStash = CACHE.Index2StylesObject[index];
      if (InStash.declarations.length > 1)
        C.errors.push(
          $.MOLD.failed.List(
            "Multiple declarations: " + InStash.selector,
            InStash.declarations,
            $.list.text.Bullets,
          ),
        );
    });

    const calcString = `${localCount}L + ${globalCount}G = ${localCount + globalCount}T`;
    C.report.unshift(
      $.MOLD.primary.Section(
        `PROXY : [ ${calcString} ] : ${this.target} -> ${this.source}`,
      ),
    );

    return C;
  }

  RenderFiles(preBinds = new Set(), postBinds = new Set(), Command = "") {
    Object.values(this.fileCache).forEach((file) => {
      const result = SCRIPT(
        file,
        this.extnsProps[file.extension],
        Command,
        { preBinds, postBinds },
        {
          Library: CACHE.LibraryStyle2Index,
          Local: file.styleLocals,
          Global: CACHE.GlobalsStyle2Index,
        },
      );
      file.midway = result.scribed;
    });
  }

  SummonFiles(SaveFiles = {}, stylesheet) {
    const styleBlock = `<style>${stylesheet}</style>`;
    Object.values(this.fileCache).forEach((file) => {
      if (file.extension !== "xcss")
        SaveFiles[file.sourcePath] = file.summon
          ? file.midway.replace(xtyleTag, styleBlock)
          : file.midway;
    });
    SaveFiles[this.sourceStylesheet] = stylesheet;
  }

  UpdateCache() {
    Object.entries(this.fileCache).forEach(([file, cache]) => {
      const fileContent = cache.content;
      this.SaveFile(file, fileContent);
    });
  }

  ClearFiles() {
    Object.values(this.fileCache).forEach((filePath) =>
      this._DeleteFile(filePath),
    );
  }

  LoadTracks() {
    const classTracks = [];

    Object.values(this.fileCache).forEach((file) => {
      file.classGroups.forEach((group) => {
        const indexGroup = group.reduce((indexAcc, className) => {
          const index =
            (CACHE.LibraryStyle2Index[className] ?? 0) +
            (CACHE.GlobalsStyle2Index[className] ?? 0) +
            (file.styleLocals[className] ?? 0);
          if (index) indexAcc.push(index);
          return indexAcc;
        }, []);
        if (indexGroup.length) classTracks.push(indexGroup);
      });
    });
    return classTracks;
  }

  _DeleteFile(filePath) {
    if (this.fileCache[filePath]) {
      this.fileCache[filePath].usedIndexes.forEach((index) =>
        STYLE.INDEX.DISPOSE(index),
      );
      delete this.fileCache[filePath];
    }
  }
}
