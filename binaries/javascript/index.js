#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/readdirp/index.js
var require_readdirp = __commonJS({
  "node_modules/readdirp/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ReaddirpStream = exports2.EntryTypes = void 0;
    exports2.readdirp = readdirp;
    exports2.readdirpPromise = readdirpPromise;
    var promises_1 = require("node:fs/promises");
    var node_stream_1 = require("node:stream");
    var node_path_1 = require("node:path");
    exports2.EntryTypes = {
      FILE_TYPE: "files",
      DIR_TYPE: "directories",
      FILE_DIR_TYPE: "files_directories",
      EVERYTHING_TYPE: "all"
    };
    var defaultOptions = {
      root: ".",
      fileFilter: (_entryInfo) => true,
      directoryFilter: (_entryInfo) => true,
      type: exports2.EntryTypes.FILE_TYPE,
      lstat: false,
      depth: 2147483648,
      alwaysStat: false,
      highWaterMark: 4096
    };
    Object.freeze(defaultOptions);
    var RECURSIVE_ERROR_CODE = "READDIRP_RECURSIVE_ERROR";
    var NORMAL_FLOW_ERRORS = /* @__PURE__ */ new Set(["ENOENT", "EPERM", "EACCES", "ELOOP", RECURSIVE_ERROR_CODE]);
    var ALL_TYPES = [
      exports2.EntryTypes.DIR_TYPE,
      exports2.EntryTypes.EVERYTHING_TYPE,
      exports2.EntryTypes.FILE_DIR_TYPE,
      exports2.EntryTypes.FILE_TYPE
    ];
    var DIR_TYPES = /* @__PURE__ */ new Set([
      exports2.EntryTypes.DIR_TYPE,
      exports2.EntryTypes.EVERYTHING_TYPE,
      exports2.EntryTypes.FILE_DIR_TYPE
    ]);
    var FILE_TYPES = /* @__PURE__ */ new Set([
      exports2.EntryTypes.EVERYTHING_TYPE,
      exports2.EntryTypes.FILE_DIR_TYPE,
      exports2.EntryTypes.FILE_TYPE
    ]);
    var isNormalFlowError = (error) => NORMAL_FLOW_ERRORS.has(error.code);
    var wantBigintFsStats = process.platform === "win32";
    var emptyFn = (_entryInfo) => true;
    var normalizeFilter = (filter) => {
      if (filter === void 0)
        return emptyFn;
      if (typeof filter === "function")
        return filter;
      if (typeof filter === "string") {
        const fl = filter.trim();
        return (entry) => entry.basename === fl;
      }
      if (Array.isArray(filter)) {
        const trItems = filter.map((item) => item.trim());
        return (entry) => trItems.some((f) => entry.basename === f);
      }
      return emptyFn;
    };
    var ReaddirpStream = class extends node_stream_1.Readable {
      constructor(options = {}) {
        super({
          objectMode: true,
          autoDestroy: true,
          highWaterMark: options.highWaterMark
        });
        const opts = { ...defaultOptions, ...options };
        const { root: root2, type } = opts;
        this._fileFilter = normalizeFilter(opts.fileFilter);
        this._directoryFilter = normalizeFilter(opts.directoryFilter);
        const statMethod = opts.lstat ? promises_1.lstat : promises_1.stat;
        if (wantBigintFsStats) {
          this._stat = (path3) => statMethod(path3, { bigint: true });
        } else {
          this._stat = statMethod;
        }
        this._maxDepth = opts.depth ?? defaultOptions.depth;
        this._wantsDir = type ? DIR_TYPES.has(type) : false;
        this._wantsFile = type ? FILE_TYPES.has(type) : false;
        this._wantsEverything = type === exports2.EntryTypes.EVERYTHING_TYPE;
        this._root = (0, node_path_1.resolve)(root2);
        this._isDirent = !opts.alwaysStat;
        this._statsProp = this._isDirent ? "dirent" : "stats";
        this._rdOptions = { encoding: "utf8", withFileTypes: this._isDirent };
        this.parents = [this._exploreDir(root2, 1)];
        this.reading = false;
        this.parent = void 0;
      }
      async _read(batch) {
        if (this.reading)
          return;
        this.reading = true;
        try {
          while (!this.destroyed && batch > 0) {
            const par = this.parent;
            const fil = par && par.files;
            if (fil && fil.length > 0) {
              const { path: path3, depth } = par;
              const slice = fil.splice(0, batch).map((dirent) => this._formatEntry(dirent, path3));
              const awaited = await Promise.all(slice);
              for (const entry of awaited) {
                if (!entry)
                  continue;
                if (this.destroyed)
                  return;
                const entryType = await this._getEntryType(entry);
                if (entryType === "directory" && this._directoryFilter(entry)) {
                  if (depth <= this._maxDepth) {
                    this.parents.push(this._exploreDir(entry.fullPath, depth + 1));
                  }
                  if (this._wantsDir) {
                    this.push(entry);
                    batch--;
                  }
                } else if ((entryType === "file" || this._includeAsFile(entry)) && this._fileFilter(entry)) {
                  if (this._wantsFile) {
                    this.push(entry);
                    batch--;
                  }
                }
              }
            } else {
              const parent = this.parents.pop();
              if (!parent) {
                this.push(null);
                break;
              }
              this.parent = await parent;
              if (this.destroyed)
                return;
            }
          }
        } catch (error) {
          this.destroy(error);
        } finally {
          this.reading = false;
        }
      }
      async _exploreDir(path3, depth) {
        let files;
        try {
          files = await (0, promises_1.readdir)(path3, this._rdOptions);
        } catch (error) {
          this._onError(error);
        }
        return { files, depth, path: path3 };
      }
      async _formatEntry(dirent, path3) {
        let entry;
        const basename = this._isDirent ? dirent.name : dirent;
        try {
          const fullPath = (0, node_path_1.resolve)((0, node_path_1.join)(path3, basename));
          entry = { path: (0, node_path_1.relative)(this._root, fullPath), fullPath, basename };
          entry[this._statsProp] = this._isDirent ? dirent : await this._stat(fullPath);
        } catch (err) {
          this._onError(err);
          return;
        }
        return entry;
      }
      _onError(err) {
        if (isNormalFlowError(err) && !this.destroyed) {
          this.emit("warn", err);
        } else {
          this.destroy(err);
        }
      }
      async _getEntryType(entry) {
        if (!entry && this._statsProp in entry) {
          return "";
        }
        const stats = entry[this._statsProp];
        if (stats.isFile())
          return "file";
        if (stats.isDirectory())
          return "directory";
        if (stats && stats.isSymbolicLink()) {
          const full = entry.fullPath;
          try {
            const entryRealPath = await (0, promises_1.realpath)(full);
            const entryRealPathStats = await (0, promises_1.lstat)(entryRealPath);
            if (entryRealPathStats.isFile()) {
              return "file";
            }
            if (entryRealPathStats.isDirectory()) {
              const len = entryRealPath.length;
              if (full.startsWith(entryRealPath) && full.substr(len, 1) === node_path_1.sep) {
                const recursiveError = new Error(`Circular symlink detected: "${full}" points to "${entryRealPath}"`);
                recursiveError.code = RECURSIVE_ERROR_CODE;
                return this._onError(recursiveError);
              }
              return "directory";
            }
          } catch (error) {
            this._onError(error);
            return "";
          }
        }
      }
      _includeAsFile(entry) {
        const stats = entry && entry[this._statsProp];
        return stats && this._wantsEverything && !stats.isDirectory();
      }
    };
    exports2.ReaddirpStream = ReaddirpStream;
    function readdirp(root2, options = {}) {
      let type = options.entryType || options.type;
      if (type === "both")
        type = exports2.EntryTypes.FILE_DIR_TYPE;
      if (type)
        options.type = type;
      if (!root2) {
        throw new Error("readdirp: root argument is required. Usage: readdirp(root, options)");
      } else if (typeof root2 !== "string") {
        throw new TypeError("readdirp: root argument must be a string. Usage: readdirp(root, options)");
      } else if (type && !ALL_TYPES.includes(type)) {
        throw new Error(`readdirp: Invalid type passed. Use one of ${ALL_TYPES.join(", ")}`);
      }
      options.root = root2;
      return new ReaddirpStream(options);
    }
    function readdirpPromise(root2, options = {}) {
      return new Promise((resolve, reject) => {
        const files = [];
        readdirp(root2, options).on("data", (entry) => files.push(entry)).on("end", () => resolve(files)).on("error", (error) => reject(error));
      });
    }
    exports2.default = readdirp;
  }
});

// node_modules/chokidar/handler.js
var require_handler = __commonJS({
  "node_modules/chokidar/handler.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NodeFsHandler = exports2.EVENTS = exports2.isIBMi = exports2.isFreeBSD = exports2.isLinux = exports2.isMacos = exports2.isWindows = exports2.IDENTITY_FN = exports2.EMPTY_FN = exports2.STR_CLOSE = exports2.STR_END = exports2.STR_DATA = void 0;
    var fs_1 = require("fs");
    var promises_1 = require("fs/promises");
    var sysPath = require("path");
    var os_1 = require("os");
    exports2.STR_DATA = "data";
    exports2.STR_END = "end";
    exports2.STR_CLOSE = "close";
    var EMPTY_FN = () => {
    };
    exports2.EMPTY_FN = EMPTY_FN;
    var IDENTITY_FN = (val) => val;
    exports2.IDENTITY_FN = IDENTITY_FN;
    var pl = process.platform;
    exports2.isWindows = pl === "win32";
    exports2.isMacos = pl === "darwin";
    exports2.isLinux = pl === "linux";
    exports2.isFreeBSD = pl === "freebsd";
    exports2.isIBMi = (0, os_1.type)() === "OS400";
    exports2.EVENTS = {
      ALL: "all",
      READY: "ready",
      ADD: "add",
      CHANGE: "change",
      ADD_DIR: "addDir",
      UNLINK: "unlink",
      UNLINK_DIR: "unlinkDir",
      RAW: "raw",
      ERROR: "error"
    };
    var EV = exports2.EVENTS;
    var THROTTLE_MODE_WATCH = "watch";
    var statMethods = { lstat: promises_1.lstat, stat: promises_1.stat };
    var KEY_LISTENERS = "listeners";
    var KEY_ERR = "errHandlers";
    var KEY_RAW = "rawEmitters";
    var HANDLER_KEYS = [KEY_LISTENERS, KEY_ERR, KEY_RAW];
    var binaryExtensions = /* @__PURE__ */ new Set([
      "3dm",
      "3ds",
      "3g2",
      "3gp",
      "7z",
      "a",
      "aac",
      "adp",
      "afdesign",
      "afphoto",
      "afpub",
      "ai",
      "aif",
      "aiff",
      "alz",
      "ape",
      "apk",
      "appimage",
      "ar",
      "arj",
      "asf",
      "au",
      "avi",
      "bak",
      "baml",
      "bh",
      "bin",
      "bk",
      "bmp",
      "btif",
      "bz2",
      "bzip2",
      "cab",
      "caf",
      "cgm",
      "class",
      "cmx",
      "cpio",
      "cr2",
      "cur",
      "dat",
      "dcm",
      "deb",
      "dex",
      "djvu",
      "dll",
      "dmg",
      "dng",
      "doc",
      "docm",
      "docx",
      "dot",
      "dotm",
      "dra",
      "DS_Store",
      "dsk",
      "dts",
      "dtshd",
      "dvb",
      "dwg",
      "dxf",
      "ecelp4800",
      "ecelp7470",
      "ecelp9600",
      "egg",
      "eol",
      "eot",
      "epub",
      "exe",
      "f4v",
      "fbs",
      "fh",
      "fla",
      "flac",
      "flatpak",
      "fli",
      "flv",
      "fpx",
      "fst",
      "fvt",
      "g3",
      "gh",
      "gif",
      "graffle",
      "gz",
      "gzip",
      "h261",
      "h263",
      "h264",
      "icns",
      "ico",
      "ief",
      "img",
      "ipa",
      "iso",
      "jar",
      "jpeg",
      "jpg",
      "jpgv",
      "jpm",
      "jxr",
      "key",
      "ktx",
      "lha",
      "lib",
      "lvp",
      "lz",
      "lzh",
      "lzma",
      "lzo",
      "m3u",
      "m4a",
      "m4v",
      "mar",
      "mdi",
      "mht",
      "mid",
      "midi",
      "mj2",
      "mka",
      "mkv",
      "mmr",
      "mng",
      "mobi",
      "mov",
      "movie",
      "mp3",
      "mp4",
      "mp4a",
      "mpeg",
      "mpg",
      "mpga",
      "mxu",
      "nef",
      "npx",
      "numbers",
      "nupkg",
      "o",
      "odp",
      "ods",
      "odt",
      "oga",
      "ogg",
      "ogv",
      "otf",
      "ott",
      "pages",
      "pbm",
      "pcx",
      "pdb",
      "pdf",
      "pea",
      "pgm",
      "pic",
      "png",
      "pnm",
      "pot",
      "potm",
      "potx",
      "ppa",
      "ppam",
      "ppm",
      "pps",
      "ppsm",
      "ppsx",
      "ppt",
      "pptm",
      "pptx",
      "psd",
      "pya",
      "pyc",
      "pyo",
      "pyv",
      "qt",
      "rar",
      "ras",
      "raw",
      "resources",
      "rgb",
      "rip",
      "rlc",
      "rmf",
      "rmvb",
      "rpm",
      "rtf",
      "rz",
      "s3m",
      "s7z",
      "scpt",
      "sgi",
      "shar",
      "snap",
      "sil",
      "sketch",
      "slk",
      "smv",
      "snk",
      "so",
      "stl",
      "suo",
      "sub",
      "swf",
      "tar",
      "tbz",
      "tbz2",
      "tga",
      "tgz",
      "thmx",
      "tif",
      "tiff",
      "tlz",
      "ttc",
      "ttf",
      "txz",
      "udf",
      "uvh",
      "uvi",
      "uvm",
      "uvp",
      "uvs",
      "uvu",
      "viv",
      "vob",
      "war",
      "wav",
      "wax",
      "wbmp",
      "wdp",
      "weba",
      "webm",
      "webp",
      "whl",
      "wim",
      "wm",
      "wma",
      "wmv",
      "wmx",
      "woff",
      "woff2",
      "wrm",
      "wvx",
      "xbm",
      "xif",
      "xla",
      "xlam",
      "xls",
      "xlsb",
      "xlsm",
      "xlsx",
      "xlt",
      "xltm",
      "xltx",
      "xm",
      "xmind",
      "xpi",
      "xpm",
      "xwd",
      "xz",
      "z",
      "zip",
      "zipx"
    ]);
    var isBinaryPath = (filePath) => binaryExtensions.has(sysPath.extname(filePath).slice(1).toLowerCase());
    var foreach = (val, fn) => {
      if (val instanceof Set) {
        val.forEach(fn);
      } else {
        fn(val);
      }
    };
    var addAndConvert = (main2, prop, item) => {
      let container = main2[prop];
      if (!(container instanceof Set)) {
        main2[prop] = container = /* @__PURE__ */ new Set([container]);
      }
      container.add(item);
    };
    var clearItem = (cont) => (key) => {
      const set = cont[key];
      if (set instanceof Set) {
        set.clear();
      } else {
        delete cont[key];
      }
    };
    var delFromSet = (main2, prop, item) => {
      const container = main2[prop];
      if (container instanceof Set) {
        container.delete(item);
      } else if (container === item) {
        delete main2[prop];
      }
    };
    var isEmptySet = (val) => val instanceof Set ? val.size === 0 : !val;
    var FsWatchInstances = /* @__PURE__ */ new Map();
    function createFsWatchInstance(path3, options, listener, errHandler, emitRaw) {
      const handleEvent = (rawEvent, evPath) => {
        listener(path3);
        emitRaw(rawEvent, evPath, { watchedPath: path3 });
        if (evPath && path3 !== evPath) {
          fsWatchBroadcast(sysPath.resolve(path3, evPath), KEY_LISTENERS, sysPath.join(path3, evPath));
        }
      };
      try {
        return (0, fs_1.watch)(path3, {
          persistent: options.persistent
        }, handleEvent);
      } catch (error) {
        errHandler(error);
        return void 0;
      }
    }
    var fsWatchBroadcast = (fullPath, listenerType, val1, val2, val3) => {
      const cont = FsWatchInstances.get(fullPath);
      if (!cont)
        return;
      foreach(cont[listenerType], (listener) => {
        listener(val1, val2, val3);
      });
    };
    var setFsWatchListener = (path3, fullPath, options, handlers) => {
      const { listener, errHandler, rawEmitter } = handlers;
      let cont = FsWatchInstances.get(fullPath);
      let watcher;
      if (!options.persistent) {
        watcher = createFsWatchInstance(path3, options, listener, errHandler, rawEmitter);
        if (!watcher)
          return;
        return watcher.close.bind(watcher);
      }
      if (cont) {
        addAndConvert(cont, KEY_LISTENERS, listener);
        addAndConvert(cont, KEY_ERR, errHandler);
        addAndConvert(cont, KEY_RAW, rawEmitter);
      } else {
        watcher = createFsWatchInstance(
          path3,
          options,
          fsWatchBroadcast.bind(null, fullPath, KEY_LISTENERS),
          errHandler,
          // no need to use broadcast here
          fsWatchBroadcast.bind(null, fullPath, KEY_RAW)
        );
        if (!watcher)
          return;
        watcher.on(EV.ERROR, async (error) => {
          const broadcastErr = fsWatchBroadcast.bind(null, fullPath, KEY_ERR);
          if (cont)
            cont.watcherUnusable = true;
          if (exports2.isWindows && error.code === "EPERM") {
            try {
              const fd = await (0, promises_1.open)(path3, "r");
              await fd.close();
              broadcastErr(error);
            } catch (err) {
            }
          } else {
            broadcastErr(error);
          }
        });
        cont = {
          listeners: listener,
          errHandlers: errHandler,
          rawEmitters: rawEmitter,
          watcher
        };
        FsWatchInstances.set(fullPath, cont);
      }
      return () => {
        delFromSet(cont, KEY_LISTENERS, listener);
        delFromSet(cont, KEY_ERR, errHandler);
        delFromSet(cont, KEY_RAW, rawEmitter);
        if (isEmptySet(cont.listeners)) {
          cont.watcher.close();
          FsWatchInstances.delete(fullPath);
          HANDLER_KEYS.forEach(clearItem(cont));
          cont.watcher = void 0;
          Object.freeze(cont);
        }
      };
    };
    var FsWatchFileInstances = /* @__PURE__ */ new Map();
    var setFsWatchFileListener = (path3, fullPath, options, handlers) => {
      const { listener, rawEmitter } = handlers;
      let cont = FsWatchFileInstances.get(fullPath);
      const copts = cont && cont.options;
      if (copts && (copts.persistent < options.persistent || copts.interval > options.interval)) {
        (0, fs_1.unwatchFile)(fullPath);
        cont = void 0;
      }
      if (cont) {
        addAndConvert(cont, KEY_LISTENERS, listener);
        addAndConvert(cont, KEY_RAW, rawEmitter);
      } else {
        cont = {
          listeners: listener,
          rawEmitters: rawEmitter,
          options,
          watcher: (0, fs_1.watchFile)(fullPath, options, (curr, prev) => {
            foreach(cont.rawEmitters, (rawEmitter2) => {
              rawEmitter2(EV.CHANGE, fullPath, { curr, prev });
            });
            const currmtime = curr.mtimeMs;
            if (curr.size !== prev.size || currmtime > prev.mtimeMs || currmtime === 0) {
              foreach(cont.listeners, (listener2) => listener2(path3, curr));
            }
          })
        };
        FsWatchFileInstances.set(fullPath, cont);
      }
      return () => {
        delFromSet(cont, KEY_LISTENERS, listener);
        delFromSet(cont, KEY_RAW, rawEmitter);
        if (isEmptySet(cont.listeners)) {
          FsWatchFileInstances.delete(fullPath);
          (0, fs_1.unwatchFile)(fullPath);
          cont.options = cont.watcher = void 0;
          Object.freeze(cont);
        }
      };
    };
    var NodeFsHandler = class {
      constructor(fsW) {
        this.fsw = fsW;
        this._boundHandleError = (error) => fsW._handleError(error);
      }
      /**
       * Watch file for changes with fs_watchFile or fs_watch.
       * @param path to file or dir
       * @param listener on fs change
       * @returns closer for the watcher instance
       */
      _watchWithNodeFs(path3, listener) {
        const opts = this.fsw.options;
        const directory = sysPath.dirname(path3);
        const basename = sysPath.basename(path3);
        const parent = this.fsw._getWatchedDir(directory);
        parent.add(basename);
        const absolutePath = sysPath.resolve(path3);
        const options = {
          persistent: opts.persistent
        };
        if (!listener)
          listener = exports2.EMPTY_FN;
        let closer;
        if (opts.usePolling) {
          const enableBin = opts.interval !== opts.binaryInterval;
          options.interval = enableBin && isBinaryPath(basename) ? opts.binaryInterval : opts.interval;
          closer = setFsWatchFileListener(path3, absolutePath, options, {
            listener,
            rawEmitter: this.fsw._emitRaw
          });
        } else {
          closer = setFsWatchListener(path3, absolutePath, options, {
            listener,
            errHandler: this._boundHandleError,
            rawEmitter: this.fsw._emitRaw
          });
        }
        return closer;
      }
      /**
       * Watch a file and emit add event if warranted.
       * @returns closer for the watcher instance
       */
      _handleFile(file, stats, initialAdd) {
        if (this.fsw.closed) {
          return;
        }
        const dirname = sysPath.dirname(file);
        const basename = sysPath.basename(file);
        const parent = this.fsw._getWatchedDir(dirname);
        let prevStats = stats;
        if (parent.has(basename))
          return;
        const listener = async (path3, newStats) => {
          if (!this.fsw._throttle(THROTTLE_MODE_WATCH, file, 5))
            return;
          if (!newStats || newStats.mtimeMs === 0) {
            try {
              const newStats2 = await (0, promises_1.stat)(file);
              if (this.fsw.closed)
                return;
              const at = newStats2.atimeMs;
              const mt = newStats2.mtimeMs;
              if (!at || at <= mt || mt !== prevStats.mtimeMs) {
                this.fsw._emit(EV.CHANGE, file, newStats2);
              }
              if ((exports2.isMacos || exports2.isLinux || exports2.isFreeBSD) && prevStats.ino !== newStats2.ino) {
                this.fsw._closeFile(path3);
                prevStats = newStats2;
                const closer2 = this._watchWithNodeFs(file, listener);
                if (closer2)
                  this.fsw._addPathCloser(path3, closer2);
              } else {
                prevStats = newStats2;
              }
            } catch (error) {
              this.fsw._remove(dirname, basename);
            }
          } else if (parent.has(basename)) {
            const at = newStats.atimeMs;
            const mt = newStats.mtimeMs;
            if (!at || at <= mt || mt !== prevStats.mtimeMs) {
              this.fsw._emit(EV.CHANGE, file, newStats);
            }
            prevStats = newStats;
          }
        };
        const closer = this._watchWithNodeFs(file, listener);
        if (!(initialAdd && this.fsw.options.ignoreInitial) && this.fsw._isntIgnored(file)) {
          if (!this.fsw._throttle(EV.ADD, file, 0))
            return;
          this.fsw._emit(EV.ADD, file, stats);
        }
        return closer;
      }
      /**
       * Handle symlinks encountered while reading a dir.
       * @param entry returned by readdirp
       * @param directory path of dir being read
       * @param path of this item
       * @param item basename of this item
       * @returns true if no more processing is needed for this entry.
       */
      async _handleSymlink(entry, directory, path3, item) {
        if (this.fsw.closed) {
          return;
        }
        const full = entry.fullPath;
        const dir = this.fsw._getWatchedDir(directory);
        if (!this.fsw.options.followSymlinks) {
          this.fsw._incrReadyCount();
          let linkPath;
          try {
            linkPath = await (0, promises_1.realpath)(path3);
          } catch (e) {
            this.fsw._emitReady();
            return true;
          }
          if (this.fsw.closed)
            return;
          if (dir.has(item)) {
            if (this.fsw._symlinkPaths.get(full) !== linkPath) {
              this.fsw._symlinkPaths.set(full, linkPath);
              this.fsw._emit(EV.CHANGE, path3, entry.stats);
            }
          } else {
            dir.add(item);
            this.fsw._symlinkPaths.set(full, linkPath);
            this.fsw._emit(EV.ADD, path3, entry.stats);
          }
          this.fsw._emitReady();
          return true;
        }
        if (this.fsw._symlinkPaths.has(full)) {
          return true;
        }
        this.fsw._symlinkPaths.set(full, true);
      }
      _handleRead(directory, initialAdd, wh, target, dir, depth, throttler) {
        directory = sysPath.join(directory, "");
        throttler = this.fsw._throttle("readdir", directory, 1e3);
        if (!throttler)
          return;
        const previous = this.fsw._getWatchedDir(wh.path);
        const current = /* @__PURE__ */ new Set();
        let stream = this.fsw._readdirp(directory, {
          fileFilter: (entry) => wh.filterPath(entry),
          directoryFilter: (entry) => wh.filterDir(entry)
        });
        if (!stream)
          return;
        stream.on(exports2.STR_DATA, async (entry) => {
          if (this.fsw.closed) {
            stream = void 0;
            return;
          }
          const item = entry.path;
          let path3 = sysPath.join(directory, item);
          current.add(item);
          if (entry.stats.isSymbolicLink() && await this._handleSymlink(entry, directory, path3, item)) {
            return;
          }
          if (this.fsw.closed) {
            stream = void 0;
            return;
          }
          if (item === target || !target && !previous.has(item)) {
            this.fsw._incrReadyCount();
            path3 = sysPath.join(dir, sysPath.relative(dir, path3));
            this._addToNodeFs(path3, initialAdd, wh, depth + 1);
          }
        }).on(EV.ERROR, this._boundHandleError);
        return new Promise((resolve, reject) => {
          if (!stream)
            return reject();
          stream.once(exports2.STR_END, () => {
            if (this.fsw.closed) {
              stream = void 0;
              return;
            }
            const wasThrottled = throttler ? throttler.clear() : false;
            resolve(void 0);
            previous.getChildren().filter((item) => {
              return item !== directory && !current.has(item);
            }).forEach((item) => {
              this.fsw._remove(directory, item);
            });
            stream = void 0;
            if (wasThrottled)
              this._handleRead(directory, false, wh, target, dir, depth, throttler);
          });
        });
      }
      /**
       * Read directory to add / remove files from `@watched` list and re-read it on change.
       * @param dir fs path
       * @param stats
       * @param initialAdd
       * @param depth relative to user-supplied path
       * @param target child path targeted for watch
       * @param wh Common watch helpers for this path
       * @param realpath
       * @returns closer for the watcher instance.
       */
      async _handleDir(dir, stats, initialAdd, depth, target, wh, realpath) {
        const parentDir = this.fsw._getWatchedDir(sysPath.dirname(dir));
        const tracked = parentDir.has(sysPath.basename(dir));
        if (!(initialAdd && this.fsw.options.ignoreInitial) && !target && !tracked) {
          this.fsw._emit(EV.ADD_DIR, dir, stats);
        }
        parentDir.add(sysPath.basename(dir));
        this.fsw._getWatchedDir(dir);
        let throttler;
        let closer;
        const oDepth = this.fsw.options.depth;
        if ((oDepth == null || depth <= oDepth) && !this.fsw._symlinkPaths.has(realpath)) {
          if (!target) {
            await this._handleRead(dir, initialAdd, wh, target, dir, depth, throttler);
            if (this.fsw.closed)
              return;
          }
          closer = this._watchWithNodeFs(dir, (dirPath, stats2) => {
            if (stats2 && stats2.mtimeMs === 0)
              return;
            this._handleRead(dirPath, false, wh, target, dir, depth, throttler);
          });
        }
        return closer;
      }
      /**
       * Handle added file, directory, or glob pattern.
       * Delegates call to _handleFile / _handleDir after checks.
       * @param path to file or ir
       * @param initialAdd was the file added at watch instantiation?
       * @param priorWh depth relative to user-supplied path
       * @param depth Child path actually targeted for watch
       * @param target Child path actually targeted for watch
       */
      async _addToNodeFs(path3, initialAdd, priorWh, depth, target) {
        const ready = this.fsw._emitReady;
        if (this.fsw._isIgnored(path3) || this.fsw.closed) {
          ready();
          return false;
        }
        const wh = this.fsw._getWatchHelpers(path3);
        if (priorWh) {
          wh.filterPath = (entry) => priorWh.filterPath(entry);
          wh.filterDir = (entry) => priorWh.filterDir(entry);
        }
        try {
          const stats = await statMethods[wh.statMethod](wh.watchPath);
          if (this.fsw.closed)
            return;
          if (this.fsw._isIgnored(wh.watchPath, stats)) {
            ready();
            return false;
          }
          const follow = this.fsw.options.followSymlinks;
          let closer;
          if (stats.isDirectory()) {
            const absPath = sysPath.resolve(path3);
            const targetPath = follow ? await (0, promises_1.realpath)(path3) : path3;
            if (this.fsw.closed)
              return;
            closer = await this._handleDir(wh.watchPath, stats, initialAdd, depth, target, wh, targetPath);
            if (this.fsw.closed)
              return;
            if (absPath !== targetPath && targetPath !== void 0) {
              this.fsw._symlinkPaths.set(absPath, targetPath);
            }
          } else if (stats.isSymbolicLink()) {
            const targetPath = follow ? await (0, promises_1.realpath)(path3) : path3;
            if (this.fsw.closed)
              return;
            const parent = sysPath.dirname(wh.watchPath);
            this.fsw._getWatchedDir(parent).add(wh.watchPath);
            this.fsw._emit(EV.ADD, wh.watchPath, stats);
            closer = await this._handleDir(parent, stats, initialAdd, depth, path3, wh, targetPath);
            if (this.fsw.closed)
              return;
            if (targetPath !== void 0) {
              this.fsw._symlinkPaths.set(sysPath.resolve(path3), targetPath);
            }
          } else {
            closer = this._handleFile(wh.watchPath, stats, initialAdd);
          }
          ready();
          if (closer)
            this.fsw._addPathCloser(path3, closer);
          return false;
        } catch (error) {
          if (this.fsw._handleError(error)) {
            ready();
            return path3;
          }
        }
      }
    };
    exports2.NodeFsHandler = NodeFsHandler;
  }
});

// node_modules/chokidar/index.js
var require_chokidar = __commonJS({
  "node_modules/chokidar/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.FSWatcher = exports2.WatchHelper = void 0;
    exports2.watch = watch;
    var fs_1 = require("fs");
    var promises_1 = require("fs/promises");
    var events_1 = require("events");
    var sysPath = require("path");
    var readdirp_1 = require_readdirp();
    var handler_js_1 = require_handler();
    var SLASH = "/";
    var SLASH_SLASH = "//";
    var ONE_DOT = ".";
    var TWO_DOTS = "..";
    var STRING_TYPE = "string";
    var BACK_SLASH_RE = /\\/g;
    var DOUBLE_SLASH_RE = /\/\//;
    var DOT_RE = /\..*\.(sw[px])$|~$|\.subl.*\.tmp/;
    var REPLACER_RE = /^\.[/\\]/;
    function arrify(item) {
      return Array.isArray(item) ? item : [item];
    }
    var isMatcherObject = (matcher) => typeof matcher === "object" && matcher !== null && !(matcher instanceof RegExp);
    function createPattern(matcher) {
      if (typeof matcher === "function")
        return matcher;
      if (typeof matcher === "string")
        return (string) => matcher === string;
      if (matcher instanceof RegExp)
        return (string) => matcher.test(string);
      if (typeof matcher === "object" && matcher !== null) {
        return (string) => {
          if (matcher.path === string)
            return true;
          if (matcher.recursive) {
            const relative = sysPath.relative(matcher.path, string);
            if (!relative) {
              return false;
            }
            return !relative.startsWith("..") && !sysPath.isAbsolute(relative);
          }
          return false;
        };
      }
      return () => false;
    }
    function normalizePath(path3) {
      if (typeof path3 !== "string")
        throw new Error("string expected");
      path3 = sysPath.normalize(path3);
      path3 = path3.replace(/\\/g, "/");
      let prepend = false;
      if (path3.startsWith("//"))
        prepend = true;
      const DOUBLE_SLASH_RE2 = /\/\//;
      while (path3.match(DOUBLE_SLASH_RE2))
        path3 = path3.replace(DOUBLE_SLASH_RE2, "/");
      if (prepend)
        path3 = "/" + path3;
      return path3;
    }
    function matchPatterns(patterns, testString, stats) {
      const path3 = normalizePath(testString);
      for (let index = 0; index < patterns.length; index++) {
        const pattern = patterns[index];
        if (pattern(path3, stats)) {
          return true;
        }
      }
      return false;
    }
    function anymatch(matchers, testString) {
      if (matchers == null) {
        throw new TypeError("anymatch: specify first argument");
      }
      const matchersArray = arrify(matchers);
      const patterns = matchersArray.map((matcher) => createPattern(matcher));
      if (testString == null) {
        return (testString2, stats) => {
          return matchPatterns(patterns, testString2, stats);
        };
      }
      return matchPatterns(patterns, testString);
    }
    var unifyPaths = (paths_) => {
      const paths = arrify(paths_).flat();
      if (!paths.every((p) => typeof p === STRING_TYPE)) {
        throw new TypeError(`Non-string provided as watch path: ${paths}`);
      }
      return paths.map(normalizePathToUnix);
    };
    var toUnix = (string) => {
      let str = string.replace(BACK_SLASH_RE, SLASH);
      let prepend = false;
      if (str.startsWith(SLASH_SLASH)) {
        prepend = true;
      }
      while (str.match(DOUBLE_SLASH_RE)) {
        str = str.replace(DOUBLE_SLASH_RE, SLASH);
      }
      if (prepend) {
        str = SLASH + str;
      }
      return str;
    };
    var normalizePathToUnix = (path3) => toUnix(sysPath.normalize(toUnix(path3)));
    var normalizeIgnored = (cwd = "") => (path3) => {
      if (typeof path3 === "string") {
        return normalizePathToUnix(sysPath.isAbsolute(path3) ? path3 : sysPath.join(cwd, path3));
      } else {
        return path3;
      }
    };
    var getAbsolutePath = (path3, cwd) => {
      if (sysPath.isAbsolute(path3)) {
        return path3;
      }
      return sysPath.join(cwd, path3);
    };
    var EMPTY_SET = Object.freeze(/* @__PURE__ */ new Set());
    var DirEntry = class {
      constructor(dir, removeWatcher) {
        this.path = dir;
        this._removeWatcher = removeWatcher;
        this.items = /* @__PURE__ */ new Set();
      }
      add(item) {
        const { items } = this;
        if (!items)
          return;
        if (item !== ONE_DOT && item !== TWO_DOTS)
          items.add(item);
      }
      async remove(item) {
        const { items } = this;
        if (!items)
          return;
        items.delete(item);
        if (items.size > 0)
          return;
        const dir = this.path;
        try {
          await (0, promises_1.readdir)(dir);
        } catch (err) {
          if (this._removeWatcher) {
            this._removeWatcher(sysPath.dirname(dir), sysPath.basename(dir));
          }
        }
      }
      has(item) {
        const { items } = this;
        if (!items)
          return;
        return items.has(item);
      }
      getChildren() {
        const { items } = this;
        if (!items)
          return [];
        return [...items.values()];
      }
      dispose() {
        this.items.clear();
        this.path = "";
        this._removeWatcher = handler_js_1.EMPTY_FN;
        this.items = EMPTY_SET;
        Object.freeze(this);
      }
    };
    var STAT_METHOD_F = "stat";
    var STAT_METHOD_L = "lstat";
    var WatchHelper = class {
      constructor(path3, follow, fsw) {
        this.fsw = fsw;
        const watchPath = path3;
        this.path = path3 = path3.replace(REPLACER_RE, "");
        this.watchPath = watchPath;
        this.fullWatchPath = sysPath.resolve(watchPath);
        this.dirParts = [];
        this.dirParts.forEach((parts) => {
          if (parts.length > 1)
            parts.pop();
        });
        this.followSymlinks = follow;
        this.statMethod = follow ? STAT_METHOD_F : STAT_METHOD_L;
      }
      entryPath(entry) {
        return sysPath.join(this.watchPath, sysPath.relative(this.watchPath, entry.fullPath));
      }
      filterPath(entry) {
        const { stats } = entry;
        if (stats && stats.isSymbolicLink())
          return this.filterDir(entry);
        const resolvedPath = this.entryPath(entry);
        return this.fsw._isntIgnored(resolvedPath, stats) && this.fsw._hasReadPermissions(stats);
      }
      filterDir(entry) {
        return this.fsw._isntIgnored(this.entryPath(entry), entry.stats);
      }
    };
    exports2.WatchHelper = WatchHelper;
    var FSWatcher = class extends events_1.EventEmitter {
      // Not indenting methods for history sake; for now.
      constructor(_opts = {}) {
        super();
        this.closed = false;
        this._closers = /* @__PURE__ */ new Map();
        this._ignoredPaths = /* @__PURE__ */ new Set();
        this._throttled = /* @__PURE__ */ new Map();
        this._streams = /* @__PURE__ */ new Set();
        this._symlinkPaths = /* @__PURE__ */ new Map();
        this._watched = /* @__PURE__ */ new Map();
        this._pendingWrites = /* @__PURE__ */ new Map();
        this._pendingUnlinks = /* @__PURE__ */ new Map();
        this._readyCount = 0;
        this._readyEmitted = false;
        const awf = _opts.awaitWriteFinish;
        const DEF_AWF = { stabilityThreshold: 2e3, pollInterval: 100 };
        const opts = {
          // Defaults
          persistent: true,
          ignoreInitial: false,
          ignorePermissionErrors: false,
          interval: 100,
          binaryInterval: 300,
          followSymlinks: true,
          usePolling: false,
          // useAsync: false,
          atomic: true,
          // NOTE: overwritten later (depends on usePolling)
          ..._opts,
          // Change format
          ignored: _opts.ignored ? arrify(_opts.ignored) : arrify([]),
          awaitWriteFinish: awf === true ? DEF_AWF : typeof awf === "object" ? { ...DEF_AWF, ...awf } : false
        };
        if (handler_js_1.isIBMi)
          opts.usePolling = true;
        if (opts.atomic === void 0)
          opts.atomic = !opts.usePolling;
        const envPoll = process.env.CHOKIDAR_USEPOLLING;
        if (envPoll !== void 0) {
          const envLower = envPoll.toLowerCase();
          if (envLower === "false" || envLower === "0")
            opts.usePolling = false;
          else if (envLower === "true" || envLower === "1")
            opts.usePolling = true;
          else
            opts.usePolling = !!envLower;
        }
        const envInterval = process.env.CHOKIDAR_INTERVAL;
        if (envInterval)
          opts.interval = Number.parseInt(envInterval, 10);
        let readyCalls = 0;
        this._emitReady = () => {
          readyCalls++;
          if (readyCalls >= this._readyCount) {
            this._emitReady = handler_js_1.EMPTY_FN;
            this._readyEmitted = true;
            process.nextTick(() => this.emit(handler_js_1.EVENTS.READY));
          }
        };
        this._emitRaw = (...args) => this.emit(handler_js_1.EVENTS.RAW, ...args);
        this._boundRemove = this._remove.bind(this);
        this.options = opts;
        this._nodeFsHandler = new handler_js_1.NodeFsHandler(this);
        Object.freeze(opts);
      }
      _addIgnoredPath(matcher) {
        if (isMatcherObject(matcher)) {
          for (const ignored of this._ignoredPaths) {
            if (isMatcherObject(ignored) && ignored.path === matcher.path && ignored.recursive === matcher.recursive) {
              return;
            }
          }
        }
        this._ignoredPaths.add(matcher);
      }
      _removeIgnoredPath(matcher) {
        this._ignoredPaths.delete(matcher);
        if (typeof matcher === "string") {
          for (const ignored of this._ignoredPaths) {
            if (isMatcherObject(ignored) && ignored.path === matcher) {
              this._ignoredPaths.delete(ignored);
            }
          }
        }
      }
      // Public methods
      /**
       * Adds paths to be watched on an existing FSWatcher instance.
       * @param paths_ file or file list. Other arguments are unused
       */
      add(paths_, _origAdd, _internal) {
        const { cwd } = this.options;
        this.closed = false;
        this._closePromise = void 0;
        let paths = unifyPaths(paths_);
        if (cwd) {
          paths = paths.map((path3) => {
            const absPath = getAbsolutePath(path3, cwd);
            return absPath;
          });
        }
        paths.forEach((path3) => {
          this._removeIgnoredPath(path3);
        });
        this._userIgnored = void 0;
        if (!this._readyCount)
          this._readyCount = 0;
        this._readyCount += paths.length;
        Promise.all(paths.map(async (path3) => {
          const res = await this._nodeFsHandler._addToNodeFs(path3, !_internal, void 0, 0, _origAdd);
          if (res)
            this._emitReady();
          return res;
        })).then((results) => {
          if (this.closed)
            return;
          results.forEach((item) => {
            if (item)
              this.add(sysPath.dirname(item), sysPath.basename(_origAdd || item));
          });
        });
        return this;
      }
      /**
       * Close watchers or start ignoring events from specified paths.
       */
      unwatch(paths_) {
        if (this.closed)
          return this;
        const paths = unifyPaths(paths_);
        const { cwd } = this.options;
        paths.forEach((path3) => {
          if (!sysPath.isAbsolute(path3) && !this._closers.has(path3)) {
            if (cwd)
              path3 = sysPath.join(cwd, path3);
            path3 = sysPath.resolve(path3);
          }
          this._closePath(path3);
          this._addIgnoredPath(path3);
          if (this._watched.has(path3)) {
            this._addIgnoredPath({
              path: path3,
              recursive: true
            });
          }
          this._userIgnored = void 0;
        });
        return this;
      }
      /**
       * Close watchers and remove all listeners from watched paths.
       */
      close() {
        if (this._closePromise) {
          return this._closePromise;
        }
        this.closed = true;
        this.removeAllListeners();
        const closers = [];
        this._closers.forEach((closerList) => closerList.forEach((closer) => {
          const promise = closer();
          if (promise instanceof Promise)
            closers.push(promise);
        }));
        this._streams.forEach((stream) => stream.destroy());
        this._userIgnored = void 0;
        this._readyCount = 0;
        this._readyEmitted = false;
        this._watched.forEach((dirent) => dirent.dispose());
        this._closers.clear();
        this._watched.clear();
        this._streams.clear();
        this._symlinkPaths.clear();
        this._throttled.clear();
        this._closePromise = closers.length ? Promise.all(closers).then(() => void 0) : Promise.resolve();
        return this._closePromise;
      }
      /**
       * Expose list of watched paths
       * @returns for chaining
       */
      getWatched() {
        const watchList = {};
        this._watched.forEach((entry, dir) => {
          const key = this.options.cwd ? sysPath.relative(this.options.cwd, dir) : dir;
          const index = key || ONE_DOT;
          watchList[index] = entry.getChildren().sort();
        });
        return watchList;
      }
      emitWithAll(event, args) {
        this.emit(event, ...args);
        if (event !== handler_js_1.EVENTS.ERROR)
          this.emit(handler_js_1.EVENTS.ALL, event, ...args);
      }
      // Common helpers
      // --------------
      /**
       * Normalize and emit events.
       * Calling _emit DOES NOT MEAN emit() would be called!
       * @param event Type of event
       * @param path File or directory path
       * @param stats arguments to be passed with event
       * @returns the error if defined, otherwise the value of the FSWatcher instance's `closed` flag
       */
      async _emit(event, path3, stats) {
        if (this.closed)
          return;
        const opts = this.options;
        if (handler_js_1.isWindows)
          path3 = sysPath.normalize(path3);
        if (opts.cwd)
          path3 = sysPath.relative(opts.cwd, path3);
        const args = [path3];
        if (stats != null)
          args.push(stats);
        const awf = opts.awaitWriteFinish;
        let pw;
        if (awf && (pw = this._pendingWrites.get(path3))) {
          pw.lastChange = /* @__PURE__ */ new Date();
          return this;
        }
        if (opts.atomic) {
          if (event === handler_js_1.EVENTS.UNLINK) {
            this._pendingUnlinks.set(path3, [event, ...args]);
            setTimeout(() => {
              this._pendingUnlinks.forEach((entry, path4) => {
                this.emit(...entry);
                this.emit(handler_js_1.EVENTS.ALL, ...entry);
                this._pendingUnlinks.delete(path4);
              });
            }, typeof opts.atomic === "number" ? opts.atomic : 100);
            return this;
          }
          if (event === handler_js_1.EVENTS.ADD && this._pendingUnlinks.has(path3)) {
            event = handler_js_1.EVENTS.CHANGE;
            this._pendingUnlinks.delete(path3);
          }
        }
        if (awf && (event === handler_js_1.EVENTS.ADD || event === handler_js_1.EVENTS.CHANGE) && this._readyEmitted) {
          const awfEmit = (err, stats2) => {
            if (err) {
              event = handler_js_1.EVENTS.ERROR;
              args[0] = err;
              this.emitWithAll(event, args);
            } else if (stats2) {
              if (args.length > 1) {
                args[1] = stats2;
              } else {
                args.push(stats2);
              }
              this.emitWithAll(event, args);
            }
          };
          this._awaitWriteFinish(path3, awf.stabilityThreshold, event, awfEmit);
          return this;
        }
        if (event === handler_js_1.EVENTS.CHANGE) {
          const isThrottled = !this._throttle(handler_js_1.EVENTS.CHANGE, path3, 50);
          if (isThrottled)
            return this;
        }
        if (opts.alwaysStat && stats === void 0 && (event === handler_js_1.EVENTS.ADD || event === handler_js_1.EVENTS.ADD_DIR || event === handler_js_1.EVENTS.CHANGE)) {
          const fullPath = opts.cwd ? sysPath.join(opts.cwd, path3) : path3;
          let stats2;
          try {
            stats2 = await (0, promises_1.stat)(fullPath);
          } catch (err) {
          }
          if (!stats2 || this.closed)
            return;
          args.push(stats2);
        }
        this.emitWithAll(event, args);
        return this;
      }
      /**
       * Common handler for errors
       * @returns The error if defined, otherwise the value of the FSWatcher instance's `closed` flag
       */
      _handleError(error) {
        const code = error && error.code;
        if (error && code !== "ENOENT" && code !== "ENOTDIR" && (!this.options.ignorePermissionErrors || code !== "EPERM" && code !== "EACCES")) {
          this.emit(handler_js_1.EVENTS.ERROR, error);
        }
        return error || this.closed;
      }
      /**
       * Helper utility for throttling
       * @param actionType type being throttled
       * @param path being acted upon
       * @param timeout duration of time to suppress duplicate actions
       * @returns tracking object or false if action should be suppressed
       */
      _throttle(actionType, path3, timeout) {
        if (!this._throttled.has(actionType)) {
          this._throttled.set(actionType, /* @__PURE__ */ new Map());
        }
        const action = this._throttled.get(actionType);
        if (!action)
          throw new Error("invalid throttle");
        const actionPath = action.get(path3);
        if (actionPath) {
          actionPath.count++;
          return false;
        }
        let timeoutObject;
        const clear = () => {
          const item = action.get(path3);
          const count = item ? item.count : 0;
          action.delete(path3);
          clearTimeout(timeoutObject);
          if (item)
            clearTimeout(item.timeoutObject);
          return count;
        };
        timeoutObject = setTimeout(clear, timeout);
        const thr = { timeoutObject, clear, count: 0 };
        action.set(path3, thr);
        return thr;
      }
      _incrReadyCount() {
        return this._readyCount++;
      }
      /**
       * Awaits write operation to finish.
       * Polls a newly created file for size variations. When files size does not change for 'threshold' milliseconds calls callback.
       * @param path being acted upon
       * @param threshold Time in milliseconds a file size must be fixed before acknowledging write OP is finished
       * @param event
       * @param awfEmit Callback to be called when ready for event to be emitted.
       */
      _awaitWriteFinish(path3, threshold, event, awfEmit) {
        const awf = this.options.awaitWriteFinish;
        if (typeof awf !== "object")
          return;
        const pollInterval = awf.pollInterval;
        let timeoutHandler;
        let fullPath = path3;
        if (this.options.cwd && !sysPath.isAbsolute(path3)) {
          fullPath = sysPath.join(this.options.cwd, path3);
        }
        const now = /* @__PURE__ */ new Date();
        const writes = this._pendingWrites;
        function awaitWriteFinishFn(prevStat) {
          (0, fs_1.stat)(fullPath, (err, curStat) => {
            if (err || !writes.has(path3)) {
              if (err && err.code !== "ENOENT")
                awfEmit(err);
              return;
            }
            const now2 = Number(/* @__PURE__ */ new Date());
            if (prevStat && curStat.size !== prevStat.size) {
              writes.get(path3).lastChange = now2;
            }
            const pw = writes.get(path3);
            const df = now2 - pw.lastChange;
            if (df >= threshold) {
              writes.delete(path3);
              awfEmit(void 0, curStat);
            } else {
              timeoutHandler = setTimeout(awaitWriteFinishFn, pollInterval, curStat);
            }
          });
        }
        if (!writes.has(path3)) {
          writes.set(path3, {
            lastChange: now,
            cancelWait: () => {
              writes.delete(path3);
              clearTimeout(timeoutHandler);
              return event;
            }
          });
          timeoutHandler = setTimeout(awaitWriteFinishFn, pollInterval);
        }
      }
      /**
       * Determines whether user has asked to ignore this path.
       */
      _isIgnored(path3, stats) {
        if (this.options.atomic && DOT_RE.test(path3))
          return true;
        if (!this._userIgnored) {
          const { cwd } = this.options;
          const ign = this.options.ignored;
          const ignored = (ign || []).map(normalizeIgnored(cwd));
          const ignoredPaths = [...this._ignoredPaths];
          const list = [...ignoredPaths.map(normalizeIgnored(cwd)), ...ignored];
          this._userIgnored = anymatch(list, void 0);
        }
        return this._userIgnored(path3, stats);
      }
      _isntIgnored(path3, stat) {
        return !this._isIgnored(path3, stat);
      }
      /**
       * Provides a set of common helpers and properties relating to symlink handling.
       * @param path file or directory pattern being watched
       */
      _getWatchHelpers(path3) {
        return new WatchHelper(path3, this.options.followSymlinks, this);
      }
      // Directory helpers
      // -----------------
      /**
       * Provides directory tracking objects
       * @param directory path of the directory
       */
      _getWatchedDir(directory) {
        const dir = sysPath.resolve(directory);
        if (!this._watched.has(dir))
          this._watched.set(dir, new DirEntry(dir, this._boundRemove));
        return this._watched.get(dir);
      }
      // File helpers
      // ------------
      /**
       * Check for read permissions: https://stackoverflow.com/a/11781404/1358405
       */
      _hasReadPermissions(stats) {
        if (this.options.ignorePermissionErrors)
          return true;
        return Boolean(Number(stats.mode) & 256);
      }
      /**
       * Handles emitting unlink events for
       * files and directories, and via recursion, for
       * files and directories within directories that are unlinked
       * @param directory within which the following item is located
       * @param item      base path of item/directory
       */
      _remove(directory, item, isDirectory) {
        const path3 = sysPath.join(directory, item);
        const fullPath = sysPath.resolve(path3);
        isDirectory = isDirectory != null ? isDirectory : this._watched.has(path3) || this._watched.has(fullPath);
        if (!this._throttle("remove", path3, 100))
          return;
        if (!isDirectory && this._watched.size === 1) {
          this.add(directory, item, true);
        }
        const wp = this._getWatchedDir(path3);
        const nestedDirectoryChildren = wp.getChildren();
        nestedDirectoryChildren.forEach((nested) => this._remove(path3, nested));
        const parent = this._getWatchedDir(directory);
        const wasTracked = parent.has(item);
        parent.remove(item);
        if (this._symlinkPaths.has(fullPath)) {
          this._symlinkPaths.delete(fullPath);
        }
        let relPath = path3;
        if (this.options.cwd)
          relPath = sysPath.relative(this.options.cwd, path3);
        if (this.options.awaitWriteFinish && this._pendingWrites.has(relPath)) {
          const event = this._pendingWrites.get(relPath).cancelWait();
          if (event === handler_js_1.EVENTS.ADD)
            return;
        }
        this._watched.delete(path3);
        this._watched.delete(fullPath);
        const eventName = isDirectory ? handler_js_1.EVENTS.UNLINK_DIR : handler_js_1.EVENTS.UNLINK;
        if (wasTracked && !this._isIgnored(path3))
          this._emit(eventName, path3);
        this._closePath(path3);
      }
      /**
       * Closes all watchers for a path
       */
      _closePath(path3) {
        this._closeFile(path3);
        const dir = sysPath.dirname(path3);
        this._getWatchedDir(dir).remove(sysPath.basename(path3));
      }
      /**
       * Closes only file-specific watchers
       */
      _closeFile(path3) {
        const closers = this._closers.get(path3);
        if (!closers)
          return;
        closers.forEach((closer) => closer());
        this._closers.delete(path3);
      }
      _addPathCloser(path3, closer) {
        if (!closer)
          return;
        let list = this._closers.get(path3);
        if (!list) {
          list = [];
          this._closers.set(path3, list);
        }
        list.push(closer);
      }
      _readdirp(root2, opts) {
        if (this.closed)
          return;
        const options = { type: handler_js_1.EVENTS.ALL, alwaysStat: true, lstat: true, ...opts, depth: 0 };
        let stream = (0, readdirp_1.readdirp)(root2, options);
        this._streams.add(stream);
        stream.once(handler_js_1.STR_CLOSE, () => {
          stream = void 0;
        });
        stream.once(handler_js_1.STR_END, () => {
          if (stream) {
            this._streams.delete(stream);
            stream = void 0;
          }
        });
        return stream;
      }
    };
    exports2.FSWatcher = FSWatcher;
    function watch(paths, options = {}) {
      const watcher = new FSWatcher(options);
      watcher.add(paths);
      return watcher;
    }
    exports2.default = { watch, FSWatcher };
  }
});

// typescript/fileman.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_url = require("url");
var import_meta = {};
var root = import_path.default.resolve((0, import_url.fileURLToPath)(import_meta.url), "..", "..", "..");
var fileman = {
  path: {
    /**
     * Joins multiple path segments together.
     * @param pathString1 The first path segment.
     * @param pathString2 The second path segment.
     * @returns The joined path string.
     */
    join: (...pathFrags) => {
      return import_path.default.join(...pathFrags);
    },
    /**
     * Joins path segments to the calculated root directory of the project.
     * @param pathStrings - Multiple path segments to join.
     * @returns The absolute path from the project root.
     */
    fromOrigin: (...pathStrings) => {
      return import_path.default.join(root, ...pathStrings);
    },
    /**
     * Resolves a sequence of paths or path segments into an absolute path.
     * @param pathString The path string to resolve.
     * @returns The resolved absolute path.
     */
    resolves: (pathString) => {
      return import_path.default.resolve(pathString);
    },
    /**
     * Checks if a given path exists and determines its type (file or folder).
     * @param pathString The path to check.
     * @returns An object indicating existence and type.
     */
    available: (pathString) => {
      try {
        const stats = import_fs.default.statSync(pathString);
        return { exist: true, type: stats.isDirectory() ? "folder" : "file" };
      } catch (error) {
        const err = error;
        if (err.code === "ENOENT") {
          return { exist: false, type: "" };
        }
        console.error("Path check error:", error);
        throw error;
      }
    },
    /**
     * Checks if a given path points to a folder.
     * @param pathString The path to check.
     * @returns True if the path is a folder, false otherwise.
     */
    ifFolder: (pathString) => {
      return fileman.path.available(pathString).type === "folder";
    },
    /**
     * Checks if a given path points to a file.
     * @param pathString The path to check.
     * @returns True if the path is a file, false otherwise.
     */
    ifFile: (pathString) => {
      return fileman.path.available(pathString).type === "file";
    },
    /**
     * Checks if two folders are independent (neither is a descendant of the other).
     * @param folder1 The path to the first folder.
     * @param folder2 The path to the second folder.
     * @returns True if the folders are independent, false otherwise.
     */
    isIndependent: (folder1, folder2) => {
      const relative1 = import_path.default.relative(folder1, folder2);
      const relative2 = import_path.default.relative(folder2, folder1);
      const notInside = (relative) => relative && relative.startsWith("..") || import_path.default.isAbsolute(relative);
      return notInside(relative1) && notInside(relative2);
    },
    /**
     * Recursively lists all files in a directory.
     * @param dir The directory to list files from.
     * @param fileList An optional array to accumulate file paths (for recursion).
     * @returns A promise that resolves to an array of file paths.
     */
    listFiles: async (dir, fileList = []) => {
      if (!import_fs.default.existsSync(dir)) {
        return fileList;
      }
      const files = await import_fs.default.promises.readdir(dir);
      for (const file of files) {
        const filePath = import_path.default.join(dir, file);
        const stats = await import_fs.default.promises.stat(filePath);
        if (stats.isDirectory()) {
          fileList = await fileman.path.listFiles(filePath, fileList);
        } else {
          fileList.push(filePath);
        }
      }
      return fileList;
    },
    /**
     * Recursively lists all folders in a directory.
     * @param dir The directory to list folders from.
     * @param folderList An optional array to accumulate folder paths (for recursion).
     * @returns A promise that resolves to an array of folder paths.
     */
    listFolders: async (dir, folderList = []) => {
      if (!import_fs.default.existsSync(dir)) {
        return folderList;
      }
      const files = await import_fs.default.promises.readdir(dir);
      for (const file of files) {
        const filePath = import_path.default.join(dir, file);
        const stats = await import_fs.default.promises.stat(filePath);
        if (stats.isDirectory()) {
          folderList.push(filePath);
          folderList = await fileman.path.listFolders(filePath, folderList);
        }
      }
      return folderList;
    }
  },
  clone: {
    /**
     * Performs a hard copy (clones) of a source directory to a destination, ignoring specified files.
     * @param source The source path to clone.
     * @param destination The destination path.
     * @param ignoreFiles An array of file paths to ignore during cloning.
     * @returns A promise that resolves when the cloning is complete.
     * @throws Error if the source path does not exist.
     */
    hard: async (source, destination, ignoreFiles = []) => {
      const copyRecursiveAsync = async (src, dest) => {
        const stats = await import_fs.default.promises.stat(src);
        if (stats.isDirectory()) {
          await import_fs.default.promises.mkdir(dest, { recursive: true });
          const children = await import_fs.default.promises.readdir(src);
          for (const child of children) {
            const childSrc = import_path.default.join(src, child);
            const childDest = import_path.default.join(dest, child);
            if (!ignoreFiles.includes(childSrc)) {
              await copyRecursiveAsync(childSrc, childDest);
            }
          }
        } else if (!ignoreFiles.includes(src)) {
          await import_fs.default.promises.copyFile(src, dest);
        }
      };
      if (!import_fs.default.existsSync(source)) {
        throw new Error("Target folder does not exist.\n" + source);
      }
      await copyRecursiveAsync(source, destination);
    },
    /**
     * Safely clones a source directory to a destination, preventing overwrites of existing files in the destination.
     * @param source The source path to clone.
     * @param destination The destination path.
     * @param ignoreFiles An array of file paths to explicitly ignore during cloning.
     * @returns A promise that resolves when the safe cloning is complete.
     */
    safe: async (source, destination, ignoreFiles = []) => {
      const destinationFiles = import_fs.default.existsSync(destination) ? [
        ...await fileman.path.listFiles(destination),
        ...await fileman.path.listFolders(destination)
      ].map(
        (file) => import_path.default.join(source, file.replace(destination, ""))
      ) : [];
      await fileman.clone.hard(source, destination, [
        ...ignoreFiles,
        ...destinationFiles
      ]);
    }
  },
  read: {
    /**
     * Reads the content of a file. Can read from a local path or a URL.
     * @param target The file path or URL to read.
     * @param online If true, attempts to fetch the file from a URL.
     * @returns A promise that resolves to an object containing status and data.
     */
    file: async (target, online = false) => {
      try {
        if (online) {
          const response = await fetch(target);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return { status: true, data: await response.text() };
        } else {
          if (!import_fs.default.existsSync(target)) {
            throw new Error(`File does not exist: ${target}`);
          }
          const fileData = await import_fs.default.promises.readFile(target, "utf8");
          return { status: true, data: fileData };
        }
      } catch {
        return { status: false, data: "" };
      }
    },
    /**
     * Reads and parses a JSON file. Can read from a local path or a URL.
     * Removes comments from local JSON files before parsing.
     * @param target The file path or URL to read.
     * @param online If true, attempts to fetch the JSON from a URL.
     * @returns A promise that resolves to an object containing status and parsed JSON data.
     */
    json: async (target, online = false) => {
      try {
        if (online) {
          const response = await fetch(target);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return { status: true, data: await response.json() };
        } else {
          if (!import_fs.default.existsSync(target)) {
            throw new Error(`File does not exist: ${target}`);
          }
          const fileContent = await import_fs.default.promises.readFile(target, "utf8");
          const cleanedContent = fileContent.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
          return {
            status: true,
            data: JSON.parse(cleanedContent)
          };
        }
      } catch {
        return { status: false, data: {} };
      }
    },
    /**
     * Reads multiple files from a target directory based on specified extensions.
     * @param target The directory to read files from.
     * @param extensions An array of file extensions (e.g., ["txt", "md"]). If empty, all files are read.
     * @returns A promise that resolves to an object where keys are file paths and values are their content.
     */
    bulk: async (target, extensions = []) => {
      const result = {};
      const desiredExtensions = extensions.map((ext) => "." + ext);
      const files = await fileman.path.listFiles(target);
      for (const file of files) {
        if (desiredExtensions.includes(import_path.default.extname(file)) || desiredExtensions.length === 0) {
          result[file] = await import_fs.default.promises.readFile(file, "utf-8");
        }
      }
      return result;
    }
  },
  write: {
    /**
     * Writes content to a file. Creates parent directories if they don't exist.
     * @param filePath The path to the file to write.
     * @param content The content to write to the file.
     * @returns A promise that resolves when the file is written.
     */
    file: async (filePath, content) => {
      try {
        const dir = import_path.default.dirname(filePath);
        if (!import_fs.default.existsSync(dir)) {
          await import_fs.default.promises.mkdir(dir, { recursive: true });
        }
        await import_fs.default.promises.writeFile(filePath, content, "utf8");
      } catch (err) {
        console.error(`Error writing to file ${filePath}:`, err);
      }
    },
    /**
     * Writes a JavaScript object to a JSON file. Creates parent directories if they don't exist.
     * @param pathString The path to the JSON file to write.
     * @param object The JavaScript object to write as JSON.
     * @returns A promise that resolves when the JSON file is written.
     */
    json: async (pathString, object) => {
      try {
        const dir = import_path.default.dirname(pathString);
        if (!import_fs.default.existsSync(dir)) {
          await import_fs.default.promises.mkdir(dir, { recursive: true });
        }
        await import_fs.default.promises.writeFile(
          pathString,
          JSON.stringify(object, null, 2),
          "utf8"
        );
      } catch (err) {
        console.error(`Error writing JSON data to ${pathString}:`, err);
      }
    },
    /**
     * Writes multiple files from an object where keys are file paths and values are their content.
     * @param fileContentObject An object mapping file paths to their content.
     * @returns A promise that resolves when all files are written.
     */
    bulk: async (fileContentObject) => {
      for (const filePath in fileContentObject) {
        await fileman.write.file(filePath, fileContentObject[filePath]);
      }
    }
  },
  sync: {
    /**
     * Synchronizes a local file with an online version.
     * If the online version is available, it's downloaded and written locally.
     * Otherwise, the existing local file content is returned.
     * @param url The URL of the online file.
     * @param localPath The local path to store the file.
     * @returns A promise that resolves to the content of the file.
     */
    file: async (url, localPath) => {
      const latest = await fileman.read.file(url, true);
      if (latest.status) {
        await fileman.write.file(localPath, latest.data);
        return latest.data;
      }
      const current = await fileman.read.file(localPath);
      return current.status ? current.data : "";
    },
    /**
     * Synchronizes a local JSON file with an online version.
     * If the online version is available, it's downloaded and written locally.
     * Otherwise, the existing local JSON data is returned.
     * @param url The URL of the online JSON file.
     * @param localPath The local path to store the JSON file.
     * @returns A promise that resolves to the parsed JSON data.
     */
    json: async (url, localPath) => {
      const latest = await fileman.read.json(url, true);
      if (latest.status) {
        await fileman.write.json(localPath, latest.data);
        return latest.data;
      }
      const current = await fileman.read.json(localPath);
      return current.status ? current.data : {};
    },
    /**
     * Synchronizes files between a source and target directory.
     * Files present in the target but not in the source (and not unsynced extensions) are deleted from the target.
     * Files from the source are copied to the target.
     * Optionally reads content of included extensions into the result.
     * @param source The source directory.
     * @param target The target directory to synchronize with.
     * @param extInclude An array of extensions whose files should have their content returned in the result.
     * @param extnUnsync An array of extensions that should not be synchronized (i.e., deleted from target if not in source).
     * @param fileExcludes An array of file paths (relative to source/target) to completely exclude from sync operations.
     * @returns A promise that resolves to an object indicating status and the content of included files.
     */
    bulk: async (source, target, extInclude = [], extnUnsync = [], fileExcludes = []) => {
      const result = {
        status: true,
        fileContents: {}
      };
      const includeExtensions = extInclude.map((ext) => "." + ext);
      const unsyncExtensions = extnUnsync.map((ext) => "." + ext);
      const sourceExists = import_fs.default.existsSync(source);
      const targetExists = import_fs.default.existsSync(target);
      if (!sourceExists && !targetExists) {
        return { status: false, fileContents: {} };
      }
      if (!targetExists) {
        await fileman.clone.hard(source, target);
      } else if (!sourceExists) {
        await fileman.clone.hard(target, source);
      }
      const targetFiles = await fileman.path.listFiles(target);
      const relativeTargetFiles = targetFiles.map((file) => import_path.default.relative(target, file)).filter(
        (file) => !fileExcludes.some((ignore) => file.startsWith(ignore))
      );
      const sourceFiles = await fileman.path.listFiles(source);
      const relativeSourceFiles = sourceFiles.map((file) => import_path.default.relative(source, file)).filter(
        (file) => !fileExcludes.some((ignore) => file.startsWith(ignore))
      );
      for (const file of relativeTargetFiles) {
        if (!relativeSourceFiles.includes(file) || unsyncExtensions.includes(import_path.default.extname(file))) {
          await import_fs.default.promises.unlink(import_path.default.join(target, file));
        }
      }
      for (const file of relativeSourceFiles) {
        const sourceFilePath = import_path.default.join(source, file);
        const targetFilePath = import_path.default.join(target, file);
        const targetDirPath = import_path.default.dirname(targetFilePath);
        if (!import_fs.default.existsSync(targetDirPath)) {
          await import_fs.default.promises.mkdir(targetDirPath, { recursive: true });
        }
        if (includeExtensions.includes(import_path.default.extname(file))) {
          result.fileContents[file] = await import_fs.default.promises.readFile(
            sourceFilePath,
            "utf-8"
          );
        } else {
          await import_fs.default.promises.copyFile(sourceFilePath, targetFilePath);
        }
      }
      const targetFolders = (await fileman.path.listFolders(target)).map((folder) => import_path.default.relative(target, folder)).filter((value, index, self) => self.indexOf(value) === index);
      for (const folder of targetFolders) {
        const targetFolderPath = import_path.default.join(target, folder);
        const sourceFolderPath = import_path.default.join(source, folder);
        if (import_fs.default.existsSync(targetFolderPath) && !import_fs.default.existsSync(sourceFolderPath)) {
          const filesInTargetFolder = await import_fs.default.promises.readdir(targetFolderPath);
          if (filesInTargetFolder.length === 0) {
            await import_fs.default.promises.rm(targetFolderPath, { recursive: true, force: true });
          }
        }
      }
      return result;
    }
  },
  delete: {
    /**
     * Deletes a file or a folder (recursively for folders).
     * @param pathToDelete The path to the file or folder to delete.
     * @returns A promise that resolves to an object indicating success and a message.
     */
    file: async (pathToDelete) => {
      try {
        if (import_fs.default.existsSync(pathToDelete)) {
          const stats = await import_fs.default.promises.stat(pathToDelete);
          if (stats.isDirectory()) {
            await import_fs.default.promises.rm(pathToDelete, {
              recursive: true,
              force: true
            });
          } else {
            await import_fs.default.promises.unlink(pathToDelete);
          }
          return { success: true, message: "Path deleted successfully." };
        }
        return { success: false, message: "Path does not exist." };
      } catch (error) {
        console.error("Error deleting path:", error);
        return { success: false, message: "Error deleting path." };
      }
    },
    /**
     * Deletes multiple files or folders in bulk.
     * @param pathsToDelete A spread array of paths to delete.
     * @returns A promise that resolves when all paths are processed.
     */
    bulk: async (...pathsToDelete) => {
      await Promise.all(pathsToDelete.map((pathString) => fileman.delete.file(pathString)));
    },
    /**
     * Cleans a folder by deleting its contents based on extensions and ignored paths.
     * Leaves the folder itself intact.
     * @param folderPath The path of the folder to clean.
     * @param extensions An array of file extensions to delete. If empty, all files are deleted.
     * @param ignorePaths An array of absolute paths (files or folders) to ignore during deletion.
     * @returns A promise that resolves to an object indicating success and a message.
     */
    folder: async (folderPath, extensions = [], ignorePaths = []) => {
      try {
        if (!import_fs.default.existsSync(folderPath)) {
          return { success: false, message: "Folder does not exist." };
        }
        const files = await fileman.path.listFiles(folderPath);
        for (const file of files) {
          if (ignorePaths.includes(file)) {
            continue;
          }
          if (extensions.length === 0 || extensions.includes(import_path.default.extname(file).substring(1))) {
            await import_fs.default.promises.unlink(file);
          }
        }
        const folders = await fileman.path.listFolders(folderPath);
        for (let i = folders.length - 1; i >= 0; i--) {
          const subFolder = folders[i];
          if (ignorePaths.includes(subFolder)) {
            continue;
          }
          const filesInSubFolder = await import_fs.default.promises.readdir(subFolder);
          if (filesInSubFolder.length === 0) {
            await import_fs.default.promises.rm(subFolder, { recursive: true, force: true });
          }
        }
        return { success: true, message: "Folder cleaned successfully." };
      } catch (error) {
        console.error("Error cleaning folder:", error);
        return { success: false, message: "Error cleaning folder." };
      }
    }
  }
};
var fileman_default = fileman;

// typescript/Shell/0.root.ts
var style = {
  TS_Bold: "1",
  TS_Dim: "2",
  TS_Italic: "3",
  TS_Underline: "4",
  TS_Blink_Slow: "5",
  TS_Blink_Fast: "6",
  TS_Reverse: "7",
  TS_Hidden: "8",
  TS_Strikethrough: "9",
  TS_Rare: "20",
  TS_Reset_Bold_2UL: "21",
  TS_Reset_intensity: "22",
  TS_Reset_italic: "23",
  TS_Reset_underlined: "24",
  TS_Reset_blinking: "25",
  TS_Reset_inverted: "27",
  TS_Reset_hidden: "28",
  TS_Reset_struck: "29",
  BG_Normal_Black: "30",
  BG_Normal_Red: "31",
  BG_Normal_Green: "32",
  BG_Normal_Yellow: "33",
  BG_Normal_Blue: "34",
  BG_Normal_Magenta: "35",
  BG_Normal_Cyan: "36",
  BG_Normal_White: "37",
  BG_Bright_Black: "90",
  BG_Bright_Red: "91",
  BG_Bright_Green: "92",
  BG_Bright_Yellow: "93",
  BG_Bright_Blue: "94",
  BG_Bright_Magenta: "95",
  BG_Bright_Cyan: "96",
  BG_Bright_White: "97",
  FG_Normal_Black: "40",
  FG_Normal_Red: "41",
  FG_Normal_Green: "42",
  FG_Normal_Yellow: "43",
  FG_Normal_Blue: "44",
  FG_Normal_Magenta: "45",
  FG_Normal_Cyan: "46",
  FG_Normal_White: "47",
  FG_Bright_Black: "100",
  FG_Bright_Red: "101",
  FG_Bright_Green: "102",
  FG_Bright_Yellow: "103",
  FG_Bright_Blue: "104",
  FG_Bright_Magenta: "105",
  FG_Bright_Cyan: "106",
  FG_Bright_White: "107"
};
var canvas = {
  config: {
    title: [],
    text: [],
    primary: [],
    secondary: [],
    tertiary: [],
    success: [],
    failed: [],
    warning: [],
    taskActive: true,
    postActive: true,
    tabSpace: 2
  },
  divider: {
    top: "\u203E",
    mid: "\u2500",
    low: "_"
  },
  tab: " ",
  width: () => typeof process.stdout.columns === "number" ? process.stdout.columns : 48
};
Object.assign(
  canvas.config,
  {
    title: [style.BG_Normal_Green],
    text: [style.BG_Normal_White],
    primary: [style.BG_Normal_Yellow],
    secondary: [style.BG_Bright_Yellow],
    tertiary: [style.BG_Bright_Black],
    success: [style.BG_Normal_Green],
    failed: [style.BG_Normal_Red],
    warning: [style.BG_Normal_Yellow]
  }
);
function format(string = "", ...styles) {
  return `\x1B[${styles.join(";")}m${string}\x1B[0m`;
}

// typescript/Shell/1.tag.ts
var textFormatter = {
  H1: (content) => {
    const minWidth = 10;
    const width = Math.max(canvas.width(), minWidth);
    const lines = [];
    let currentLine = "";
    const words = content.split(" ");
    for (const word of words) {
      if (currentLine.length + word.length + 1 <= width - 6) {
        currentLine += (currentLine ? " " : "") + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    const paddedLines = [];
    for (const line of lines) {
      const padding = width - 6 - line.length;
      const leftPad = " ".repeat(Math.max(0, Math.floor(padding / 2)));
      const rightPad = " ".repeat(Math.max(0, Math.ceil(padding / 2)));
      paddedLines.push(`>>>${leftPad}${line}${rightPad}<<<`);
    }
    return format(["", canvas.divider.mid, ...paddedLines, canvas.divider.mid, ""].join("\n"));
  },
  H2: (content) => format([canvas.divider.mid, content, canvas.divider.mid, ""].join("\n")),
  H3: (content) => format([canvas.divider.mid, content, ""].join("\n")),
  H4: (content) => format([content, canvas.divider.mid].join("\n")),
  H5: (content) => format([content, ""].join("\n")),
  H6: (content) => format([content].join("\n")),
  P: (content) => format(canvas.tab + content) + "\n",
  Li: (content) => format(">", style.TS_Bold, ...canvas.config.tertiary) + canvas.tab + content,
  Div: (content) => format(content),
  Hr: (content = "\u2500") => format("\n" + content.charAt(0).repeat(Math.ceil(canvas.width() / content.length)).slice(0, canvas.width())),
  Br: (repeat = 1) => format("\n".repeat(repeat)),
  Tab: (count = 1) => format(canvas.tab.repeat(count))
};
var tag_default = textFormatter;

// typescript/Shell/2.list.ts
var colors = {
  std: (item) => format(item),
  title: (item) => format(item, ...canvas.config.title),
  text: (item) => format(item, ...canvas.config.text),
  primary: (item) => format(item, ...canvas.config.primary),
  secondary: (item) => format(item, ...canvas.config.secondary),
  tertiary: (item) => format(item, ...canvas.config.tertiary),
  warning: (item) => format(item, ...canvas.config.warning),
  failed: (item) => format(item, ...canvas.config.failed),
  success: (item) => format(item, ...canvas.config.success)
};
var createListFormatters = (colorTheme) => ({
  Level: (items = [], intent = 0) => {
    const keyLength = items.reduce((max, key) => key.length > max ? key.length : max, 0);
    return items.map((key) => canvas.tab.repeat(intent) + colorTheme(key.padEnd(keyLength) + canvas.tab));
  },
  Blocks: (items = [], intent = 0) => {
    const size = items.reduce((length, item) => {
      if (item.length > length) {
        length = item.length;
      }
      return length;
    }, 0) + intent + canvas.tab.length;
    const cols = Math.floor(canvas.width() / (size + 3));
    const result = [];
    let subResult = "";
    items.forEach((item, index) => {
      if ((index + 1) % cols) {
        subResult += tag_default.Li(colorTheme(item.padEnd(size)));
      } else {
        subResult += tag_default.Li(colorTheme(item.padEnd(size)));
        result.push(subResult);
        subResult = "";
      }
    });
    if (subResult.length) {
      result.push(subResult);
    }
    return result;
  },
  Entries: (items = [], intent = 0) => {
    return items.map((item) => canvas.tab.repeat(intent) + tag_default.Div(colorTheme(item)));
  },
  Bullets: (items = [], intent = 0) => {
    return items.map((item) => canvas.tab.repeat(intent) + tag_default.Li(colorTheme(item)));
  },
  Numbers: (items = [], intent = 0) => {
    return items.map(
      (item, index) => canvas.tab.repeat(intent) + format(String(index + 1), ...canvas.config.secondary, ...style.TS_Bold) + canvas.tab.repeat(intent) + tag_default.Div(colorTheme(item))
    );
  },
  Intents: (items = [], intent = 0) => {
    return items.map((item) => "\n".repeat(intent - 1) + tag_default.P(colorTheme(item)));
  },
  Waterfall: (items = [], intent = 0) => {
    return items.map((item, key) => {
      return canvas.tab.repeat(intent) + format(key === items.length - 1 ? "\u2514\u2500>" : "\u251C\u2500>", style.TS_Bold, ...canvas.config.secondary) + colorTheme(canvas.tab.repeat(intent) + item);
    });
  }
});
var list_default = {
  std: createListFormatters(colors.std),
  title: createListFormatters(colors.title),
  text: createListFormatters(colors.text),
  primary: createListFormatters(colors.primary),
  secondary: createListFormatters(colors.secondary),
  tertiary: createListFormatters(colors.tertiary),
  failed: createListFormatters(colors.failed),
  success: createListFormatters(colors.success),
  warning: createListFormatters(colors.warning)
};

// typescript/Shell/3.write.ts
var composeBlock = (headingType, heading, contents) => {
  if (contents.length) {
    contents.push(format());
  }
  return [headingType(heading), ...contents].join("\n");
};
var blockType = {
  Chapter: (heading, contents) => composeBlock(tag_default.H1, heading, contents),
  Section: (heading, contents) => composeBlock(tag_default.H2, heading, contents),
  Footer: (heading, contents) => composeBlock(tag_default.H3, heading, contents),
  Topic: (heading, contents) => composeBlock(tag_default.H4, heading, contents),
  Note: (heading, contents) => composeBlock(tag_default.H5, heading, contents),
  Points: (heading, contents) => composeBlock(tag_default.H6, heading, contents)
};
var blockColor = {
  std: (blockType2, heading, contents) => format(
    blockType2(heading, contents.map((content) => content)),
    style.TS_Bold,
    ...canvas.config.primary
  ),
  title: (blockType2, heading, contents) => format(
    blockType2(heading, contents.map((content) => format(content, ...canvas.config.title))),
    style.TS_Bold,
    ...canvas.config.title
  ),
  text: (blockType2, heading, contents) => format(
    blockType2(heading, contents.map((content) => format(content, ...canvas.config.text))),
    style.TS_Bold,
    ...canvas.config.text
  ),
  primary: (blockType2, heading, contents) => format(
    blockType2(heading, contents.map((content) => format(content, ...canvas.config.primary))),
    style.TS_Bold,
    ...canvas.config.primary
  ),
  secondary: (blockType2, heading, contents) => format(
    blockType2(heading, contents.map((content) => format(content, ...canvas.config.secondary))),
    style.TS_Bold,
    ...canvas.config.secondary
  ),
  tertiary: (blockType2, heading, contents) => format(
    blockType2(heading, contents.map((content) => format(content, ...canvas.config.tertiary))),
    style.TS_Bold,
    ...canvas.config.tertiary
  ),
  success: (blockType2, heading, contents) => format(
    blockType2(heading, contents.map((content) => format(content, ...canvas.config.success))),
    style.TS_Bold,
    ...canvas.config.success
  ),
  failed: (blockType2, heading, contents) => format(
    blockType2(heading, contents.map((content) => format(content, ...canvas.config.failed))),
    style.TS_Bold,
    ...canvas.config.failed
  ),
  warning: (blockType2, heading, contents) => format(
    blockType2(heading, contents.map((content) => format(content, ...canvas.config.warning))),
    style.TS_Bold,
    ...canvas.config.warning
  )
};
function contentColorMapper(content, blockColorKey) {
  switch (blockColorKey) {
    case "title":
      return format(content, ...canvas.config.title);
    case "text":
      return format(content, ...canvas.config.text);
    case "primary":
      return format(content, ...canvas.config.primary);
    case "secondary":
      return format(content, ...canvas.config.secondary);
    case "tertiary":
      return format(content, ...canvas.config.tertiary);
    case "failed":
      return format(content, ...canvas.config.failed);
    case "success":
      return format(content, ...canvas.config.success);
    case "warning":
      return format(content, ...canvas.config.warning);
    default:
      return format(content);
  }
}
var blockMethod = (blockTypeFn, heading, contents = [], selectListType = list_default.std.Blocks, intent = 0, blockColorKey) => blockColor[blockColorKey](blockTypeFn, heading, selectListType(contents, intent));
var createBlockGroupExport = (blockColorKey) => {
  return {
    Text: (string, intent = 0) => canvas.tab.repeat(intent) + contentColorMapper(string, blockColorKey),
    Item: (string, intent = 0) => canvas.tab.repeat(intent) + tag_default.Li(contentColorMapper(string, blockColorKey)),
    Block: (contents = [], selectListType = list_default.std.Blocks, intent = 0) => canvas.tab.repeat(intent) + selectListType(contents, intent).join("\n") + "\n",
    Chapter: (heading, contents = [], selectListType = list_default.std.Blocks, intent = 0) => blockMethod(blockType.Chapter, heading, contents, selectListType, intent, blockColorKey),
    Section: (heading, contents = [], selectListType = list_default.std.Blocks, intent = 0) => blockMethod(blockType.Section, heading, contents, selectListType, intent, blockColorKey),
    Footer: (heading, contents = [], selectListType = list_default.std.Blocks, intent = 0) => blockMethod(blockType.Footer, heading, contents, selectListType, intent, blockColorKey),
    Topic: (heading, contents = [], selectListType = list_default.std.Blocks, intent = 0) => blockMethod(blockType.Topic, heading, contents, selectListType, intent, blockColorKey),
    Note: (heading, contents = [], selectListType = list_default.std.Blocks, intent = 0) => blockMethod(blockType.Note, heading, contents, selectListType, intent, blockColorKey),
    List: (heading, contents = [], selectListType = list_default.std.Blocks, intent = 0) => blockMethod(blockType.Points, heading, contents, selectListType, intent, blockColorKey)
  };
};
var write_default = {
  std: createBlockGroupExport("std"),
  title: createBlockGroupExport("title"),
  text: createBlockGroupExport("text"),
  primary: createBlockGroupExport("primary"),
  secondary: createBlockGroupExport("secondary"),
  tertiary: createBlockGroupExport("tertiary"),
  failed: createBlockGroupExport("failed"),
  success: createBlockGroupExport("success"),
  warning: createBlockGroupExport("warning")
};

// typescript/Shell/4.post.ts
var import_readline = __toESM(require("readline"), 1);
var backspace = (chars) => {
  if (chars <= 0) {
    return;
  }
  import_readline.default.moveCursor(process.stdout, -chars, 0);
  import_readline.default.clearLine(process.stdout, 1);
};
var write = (string = "", backRows = 0) => {
  if (backRows > 0) {
    import_readline.default.moveCursor(process.stdout, 0, -backRows);
    import_readline.default.clearScreenDown(process.stdout);
  } else if (backRows < 0) {
    console.clear();
  }
  const rowsCreated = string.split("\n").length;
  console.log(string);
  return rowsCreated;
};
var animate = (frames = [], duration = 1e3, repeat = 0) => {
  const interval = Math.ceil(duration / (frames.length * (repeat || 1))) || 1;
  let iteration = 0, backRows = 0, frameIndex = 0;
  return new Promise((resolve) => {
    const intervalId = setInterval(() => {
      if (frameIndex === frames.length) {
        frameIndex = 0;
        iteration++;
      }
      if (iteration >= repeat && frameIndex === 0) {
        clearInterval(intervalId);
        resolve(null);
        return;
      }
      backRows = write(frames[frameIndex++], backRows);
    }, interval);
  });
};
var post_default = {
  write,
  animate,
  backspace
};

// typescript/Shell/frames/0.title.ts
var padBothSides = (str, totalLength) => {
  const totalPadding = totalLength - str.length;
  const startPadding = Math.floor(totalPadding / 2);
  const endPadding = totalPadding - startPadding;
  return " ".repeat(startPadding) + str + " ".repeat(endPadding);
};
var modifyString = (str) => {
  str = str.substring(1, str.length - 1);
  if (str.startsWith(" ")) {
    str = str.substring(1, str.length - 1);
  } else {
    str = str.substring(0, str.length - 2);
  }
  return ">" + str + "<";
};
var title_default = (string) => {
  const previewFrames = Math.ceil(string.length / 16);
  const renders = [], preview = [
    ...new Array(previewFrames * 2).fill(["", "", canvas.divider.mid, ""]),
    ...new Array(previewFrames).fill([
      "",
      format(canvas.divider.top, style.TS_Bold, style.TS_Underline, ...canvas.config.title),
      "",
      ""
    ]),
    ...new Array(previewFrames).fill([
      "",
      canvas.divider.low,
      "\xB7" + padBothSides("\xB7", canvas.width() - 2) + "\xB7",
      canvas.divider.top,
      ""
    ]),
    ...new Array(previewFrames).fill([
      "",
      canvas.divider.mid,
      ">" + padBothSides("-", canvas.width() - 2) + "<",
      canvas.divider.mid,
      ""
    ]),
    ...new Array(previewFrames).fill([
      "",
      canvas.divider.top,
      ">>" + padBothSides("\xD7", canvas.width() - 4) + "<<",
      canvas.divider.low,
      ""
    ])
  ].map((frame) => format(frame.join("\n"), style.TS_Bold, ...canvas.config.title));
  string = "   " + string + "   ";
  while (string.length !== 1 && string.length !== 2) {
    string = modifyString(string);
    renders.unshift(
      format(blockType.Chapter(string, []), style.TS_Bold, ...canvas.config.title)
    );
  }
  return preview.concat(renders);
};

// typescript/Shell/frames/1.loki.ts
var loki_default = (string, frames = 1) => {
  const characters = Math.floor(Math.random() * string.length);
  const styles = Object.keys(style);
  const renders = [];
  if (characters > string.length) {
    string = string.padEnd(characters, " ");
  }
  for (let i = 0; i < frames; i++) {
    const styledIndices = /* @__PURE__ */ new Set();
    let styledString = string;
    for (let j = 0; j < characters; j++) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * string.length);
      } while (styledIndices.has(randomIndex));
      styledIndices.add(randomIndex);
      const randomStyle = styles[Math.floor(Math.random() * styles.length)];
      const styledCharacter = format(string[randomIndex], randomStyle);
      styledString = styledString.substring(0, randomIndex) + styledCharacter + styledString.substring(randomIndex + 1);
    }
    renders.push(styledString);
  }
  return renders;
};

// typescript/Shell/frames/index.ts
var frames_default = {
  Title: (string, duration, repeat = 1) => {
    return new Promise((resolve) => {
      const frames = title_default(string);
      resolve(post_default.animate(frames, duration, repeat));
    });
  },
  Loki: (string, varients = 50, duration) => {
    return new Promise((resolve) => {
      const frames = loki_default(string, varients);
      resolve(post_default.animate(frames, duration, 0));
    });
  }
};

// typescript/Shell/main.ts
function init(taskActive = true, postActive = true, tabWidth = 2) {
  const width = canvas.width();
  canvas.tab = canvas.tab[0].repeat(tabWidth);
  canvas.config.taskActive = taskActive;
  canvas.config.postActive = postActive;
  canvas.divider.low = canvas.divider.low[0].repeat(width);
  canvas.divider.mid = canvas.divider.mid[0].repeat(width);
  canvas.divider.top = canvas.divider.top[0].repeat(width);
}
var task = (string, rowshift = -1) => {
  if (canvas.config.taskActive && canvas.config.postActive) {
    post_default.write(
      [
        rowshift >= 0 ? tag_default.Br(rowshift) : "",
        tag_default.Div(format(">>>", ...canvas.config.primary, style.TS_Rare)),
        canvas.tab,
        tag_default.Div(format(string + ".", style.TS_Bold, style.TS_Italic, ...canvas.config.tertiary)),
        tag_default.Br(1)
      ].join(""),
      rowshift < 0 ? -rowshift : rowshift
    );
  }
};
var step = (string, rowshift = -1) => {
  if (canvas.config.taskActive && canvas.config.postActive) {
    post_default.write(
      [
        rowshift >= 0 ? tag_default.Br(rowshift) : "",
        tag_default.Div(format(">>>", style.TS_Rare, style.TS_Bold, ...canvas.config.primary)),
        canvas.tab,
        tag_default.Div(format(string + " ...", style.TS_Italic, ...canvas.config.tertiary))
      ].join(""),
      rowshift < 0 ? -rowshift : rowshift
    );
  }
};
var post = (string, ...styles) => {
  post_default.write(format(string, ...styles));
};
var main_default = {
  tag: tag_default,
  list: list_default,
  style,
  canvas,
  render: post_default,
  INIT: init,
  TASK: task,
  STEP: step,
  POST: post,
  PLAY: frames_default,
  MOLD: write_default,
  MAKE: format
};

// typescript/shell.ts
function PropMap(record, color) {
  const keys = [];
  const values = [];
  Object.entries(record).forEach(([k, v]) => {
    keys.push(k);
    values.push(v);
  });
  const coloredKeys = main_default.list[color].Level(keys.map((k) => main_default.MAKE(k, main_default.style.TS_Bold)));
  return coloredKeys.map((k, i) => k + ": " + values[i]);
}
var Props = {
  std: (record) => PropMap(record, "std"),
  title: (record) => PropMap(record, "title"),
  text: (record) => PropMap(record, "text"),
  primary: (record) => PropMap(record, "primary"),
  secondary: (record) => PropMap(record, "secondary"),
  tertiary: (record) => PropMap(record, "tertiary"),
  warning: (record) => PropMap(record, "warning"),
  failed: (record) => PropMap(record, "failed"),
  success: (record) => PropMap(record, "success")
};

// typescript/Utils/1.string.ts
var ALPHANUMERIC = /[a-z0-9]/gi;
var SPACE = /\s+/g;
var string_default = {
  normalize: (string = "", keepChars = [], skipChars = [], addBackSlashFor = []) => {
    let final = "";
    string.replace(SPACE, "_").split("").forEach((ch) => {
      if (skipChars.includes(ch)) {
        return;
      } else if (addBackSlashFor.includes(ch)) {
        final += "\\" + ch;
      } else {
        final += ch === "_" ? "_" : keepChars.includes(ch) ? ch : ch.match(ALPHANUMERIC) ? ch : "-";
      }
    });
    return final;
  },
  minify: (string) => {
    const length = string.length;
    const result = [];
    let lastCh = " ";
    for (let i = 0; i < length; i++) {
      const ch = string[i] === "\n" || string[i] === "\r" || string[i] === "	" ? " " : string[i];
      if (ch === " " && lastCh !== " ") {
        result.push(ch);
      } else if (ch !== " ") {
        result.push(ch);
      }
      lastCh = ch;
    }
    if (result.length > 0 && lastCh === " ") {
      result.pop();
    }
    return result.join("");
  },
  zeroBreaks: (string, conditions = [" ", "\n", ","]) => {
    const length = string.length;
    const result = [];
    let start = 0;
    for (let i = 0; i < length; i++) {
      const ch = string[i];
      if (conditions.includes(ch)) {
        if (i > start) {
          result.push(string.substring(start, i));
        }
        start = i + 1;
      }
    }
    if (length > start) {
      result.push(string.substring(start, length));
    }
    return result;
  },
  enCounter: (number) => {
    const digits = "0123456789_abcdefghijklmnopqrstuvwxyz-ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const base = digits.length;
    let result = "", reminder = 0;
    while (number) {
      reminder = number % base;
      result = digits[reminder] + result;
      number = Math.floor(number / base);
    }
    return result;
  },
  stringMem: (string) => Number((string.length / 1024).toFixed(2))
};

// typescript/Utils/2.object.ts
function objectSwitch(srcObject) {
  if (!srcObject || typeof srcObject !== "object") {
    return {};
  }
  const output = {};
  for (const outerKey in srcObject) {
    if (Object.prototype.hasOwnProperty.call(srcObject, outerKey) && outerKey[0] !== "+") {
      const innerObject = srcObject[outerKey];
      if (typeof innerObject === "object" && innerObject !== null) {
        for (const innerKey in innerObject) {
          if (Object.prototype.hasOwnProperty.call(innerObject, innerKey)) {
            if (!output[innerKey]) {
              output[innerKey] = {};
            }
            output[innerKey][outerKey] = innerObject[innerKey];
          }
        }
      }
    }
  }
  return output;
}
function deepMerge(target, source) {
  if (!source || typeof source !== "object") {
    return target;
  }
  for (const key in source) {
    const sourceValue = source[key];
    if (sourceValue === void 0) {
      continue;
    }
    const targetValue = target[key];
    if (targetValue && sourceValue && typeof targetValue === "object" && typeof sourceValue === "object" && !Array.isArray(targetValue)) {
      target[key] = deepMerge(targetValue, sourceValue);
    } else {
      target[key] = sourceValue;
    }
  }
  return target;
}
function bulkMerge(objectArray = [], aggressive = false, arrayMerge = false) {
  if (!Array.isArray(objectArray) || objectArray.length === 0) {
    return {};
  }
  function innerMerge(target, source) {
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const srcVal = source[key];
        const tgtVal = target[key];
        if (typeof srcVal === "object" && srcVal !== null && !Array.isArray(srcVal)) {
          if (typeof tgtVal === "object" && tgtVal !== null && !Array.isArray(tgtVal)) {
            innerMerge(tgtVal, srcVal);
          } else {
            target[key] = { ...srcVal };
          }
        } else if (Array.isArray(srcVal) && Array.isArray(tgtVal) && arrayMerge) {
          tgtVal.push(...srcVal);
        } else if (aggressive || !(key in target)) {
          target[key] = srcVal;
        }
      }
    }
    return target;
  }
  return objectArray.reduce(
    (result, obj) => innerMerge(structuredClone(result), obj),
    {}
  );
}
function skeleton(object = {}) {
  return Object.entries(object).reduce((result, [k, o]) => {
    if (typeof o === "object" && o !== null) {
      result[k] = skeleton(o);
    }
    return result;
  }, {});
}
function ObjectDelta(A = {}, B = {}) {
  let score = 0;
  const result = {};
  Object.entries(B).forEach(([Bkey, Bvalue]) => {
    if (typeof Bvalue === "string" || typeof Bvalue === "number" || typeof Bvalue === "boolean" || Bvalue === null) {
      if (A[Bkey] !== Bvalue) {
        score++;
        result[Bkey] = Bvalue;
      }
    } else if (typeof Bvalue === "object" && Bvalue !== null) {
      if (typeof A[Bkey] === "object" && A[Bkey] !== null) {
        const subobj = ObjectDelta(
          A[Bkey],
          Bvalue
        );
        if (subobj.score) {
          result[Bkey] = subobj.result;
        }
        score += subobj.score;
      } else {
        result[Bkey] = Bvalue;
      }
    }
  });
  return { result, score };
}
var utils = {
  skeleton,
  deepMerge,
  onlyB: ObjectDelta,
  switch: objectSwitch,
  multiMerge: bulkMerge
};
var object_default = utils;

// typescript/Utils/3.array.ts
function setback(array) {
  const lastSeen = /* @__PURE__ */ new Map();
  array.forEach((item, index) => lastSeen.set(item, index));
  return array.filter((item, index) => lastSeen.get(item) === index);
}
function fromNumberedObject(obj, maxKey) {
  return Array.from({ length: maxKey + 1 }, (_, i) => obj[i] ?? []);
}
function longestSubChain(parent = [], child = []) {
  if (parent.length === 0 || child.length === 0) {
    return [];
  }
  const results = [];
  let remainingChild = [...child];
  let maxScore = 0;
  let resultIndex = 0;
  let parentInNow = 0;
  let parentInLast = 0;
  while (remainingChild.length) {
    parentInLast = -1;
    const currentChain = [];
    const remainingChildNext = [];
    for (let index = child.indexOf(remainingChild[0]); index < child.length; index++) {
      parentInNow = parent.indexOf(child[index]);
      if (parentInLast < parentInNow) {
        currentChain.push(child[index]);
        parentInLast = parentInNow;
      } else if (remainingChild.includes(child[index]) && parent.includes(child[index])) {
        remainingChildNext.push(child[index]);
      }
    }
    if (maxScore < currentChain.length) {
      maxScore = currentChain.length;
      resultIndex = results.length;
      results.push(currentChain);
    }
    remainingChild = remainingChildNext;
  }
  return results[resultIndex] ?? [];
}
function isSubsequence(subseq, sequence) {
  if (subseq.length === 0) {
    return true;
  }
  let subseqIndex = 0;
  for (const element of sequence) {
    if (subseqIndex < subseq.length && element === subseq[subseqIndex]) {
      subseqIndex++;
      if (subseqIndex === subseq.length) {
        return true;
      }
    }
  }
  return subseqIndex === subseq.length;
}
function findArrSuperParent(array, findFromArrays) {
  for (const candidate of findFromArrays) {
    if (isSubsequence(array, candidate)) {
      return candidate;
    }
  }
  return null;
}
var array_default = {
  setback,
  fromNumberedObject,
  longestSubChain,
  isSubsequence,
  findArrSuperParent
};

// typescript/Utils/4.code.ts
function isInString(input, index) {
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplateLiteral = false;
  let escaped = false;
  for (let i = 0; i < index; i++) {
    const char = input[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === "'" && !inDoubleQuote && !inTemplateLiteral) {
      inSingleQuote = !inSingleQuote;
    } else if (char === '"' && !inSingleQuote && !inTemplateLiteral) {
      inDoubleQuote = !inDoubleQuote;
    } else if (char === "`" && !inSingleQuote && !inDoubleQuote) {
      inTemplateLiteral = !inTemplateLiteral;
    }
  }
  return inSingleQuote || inDoubleQuote || inTemplateLiteral;
}
function stripComments(content) {
  const result = [];
  let i = 0;
  while (i < content.length) {
    const char = content[i];
    if (char === "/" && i + 1 < content.length && content[i + 1] === "/" && !isInString(content, i)) {
      i += 2;
      while (i < content.length && content[i] !== "\n") {
        i++;
      }
      continue;
    }
    if (char === "/" && i + 1 < content.length && content[i + 1] === "*" && !isInString(content, i)) {
      i += 2;
      while (i + 1 < content.length && !(content[i] === "*" && content[i + 1] === "/")) {
        i++;
      }
      i += 2;
      continue;
    }
    if (char === "<" && i + 3 < content.length && content.substring(i, i + 4) === "<!--" && !isInString(content, i)) {
      i += 4;
      while (i + 2 < content.length && content.substring(i, i + 3) !== "-->") {
        i++;
      }
      i += 3;
      continue;
    }
    result.push(char);
    i++;
  }
  return result.join("");
}
var REGEX_PATTERNS = {
  comments: /\/\*[\s\S]*?\*\//gm,
  spacing: /\s*([{}:;,])\s*|\s+([{}])|(:)\s*([^;}]*)\s*([;}])|\s*!important/g,
  valueOptimizations: /#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3|(\d+)(px|em|rem|%|vw|vh)\s+(\d+)\5|0(px|em|rem|%|vw|vh)/gi,
  rgbToHex: /rgb\((\d+),\s*(\d+),\s*(\d+)\)/g
};
function stripCssComments(content) {
  return content.replace(REGEX_PATTERNS.comments, "").replace(/(\s*\r\n)+/g, "\n").replace(/(\s*\n)+/g, "\n").trim();
}
function minifyCssAggressive(content) {
  return content.replace(
    REGEX_PATTERNS.spacing,
    (_, sym1, sym2, colon, value, end) => {
      if (sym1) {
        return sym1;
      }
      if (sym2) {
        return sym2;
      }
      if (colon) {
        return `${colon}${value}${end}`;
      }
      return "!important";
    }
  ).replace(
    REGEX_PATTERNS.valueOptimizations,
    (_, h1, h2, h3, num1, unit, num2) => {
      if (h1) {
        return `#${h1}${h2}${h3}`;
      }
      if (num1) {
        return `${num1} ${num2}${unit}`;
      }
      return "0";
    }
  ).replace(REGEX_PATTERNS.rgbToHex, (_, r, g, b) => {
    const toHex = (n) => Math.min(255, Math.max(0, +n)).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.replace(
      REGEX_PATTERNS.valueOptimizations,
      "#$1$2$3"
    );
  }).trim();
}
function minifyCssLite(content) {
  return content.replace(
    REGEX_PATTERNS.spacing,
    (_, sym1, sym2, colon, value, end) => {
      if (sym1) {
        return sym1;
      }
      if (sym2) {
        return sym2;
      }
      if (colon) {
        return `${colon}${value}${end}`;
      }
      return "!important";
    }
  ).trim();
}
var code_default = {
  jsonc: {
    parse: (string) => JSON.parse(stripComments(string)),
    build: (object) => JSON.stringify(object, null, 4)
  },
  uncomment: {
    Script: stripComments,
    Css: stripCssComments
  },
  minify: {
    Strict: minifyCssAggressive,
    Lite: minifyCssLite
  }
};

// typescript/Utils/5.color.ts
function hslToRgb(h, s, l, alpha = 1) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const _a = s * Math.min(l, 1 - l);
  const f = (n) => l - _a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const r = Math.max(0, Math.min(255, Math.round(f(0) * 255)));
  const g = Math.max(0, Math.min(255, Math.round(f(8) * 255)));
  const b = Math.max(0, Math.min(255, Math.round(f(4) * 255)));
  const a = Math.max(0, Math.min(1, alpha));
  return {
    r,
    g,
    b,
    alpha: a,
    converted: a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`
  };
}
function rgbToHsl(r, g, b, alpha = 1) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s;
  let l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        h = 0;
        break;
    }
    h /= 6;
  }
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  const a = Math.max(0, Math.min(1, alpha));
  return {
    h,
    s,
    l,
    alpha: a,
    converted: a === 1 ? `hsl(${h} ${s}% ${l}%)` : `hsl(${h} ${s}% ${l}% / ${a})`
  };
}
function labToRgb(L, a, b, alpha = 1) {
  const D65_Xn = 95.047;
  const D65_Yn = 100;
  const D65_Zn = 108.883;
  const f_y = (L + 16) / 116;
  const f_x = a / 500 + f_y;
  const f_z = f_y - b / 200;
  const inverse_f = (t) => t ** 3 > 8856e-6 ? t ** 3 : (t - 16 / 116) / 7.787;
  const X = inverse_f(f_x) * D65_Xn;
  const Y = inverse_f(f_y) * D65_Yn;
  const Z = inverse_f(f_z) * D65_Zn;
  const X_norm = X / 100;
  const Y_norm = Y / 100;
  const Z_norm = Z / 100;
  const r_linear = X_norm * 3.2406 + Y_norm * -1.5372 + Z_norm * -0.4986;
  const g_linear = X_norm * -0.9689 + Y_norm * 1.8758 + Z_norm * 0.0415;
  const b_linear = X_norm * 0.0557 + Y_norm * -0.204 + Z_norm * 1.057;
  const gammaCorrectAndClamp = (v) => {
    v = v <= 31308e-7 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
    return Math.max(0, Math.min(255, Math.round(v * 255)));
  };
  const r = gammaCorrectAndClamp(r_linear);
  const g = gammaCorrectAndClamp(g_linear);
  const b_ = gammaCorrectAndClamp(b_linear);
  const a_ = Math.max(0, Math.min(1, alpha));
  return {
    r,
    g,
    b: b_,
    alpha: a_,
    converted: a_ === 1 ? `rgb(${r}, ${g}, ${b_})` : `rgba(${r}, ${g}, ${b_}, ${a_})`
  };
}
function rgbToLab(r, g, b, alpha = 1) {
  r /= 255;
  g /= 255;
  b /= 255;
  const gammaCorrected = (v) => {
    return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
  };
  r = gammaCorrected(r);
  g = gammaCorrected(g);
  b = gammaCorrected(b);
  const X = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const Y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1;
  const Z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const f = (v) => v > 8856e-6 ? Math.cbrt(v) : 7.787 * v + 16 / 116;
  const fX = f(X);
  const fY = f(Y);
  const fZ = f(Z);
  const L = 116 * fY - 16;
  const a_comp = 500 * (fX - fY);
  const b_comp = 200 * (fY - fZ);
  const a_ = Math.max(0, Math.min(1, alpha));
  return {
    L: parseFloat(L.toFixed(1)),
    a: parseFloat(a_comp.toFixed(1)),
    b: parseFloat(b_comp.toFixed(1)),
    alpha: a_,
    converted: a_ === 1 ? `lab(${parseFloat(L.toFixed(1))} ${parseFloat(a_comp.toFixed(1))} ${parseFloat(b_comp.toFixed(1))})` : `lab(${parseFloat(L.toFixed(1))} ${parseFloat(a_comp.toFixed(1))} ${parseFloat(b_comp.toFixed(1))} / ${a_})`
  };
}
function lchToRgb(L, C, H, alpha = 1) {
  const hRad = H * Math.PI / 180;
  const _a = C * Math.cos(hRad);
  const _b = C * Math.sin(hRad);
  const rgb = labToRgb(L, _a, _b, alpha);
  const a_ = Math.max(0, Math.min(1, alpha));
  return {
    r: rgb.r,
    g: rgb.g,
    b: rgb.b,
    alpha: a_,
    converted: a_ === 1 ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a_})`
  };
}
function rgbToLch(r, g, b, alpha = 1) {
  const lab = rgbToLab(r, g, b, alpha);
  const L = lab.L;
  const _a = lab.a;
  const b_comp = lab.b;
  const C = Math.sqrt(_a * _a + b_comp * b_comp);
  let H = (Math.atan2(b_comp, _a) * 180 / Math.PI + 360) % 360;
  if (C < 1e-6) {
    H = 0;
  }
  const a_ = Math.max(0, Math.min(1, alpha));
  return {
    L: parseFloat(L.toFixed(1)),
    C: parseFloat(C.toFixed(1)),
    H: parseFloat(H.toFixed(1)),
    alpha: a_,
    converted: a_ === 1 ? `lch(${parseFloat(L.toFixed(1))} ${parseFloat(C.toFixed(1))} ${parseFloat(H.toFixed(1))})` : `lch(${parseFloat(L.toFixed(1))} ${parseFloat(C.toFixed(1))} ${parseFloat(H.toFixed(1))} / ${a_})`
  };
}
function hwbToRgb(h, w, bl, alpha = 1) {
  h = h % 360;
  w /= 100;
  bl /= 100;
  const baseRgb = hslToRgb(h, 100, 50);
  const red = baseRgb.r;
  const green = baseRgb.g;
  const blue = baseRgb.b;
  const r_final = red * (1 - w - bl) + w * 255;
  const g_final = green * (1 - w - bl) + w * 255;
  const b_final = blue * (1 - w - bl) + w * 255;
  const a_ = Math.max(0, Math.min(1, alpha));
  const r = Math.max(0, Math.min(255, Math.round(r_final)));
  const g = Math.max(0, Math.min(255, Math.round(g_final)));
  const b = Math.max(0, Math.min(255, Math.round(b_final)));
  return {
    r,
    g,
    b,
    alpha: a_,
    converted: a_ === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a_})`
  };
}
function rgbToHwb(r, g, b, alpha = 1) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  if (max === min) {
    h = 0;
  } else if (max === r) {
    h = (60 * ((g - b) / (max - min)) + 360) % 360;
  } else if (max === g) {
    h = (60 * ((b - r) / (max - min)) + 120) % 360;
  } else if (max === b) {
    h = (60 * ((r - g) / (max - min)) + 240) % 360;
  }
  const w = min * 100;
  const bl = (1 - max) * 100;
  const a_ = Math.max(0, Math.min(1, alpha));
  return {
    h: parseFloat(h.toFixed(1)),
    w: parseFloat(w.toFixed(1)),
    b: parseFloat(bl.toFixed(1)),
    alpha: a_,
    converted: a_ === 1 ? `hwb(${parseFloat(h.toFixed(1))} ${parseFloat(w.toFixed(1))}% ${parseFloat(bl.toFixed(1))}%)` : `hwb(${parseFloat(h.toFixed(1))} ${parseFloat(w.toFixed(1))}% ${parseFloat(bl.toFixed(1))}% / ${a_})`
  };
}
function rgbToHex(r, g, b, alpha = 1) {
  const toHex = (c) => {
    const hex = Math.round(c).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  const aVal = Math.max(0, Math.min(1, alpha));
  const alphaHex = Math.round(aVal * 255);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${alphaHex !== 255 ? toHex(alphaHex) : ""}`;
}
function oklabToRgb(L, a, b, alpha = 1) {
  const l_prime = L + a * 0.3963377774 + b * 0.2158037573;
  const m_prime = L - a * 0.1055613458 - b * 0.0638541728;
  const s_prime = L - a * 0.0894841775 - b * 1.291485548;
  const l_linear = l_prime * l_prime * l_prime;
  const m_linear = m_prime * m_prime * m_prime;
  const s_linear = s_prime * s_prime * s_prime;
  const r_linear = 4.0767416621 * l_linear - 3.3077115913 * m_linear + 0.2309699292 * s_linear;
  const g_linear = -1.2684380046 * l_linear + 2.6097574011 * m_linear - 0.3413193965 * s_linear;
  const b_linear = -0.0041960863 * l_linear - 0.7034186147 * m_linear + 1.707614701 * s_linear;
  const srgbOetf = (val) => {
    val = Math.max(0, Math.min(1, val));
    return val <= 31308e-7 ? 12.92 * val : 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
  };
  const r = Math.max(0, Math.min(255, Math.round(srgbOetf(r_linear) * 255)));
  const g = Math.max(0, Math.min(255, Math.round(srgbOetf(g_linear) * 255)));
  const b_ = Math.max(0, Math.min(255, Math.round(srgbOetf(b_linear) * 255)));
  const a_ = Math.max(0, Math.min(1, alpha));
  return {
    r,
    g,
    b: b_,
    alpha: a_,
    converted: a_ === 1 ? `rgb(${r}, ${g}, ${b_})` : `rgba(${r}, ${g}, ${b_}, ${a_})`
  };
}
function rgbToOklab(r, g, b, alpha = 1) {
  const srgbInverseOetf = (val) => {
    val = val / 255;
    return val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  };
  const r_linear = srgbInverseOetf(r);
  const g_linear = srgbInverseOetf(g);
  const b_linear = srgbInverseOetf(b);
  const l = 0.4122214708 * r_linear + 0.5363325363 * g_linear + 0.0514459929 * b_linear;
  const m = 0.2119034982 * r_linear + 0.6806995451 * g_linear + 0.1073969566 * b_linear;
  const s = 0.0883024619 * r_linear + 0.2817188376 * g_linear + 0.6299787005 * b_linear;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a_ = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const alpha_ = Math.max(0, Math.min(1, alpha));
  return {
    L: parseFloat(L.toFixed(6)),
    a: parseFloat(a_.toFixed(6)),
    b: parseFloat(b_.toFixed(6)),
    alpha: alpha_,
    converted: alpha_ === 1 ? `oklab(${parseFloat(L.toFixed(6))} ${parseFloat(a_.toFixed(6))} ${parseFloat(b_.toFixed(6))})` : `oklab(${parseFloat(L.toFixed(6))} ${parseFloat(a_.toFixed(6))} ${parseFloat(b_.toFixed(6))} / ${alpha_})`
  };
}
function oklchToRgb(L, C, H, alpha = 1) {
  const hRad = H * Math.PI / 180;
  const _a = C * Math.cos(hRad);
  const _b = C * Math.sin(hRad);
  const rgb = oklabToRgb(L, _a, _b, alpha);
  const a = Math.max(0, Math.min(1, alpha));
  return {
    r: rgb.r,
    g: rgb.g,
    b: rgb.b,
    alpha: a,
    converted: a === 1 ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`
  };
}
function rgbToOklch(r, g, b, alpha = 1) {
  const oklab = rgbToOklab(r, g, b, alpha);
  const L = oklab.L;
  const _a = oklab.a;
  const _b = oklab.b;
  const C = Math.sqrt(_a * _a + _b * _b);
  let H = (Math.atan2(_b, _a) * 180 / Math.PI + 360) % 360;
  if (C < 1e-6) {
    H = 0;
  }
  const a = Math.max(0, Math.min(1, alpha));
  return {
    L: parseFloat(L.toFixed(3)),
    C: parseFloat(C.toFixed(3)),
    H: parseFloat(H.toFixed(1)),
    alpha: a,
    converted: a === 1 ? `oklch(${parseFloat(L.toFixed(3))} ${parseFloat(C.toFixed(3))} ${parseFloat(H.toFixed(1))})` : `oklch(${parseFloat(L.toFixed(3))} ${parseFloat(C.toFixed(3))} ${parseFloat(H.toFixed(1))} / ${a})`
  };
}
var SwitchRGB = {
  from: {
    lch: lchToRgb,
    lab: labToRgb,
    hwb: hwbToRgb,
    hsl: hslToRgb,
    oklch: oklchToRgb,
    oklab: oklabToRgb
  },
  to: {
    lch: rgbToLch,
    lab: rgbToLab,
    hwb: rgbToHwb,
    hsl: rgbToHsl,
    oklch: rgbToOklch,
    oklab: rgbToOklab
  },
  LoadHex: rgbToHex
};
var color_default = SwitchRGB;

// typescript/Utils/6.cursor.ts
function Initialize(content) {
  const fileScanner = {
    content,
    active: {
      char: "",
      marker: 0,
      rowMarker: 0,
      colMarker: 0,
      tagCount: 0,
      colFallback: 0
    },
    fallback: {
      char: "",
      marker: 0,
      rowMarker: 0,
      colMarker: 0,
      tagCount: 0,
      colFallback: 0
    }
  };
  fileScanner.active.char = content[fileScanner.active.marker];
  if (fileScanner.active.char === "\n") {
    fileScanner.active.rowMarker++;
    fileScanner.active.colMarker = 0;
  } else {
    fileScanner.active.colMarker++;
  }
  return fileScanner;
}
function Incremnet(fileScanner) {
  fileScanner.active.char = fileScanner.content[++fileScanner.active.marker];
  if (fileScanner.active.char === "\n") {
    fileScanner.active.rowMarker++;
    fileScanner.active.colFallback = fileScanner.active.colMarker;
    fileScanner.active.colMarker = 0;
  } else {
    fileScanner.active.colMarker++;
  }
  return fileScanner.active.char;
}
function Decrement(fileScanner) {
  fileScanner.active.char = fileScanner.content[--fileScanner.active.marker];
  if (fileScanner.active.char === "\n") {
    fileScanner.active.rowMarker--;
    fileScanner.active.colMarker = fileScanner.active.colFallback;
  } else {
    fileScanner.active.colMarker--;
  }
  return fileScanner.active.char;
}
var cursor_default = {
  Initialize,
  Decrement,
  Incremnet
};

// typescript/Utils/main.ts
var main_default2 = {
  string: string_default,
  object: object_default,
  array: array_default,
  code: code_default,
  color: color_default,
  cursor: cursor_default
};

// typescript/Data/cache.ts
var domain = "xcss.io";
var APP = {
  name: "",
  version: "",
  website: "",
  bins: [],
  vendors: [],
  URL: {
    Cdn: `https://cdn.${domain}/`,
    Worker: `https://worker.${domain}/`,
    Console: `https://console.${domain}/`,
    PrefixCdn: `https://prefix.${domain}/`,
    PackageCdn: `https://package.${domain}/`
  },
  commandList: {
    init: "Initiate or Update & Verify setup.",
    watch: "Live build for developer environment",
    preview: 'Test build. Pass test for "publish" command.',
    publish: "Optimized build, uses web-api."
  },
  defaultTweaks: {
    OpenXtyles: true,
    RapidSense: true,
    Shorthands: true,
    WatchDebug: true,
    ForceLocal: false,
    IntelGroup: "browser"
  },
  customTag: {
    style: "xtyle",
    attach: "xtaple",
    stencil: "xtencil"
  }
};
var SYNC = {
  DOCS: {
    readme: {
      title: "README",
      url: "readme.md",
      path: "",
      content: "",
      frags: ["readme.md"]
    },
    alerts: {
      title: "ALERTS",
      url: "alerts.md",
      path: "",
      content: "",
      frags: ["alerts.md"]
    },
    changelog: {
      title: "CHANGELOG",
      url: "changelog.md",
      path: "",
      content: "",
      frags: ["changelog.md"]
    }
  },
  AGREEMENT: {
    license: {
      title: "LICENSE",
      url: "agreements-txt/license.txt",
      path: "",
      content: "",
      frags: ["agreements", "license.txt"]
    },
    terms: {
      title: "TERMS & CONDITIONS",
      url: "agreements-txt/terms.txt",
      path: "",
      content: "",
      frags: ["agreements", "terms.txt"]
    },
    privacy: {
      title: "PRIVACY POLICY",
      url: "agreements-txt/privacy.txt",
      path: "agreements/privacy.txt",
      frags: ["agreements", "privacy.txt"],
      content: ""
    }
  }
};
var NAV = {
  blueprint: {
    scaffold: {
      frags: ["blueprint", "scaffold"],
      path: "",
      content: ""
    },
    libraries: {
      frags: ["blueprint", "libraries"],
      path: "",
      content: ""
    },
    prefixes: {
      frags: ["blueprint", "prefixes.json"],
      path: "",
      content: ""
    }
  },
  folder: {
    setup: {
      frags: ["xtyles"],
      path: "",
      content: ""
    },
    autogen: {
      frags: ["xtyles", "autogen"],
      path: "",
      content: ""
    },
    library: {
      frags: ["xtyles", "library"],
      path: "",
      content: ""
    },
    packages: {
      frags: ["xtyles", "packages"],
      path: "",
      content: ""
    },
    archives: {
      frags: ["xtyles", "autogen", "archives"],
      path: "",
      content: ""
    }
  },
  css: {
    atrules: {
      frags: ["xtyles", "#at-rules.css"],
      path: "",
      content: ""
    },
    constants: {
      frags: ["xtyles", "#constants.css"],
      path: "",
      content: ""
    },
    elements: {
      frags: ["xtyles", "#elements.css"],
      path: "",
      content: ""
    },
    extends: {
      frags: ["xtyles", "#extends.css"],
      path: "",
      content: ""
    }
  },
  json: {
    configure: {
      frags: ["xtyles", "configure.jsonc"],
      path: "",
      content: ""
    },
    hashrules: {
      frags: ["xtyles", "/hashrules.jsonc"],
      path: "",
      content: ""
    }
  },
  md: {
    instructions: {
      frags: ["xtyles", "instructions.md"],
      path: "",
      content: ""
    },
    readme: {
      frags: ["xtyles", "readme.md"],
      path: "",
      content: ""
    }
  },
  autogen: {
    index: {
      path: "",
      frags: ["xtyles", "autogen", "watch", "index.css"],
      content: ""
    },
    styles: {
      path: "",
      frags: ["xtyles", "autogen", "watch", "styles.css"],
      content: ""
    },
    ignore: {
      path: "",
      frags: ["xtyles", "autogen", ".gitignore"],
      content: `watch/**
manifest.json`
    },
    manifest: {
      path: "",
      frags: ["xtyles", "autogen", "manifest.json"],
      content: `{}`
    }
  }
};
var PREFIX = {
  atrules: {},
  attributes: {},
  pseudos: {},
  classes: {},
  elements: {},
  values: {}
};
var TWEAKS = {
  ...APP.defaultTweaks
};
var PUBLISH = {
  DeltaPath: "",
  DeltaContent: "",
  FinalMessage: "",
  FinalError: "",
  ErrorCount: 0,
  WarningCount: 0,
  Report: {
    library: "",
    variables: "",
    hashrule: "",
    targets: "",
    errors: "",
    memChart: "",
    footer: ""
  },
  MANIFEST: {
    prefix: "",
    elements: Object.values(APP.customTag),
    constants: [],
    hashrules: {},
    file: {},
    axiom: {},
    cluster: {},
    local: {},
    global: {},
    xtyling: {},
    binding: {}
  },
  LibFilesTemp: {}
};
var STACK = {
  PROXYCACHE: {},
  LIBRARIES: {},
  PORTABLES: {}
};
var CACHE = {
  HashRule: {},
  SortedIndexes: [],
  PortableEssentials: [],
  Index2StylesObject: {},
  NativeStyle2Index: {},
  LibraryStyle2Index: {},
  GlobalsStyle2Index: {},
  PortableStyle2Index: {},
  FinalStack: {},
  Archive: {
    name: "",
    version: ""
  }
};
var RAW = {
  WATCH: false,
  PACKAGE: "",
  VERSION: "",
  COMMAND: "",
  ARGUMENT: "",
  ReadMe: "",
  CSSIndex: "",
  RootPath: "",
  WorkPath: "",
  PROXYMAP: [],
  HASHRULE: {},
  LIBRARIES: {},
  PORTABLES: {},
  PROXYFILES: {},
  DEPENDENTS: {}
};

// typescript/Data/init.ts
function collectTypeStringKeys(object) {
  return Object.entries(object).reduce((A, [K, V]) => {
    if (typeof V === "object") {
      collectTypeStringKeys(V).forEach((k) => A.add(k));
    } else {
      A.add(K);
    }
    return A;
  }, /* @__PURE__ */ new Set());
}
function collectVendors() {
  APP.vendors = Array.from(collectTypeStringKeys(PREFIX));
}
function collectTWEAKS(tweaks) {
  Object.assign(TWEAKS, APP.defaultTweaks);
  if (typeof tweaks === "object") {
    Object.keys(TWEAKS).forEach((key) => {
      if (typeof TWEAKS[key] === typeof tweaks[key]) {
        TWEAKS[key] = tweaks[key];
      }
    });
  }
  ;
}
function SetENV(rootPath, workPath, packageEssential) {
  APP.name = packageEssential.name;
  APP.version = packageEssential.version;
  APP.website = packageEssential.website;
  APP.bins = packageEssential.bins;
  RAW.RootPath = rootPath;
  RAW.WorkPath = workPath;
  Object.entries(NAV).forEach(([groupName, groupPaths]) => {
    if (groupName === "blueprint" || groupName === "autogen") {
      Object.values(groupPaths).forEach((source) => {
        source.path = fileman_default.path.join(RAW.RootPath, ...source.frags);
      });
    } else {
      Object.values(groupPaths).forEach((source) => {
        source.path = fileman_default.path.join(RAW.WorkPath, ...source.frags);
      });
    }
  });
  const CDN = APP.URL.Cdn + "version/" + APP.version.split(".")[0] + "/";
  Object.values(SYNC).forEach((object) => {
    Object.values(object).forEach((entry) => {
      entry.url = CDN + entry.url;
      entry.path = fileman_default.path.join(RAW.RootPath, ...entry.frags);
    });
  });
}
function MemoryUsage() {
  const chart = {
    "Files": main_default2.string.stringMem(JSON.stringify(RAW)),
    "Cache": main_default2.string.stringMem(JSON.stringify(CACHE)),
    "Stack": main_default2.string.stringMem(JSON.stringify(STACK)),
    "Report": main_default2.string.stringMem(JSON.stringify(PUBLISH)),
    "Proxy": Object.values(STACK.PROXYCACHE).reduce((t, c) => {
      t += main_default2.string.stringMem(JSON.stringify(c));
      return t;
    }, 0)
  };
  chart["Total"] = Object.values(chart).reduce((a, i) => a += i, 0);
  return Object.entries(chart).map(([k, v]) => `${k} : ${v.toFixed(2)} Kb`);
}
var INDEX = {
  _NOW: 0,
  _BIN: /* @__PURE__ */ new Set(),
  IMPORT: (index = 0) => {
    return CACHE.Index2StylesObject[index];
  },
  DECLARE: (object) => {
    object.index = INDEX._BIN.values().next().value || ++INDEX._NOW;
    if (INDEX._BIN.has(object.index)) {
      INDEX._BIN.delete(object.index);
    }
    const encounted = main_default2.string.enCounter(object.index + 768);
    object.miniClass = "_" + encounted;
    CACHE.Index2StylesObject[object.index] = object;
    return { index: object.index, class: object.miniClass };
  },
  DISPOSE: (...indexes) => {
    indexes.forEach((index) => {
      if (index > 0) {
        INDEX._BIN.add(index);
        delete CACHE.Index2StylesObject[index.toString()];
      }
    });
  },
  RESET: (after = 0) => {
    after = after > 0 ? after : 0;
    let removed = 0;
    Object.keys(CACHE.Index2StylesObject).forEach((index) => {
      const number = Number(index);
      if (number > after) {
        if (INDEX._BIN.has(number)) {
          INDEX._BIN.delete(number);
        }
        delete CACHE.Index2StylesObject[number];
        removed++;
      }
    });
    INDEX._NOW = after;
    return removed;
  }
};

// typescript/Data/watch.ts
var import_path2 = __toESM(require("path"), 1);
var import_chokidar = __toESM(require_chokidar(), 1);
async function cssImport(filePathArray = []) {
  const processedFiles = new Set(
    filePathArray.reverse().map((filePath) => import_path2.default.resolve(filePath)).reverse()
  );
  async function process2(pathString) {
    const directory = import_path2.default.dirname(pathString);
    let result2 = (await fileman_default.read.file(pathString)).data;
    for (const [match, filePath] of result2.matchAll(
      /@import\s+url\(["']?(.*?)["']?\);/g
    )) {
      const resolvedPath = import_path2.default.resolve(directory, filePath);
      result2 = result2.replace(
        match,
        !processedFiles.has(resolvedPath) ? await process2(resolvedPath) : ""
      );
    }
    return result2;
  }
  const result = await Promise.all(
    Array.from(processedFiles).map(async (file) => await process2(file))
  );
  return result.join("");
}
async function proxyMapDependency(proxyMap = [], xtylesDirectory) {
  const warnings2 = [];
  const notifications = [];
  await Promise.all(
    proxyMap.map(async (map, index) => {
      if (!fileman_default.path.isIndependent(map.source, map.target)) {
        warnings2.push(
          `[${index}]:source::"${map.source}" & [${index}]:target::"${map.target}" are not independent.`
        );
      }
      if (!fileman_default.path.isIndependent(map.source, xtylesDirectory)) {
        warnings2.push(
          `[${index}]:source::"${map.source}" should not dependent on "${xtylesDirectory}".`
        );
      }
      if (!fileman_default.path.isIndependent(xtylesDirectory, map.target)) {
        warnings2.push(
          `[${index}]:target::"${map.target}" should not be dependent on "${xtylesDirectory}".`
        );
      }
      if (fileman_default.path.ifFolder(map.source)) {
        const targetStat = fileman_default.path.available(map.target);
        if (targetStat.type === "file") {
          warnings2.push(
            `[${index}]:"${map.target}" expected folder instead of file.`
          );
        } else {
          if (!targetStat.exist) {
            await fileman_default.clone.safe(map.source, map.target);
            notifications.push(
              `[${index}]:"${map.target}" cloned from [${index}]:"${map.source}"`
            );
          }
          const sourceStylesheetExists = fileman_default.path.ifFile(
            fileman_default.path.join(map.source, map.stylesheet)
          );
          const targetStylesheetExists = fileman_default.path.ifFile(
            fileman_default.path.join(map.target, map.stylesheet)
          );
          if (!sourceStylesheetExists) {
            warnings2.push(
              `[${index}]:stylesheet::"${map.stylesheet}" file not found in "${map.source}" folder.`
            );
          }
          if (!targetStylesheetExists) {
            warnings2.push(
              `[${index}]:stylesheet::"${map.stylesheet}" file not found in "${map.target}" folder.`
            );
          }
        }
      } else {
        warnings2.push(`[${index}]:"${map.source}" folder not found.`);
      }
    })
  );
  for (let i = 0; i < proxyMap.length; i++) {
    for (let j = i + 1; j < proxyMap.length; j++) {
      if (fileman_default.path.isIndependent(proxyMap[i].target, proxyMap[j].source) || fileman_default.path.isIndependent(proxyMap[j].source, proxyMap[i].target)) {
        warnings2.push(
          `[${i}]:target::"${proxyMap[i].target}" & [${j}]:source::"${proxyMap[j].source}" are not independent.`
        );
      }
      if (fileman_default.path.isIndependent(proxyMap[i].source, proxyMap[j].target) || fileman_default.path.isIndependent(proxyMap[j].target, proxyMap[i].source)) {
        warnings2.push(
          `[${i}]:source::"${proxyMap[i].source}" & [${j}]:target::"${proxyMap[j].target}" are not independent.`
        );
      }
    }
  }
  return { warnings: warnings2, notifications };
}
async function proxyMapSync(proxyMap = []) {
  await Promise.all(
    proxyMap.map(async (map) => {
      map.extensions.xcss = [];
      const syncResult = await fileman_default.sync.bulk(
        map.target,
        map.source,
        Object.keys(map.extensions),
        ["xcss"],
        [map.stylesheet]
      );
      if (syncResult.status) {
        map.fileContents = syncResult.fileContents;
        map.stylesheetContent = (await fileman_default.read.file(fileman_default.path.join(map.target, map.stylesheet))).data;
      }
    })
  );
}
var EventQueue = /* @__PURE__ */ (() => {
  let queue = [];
  function addEvent(event) {
    queue.push(event);
  }
  function hasEvents() {
    return queue.length > 0;
  }
  function clear() {
    queue = [];
  }
  function dequeue() {
    return queue.length > 0 ? queue.shift() : null;
  }
  return {
    addEvent,
    hasEvents,
    clear,
    dequeue
  };
})();
function watchFolders(folders = [], ignores = []) {
  const folderMaps = folders.reduce((acc, folder) => {
    acc[import_path2.default.resolve(folder)] = folder;
    return acc;
  }, { "": "" });
  const resolvedFolders = Object.keys(folderMaps);
  const resolvedIgnores = ignores.map((p) => import_path2.default.join(import_path2.default.resolve(p), "**"));
  const handleEventInternal = async (action, filePath) => {
    const event = {
      timeStamp: "",
      action: "",
      folder: "",
      filePath: "",
      fileContent: "",
      extension: import_path2.default.extname(filePath)?.slice(1)
    };
    const t = /* @__PURE__ */ new Date();
    event.timeStamp = t.getHours().toString().padStart(2, "0") + `:` + t.getMinutes().toString().padStart(2, "0") + `:` + t.getSeconds().toString().padStart(2, "0");
    event.action = action;
    event.folder = folderMaps[resolvedFolders.find((folder) => filePath.startsWith(folder)) || ""];
    event.filePath = import_path2.default.relative(event.folder, filePath);
    if (action === "add" || action === "change") {
      const content = await fileman_default.read.file(filePath);
      if (content.status) {
        event.fileContent = content.data;
      }
    }
    EventQueue.addEvent(event);
  };
  const watcher = import_chokidar.default.watch(resolvedFolders, {
    persistent: true,
    ignoreInitial: true,
    alwaysStat: true,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 100
    },
    ignored: [/(^|[/\\])\../, "**/node_modules/**", ...resolvedIgnores],
    usePolling: true,
    interval: 100,
    binaryInterval: 300
  });
  watcher.on("all", (event, filePath) => handleEventInternal(event, filePath)).on("error", (error) => {
    if (error instanceof Error) {
      console.error(`Watcher error: ${error.message}`);
    }
  });
  return () => {
    watcher.close();
  };
}

// typescript/Data/fetch.ts
async function FetchDocs() {
  await Promise.all(Object.values(SYNC).map((sync) => {
    Object.values(sync).map(async (s) => {
      if (s.url && s.path) {
        s.content = await fileman_default.sync.file(s.url, s.path);
      }
    });
  }));
}
async function FetchStatics(vendorSource) {
  main_default.TASK("Saving guidelines.", 0);
  RAW.ReadMe = (await fileman_default.read.file(NAV.md.instructions.path)).data;
  const manifestIgnores = (await fileman_default.read.file(NAV.autogen.ignore.path)).data.split("\n");
  const modPts = (NAV.autogen.ignore.content || "").split("\n").reduce((modPts2, ign) => {
    if (!manifestIgnores.includes(ign)) {
      manifestIgnores.push(ign);
      modPts2++;
    }
    return modPts2;
  }, 0);
  if (modPts) {
    await fileman_default.write.file(NAV.autogen.ignore.path, manifestIgnores.join("\n"));
  }
  main_default.TASK("Loading vendor-prefixes");
  const PrefixObtained = await async function() {
    const result1 = await fileman_default.read.json(vendorSource, true);
    if (result1.status) {
      return result1.data;
    }
    ;
    const result2 = await fileman_default.read.json(APP.URL.PrefixCdn + vendorSource, true);
    if (result2.status) {
      return result2.data;
    }
    ;
    const result3 = await fileman_default.read.json(NAV.blueprint.prefixes.path, false);
    if (result3.status) {
      return result3.data;
    }
    ;
    return {};
  }();
  await fileman_default.write.json(NAV.blueprint.vendors.path, PrefixObtained);
  const PrefixRead = {
    attributes: {},
    pseudos: {},
    values: {},
    atrules: {},
    classes: {},
    elements: {}
  };
  for (const key in PrefixRead) {
    const typedKey = key;
    const valueFromObtained = PrefixObtained[typedKey];
    if (typedKey === "values") {
      PrefixRead[typedKey] = valueFromObtained;
    } else {
      PrefixRead[typedKey] = valueFromObtained;
    }
  }
  PREFIX.pseudos = { ...PrefixRead.classes, ...PrefixRead.elements, ...PrefixRead.pseudos };
  PREFIX.attributes = { ...PrefixRead.attributes };
  PREFIX.atrules = { ...PrefixRead.atrules };
  PREFIX.values = { ...PrefixRead.values };
  collectVendors();
}
async function Initialize2() {
  try {
    main_default.TASK("Initializing XCSS setup.", 0);
    main_default.TASK("Cloning scaffold to Project");
    main_default.POST(
      main_default.MOLD.std.Section(
        "Next Steps",
        [
          "Adjust " + main_default.MAKE(NAV.json.configure.path, main_default.style.TS_Bold, ...main_default.canvas.config.primary) + " according to the requirements of your project.",
          "Execute " + main_default.MAKE('"init"', main_default.style.TS_Bold, ...main_default.canvas.config.primary) + " again to generate the necessary configuration folders.",
          "During execution " + main_default.MAKE("{target}", main_default.style.TS_Bold, ...main_default.canvas.config.primary) + " folder will be cloned from " + main_default.MAKE("{source}", main_default.style.TS_Bold, ...main_default.canvas.config.primary) + " folder.",
          "This folder will act as proxy for " + APP.name + ".",
          "In the " + main_default.MAKE("{target}/{stylesheet}", main_default.style.TS_Bold, ...main_default.canvas.config.primary) + ", content from " + main_default.MAKE("{target}/{stylesheet}", main_default.style.TS_Bold, ...main_default.canvas.config.primary) + " will be appended."
        ],
        main_default.list.std.Bullets
      )
    );
    main_default.POST(
      main_default.MOLD.std.Section(
        "Available Commands",
        Props.primary(APP.commandList),
        main_default.list.std.Bullets
      )
    );
    main_default.POST(
      main_default.MOLD.std.Section(
        "Publish command instructions.",
        APP.version === "0" ? ["This command uses an internet connection."] : [
          "Create a new project and use its access key. For action visit " + main_default.MAKE(APP.URL.Console, main_default.style.TS_Bold, ...main_default.canvas.config.primary),
          "For personal projects, you can use the key in " + main_default.MAKE(NAV.json.configure.path, main_default.style.TS_Bold, ...main_default.canvas.config.primary),
          "If using in CI/CD workflow, it is suggested to use " + main_default.MAKE("xcss publish {key}", main_default.style.TS_Bold, ...main_default.canvas.config.primary)
        ],
        main_default.list.std.Bullets
      )
    );
    return main_default.MOLD.success.Footer("Initialized directory");
  } catch (err) {
    return main_default.MOLD.failed.Footer(
      "Initialization failed.",
      err instanceof Error ? [err.message] : [],
      main_default.list.failed.Bullets
    );
  }
}
async function VerifySetupStruct() {
  const result = { unstart: true, proceed: false, report: "" };
  if (fileman_default.path.ifFolder(NAV.folder.setup.path)) {
    const errors = {};
    await fileman_default.clone.safe(NAV.blueprint.scaffold.path, NAV.folder.setup.path);
    main_default.TASK("Verifying directory status", 0);
    for (const item of Object.values(NAV.css)) {
      const path3 = item.path;
      main_default.STEP("Path : " + path3);
      if (!fileman_default.path.ifFile(path3)) {
        errors[path3] = "File not found.";
      }
    }
    for (const item of Object.values(NAV.json)) {
      const path3 = item.path;
      main_default.STEP("Path : " + path3);
      if (!fileman_default.path.ifFile(path3)) {
        errors[path3] = "File not found.";
      }
    }
    main_default.TASK("Verification finished");
    const errSrcs = main_default.list.failed.Level(Object.keys(errors));
    const errList = Object.values(errors).map((err, ind) => `${errSrcs[ind]}: ${err}`);
    result.unstart = false;
    result.proceed = errSrcs.length === 0;
    result.report = Object.keys(errors).length === 0 ? main_default.MOLD.success.Footer("Setup Healthy") : main_default.MOLD.failed.Footer("Error Paths", errList, main_default.list.failed.Bullets);
  } else {
    result.report = main_default.MOLD.warning.Footer(
      "XCSS is not yet initialized in directory.",
      [`Use "init" command to initialize.`],
      main_default.list.warning.Bullets
    );
  }
  return result;
}
async function VerifyConfigure(loadStatics) {
  main_default.TASK("Initializing configs", 0);
  const errors = [], alerts = [];
  main_default.STEP("PATH : " + NAV.json.configure);
  const config = await fileman_default.read.json(NAV.json.configure.path);
  if (config.status) {
    const data = config.data;
    if (loadStatics) {
      FetchStatics(data["vendors"]);
    }
    collectTWEAKS(data.tweaks);
    RAW.PROXYMAP = Array.isArray(data.proxy) ? data.proxy : [];
    Object.assign(CACHE.Archive, config.data);
    delete CACHE.Archive.proxy;
    delete CACHE.Archive.portables;
    delete CACHE.Archive.vendors;
    delete CACHE.Archive.tweaks;
    CACHE.Archive.name = RAW.PACKAGE = CACHE.Archive.name || RAW.PACKAGE || "xcss-archive";
    CACHE.Archive.version = RAW.VERSION = CACHE.Archive.version || RAW.VERSION || "0.0.0";
    RAW.DEPENDENTS = Object.entries(typeof data.portables === "object" ? data.portables : {}).reduce((a, [k, v]) => {
      if (typeof v === "string" && typeof k === "string") {
        a[k] = v;
      }
      return a;
    }, {});
    const results = await proxyMapDependency(RAW.PROXYMAP, NAV.folder.setup.path);
    errors.push(...results.warnings);
  } else {
    errors.push(`${NAV.json.configure} : Bad json file.`);
  }
  main_default.TASK("Initialization finished");
  return {
    status: Object.keys(errors).length === 0,
    report: Object.keys(errors).length === 0 ? main_default.MOLD.success.Footer("Configs Healthy", alerts, main_default.list.success.Bullets) : main_default.MOLD.failed.Footer("Error Paths", errors, main_default.list.failed.Bullets)
  };
}
async function ReloadLibrary() {
  main_default.TASK("Updating Library");
  RAW.LIBRARIES = await fileman_default.read.bulk(NAV.folder.library.path, ["css"]);
  RAW.PORTABLES = await fileman_default.read.bulk(NAV.folder.portables.path, ["css", "xcss", "md"]);
}
async function UpdateProxies() {
  main_default.TASK("Syncing proxy folders", 0);
  Object.keys(RAW.PROXYFILES).forEach((key) => delete RAW.PROXYFILES[key]);
  await proxyMapSync(RAW.PROXYMAP);
  main_default.TASK("Reading target folders");
}
async function AnalyzeHashrules() {
  main_default.TASK("Updating Hashrules", 0);
  const errors = [];
  main_default.STEP("PATH : " + NAV.json.hashrules);
  const hashrule = await fileman_default.read.json(NAV.json.hashrules.path);
  Object.keys(RAW.HASHRULE).forEach((key) => delete RAW.HASHRULE[key]);
  if (hashrule.status) {
    Object.entries(hashrule.data).forEach(([key, value]) => {
      if (typeof value === "string") {
        RAW.HASHRULE[key] = value;
      } else {
        errors.push(`Hashrule: ${key} does not have a value of type STRING.`);
      }
    });
  } else {
    errors.push(`${NAV.json.hashrules} : Bad json file.`);
  }
  main_default.TASK("Analysis comnplete");
  return {
    status: Object.keys(errors).length === 0,
    report: main_default.MOLD.failed.Footer("Error Paths", errors, main_default.list.failed.Bullets)
  };
}
async function FetchIndexContent() {
  main_default.TASK("Updating Index");
  RAW.CSSIndex = await cssImport(Object.values(NAV.css).map((N) => N.path));
}

// typescript/hash-rules.ts
var hashPattern = /#\{[a-z0-9]+\}/i;
function IMPORT(string, watchUndef = true, ErrorisWarning = false) {
  const response = {
    status: true,
    result: "",
    error: ""
  };
  let hashMatch;
  const source = string;
  const recursionPreview = {};
  const recursionSequence = [];
  const errors = {
    recursionLoop: (recursionPreview2, cause) => {
      response.status = false;
      recursionPreview2["ERROR BY"] = main_default.MAKE(cause, main_default.style.TS_Bold, main_default.style.BG_Normal_Red);
      response.error = main_default.MOLD[ErrorisWarning ? "warning" : "failed"].List(
        source + main_default.MAKE(" : Hashrule recursion loop.", ErrorisWarning ? main_default.style.FG_Normal_Yellow : main_default.style.FG_Normal_Red),
        Props.text(recursionPreview2),
        main_default.list.std.Waterfall
      );
      return response;
    },
    undefinedHash: (recursionPreview2, cause) => {
      response.status = false;
      recursionPreview2["ERROR BY"] = main_default.MAKE(cause, main_default.style.TS_Bold, main_default.style.BG_Normal_Red);
      response.error = main_default.MOLD[ErrorisWarning ? "warning" : "failed"].List(
        source + main_default.MAKE(" : Undefined hashrule.", ErrorisWarning ? main_default.style.FG_Normal_Yellow : main_default.style.FG_Normal_Red),
        Props.text(recursionPreview2),
        main_default.list.std.Waterfall
      );
      return response;
    }
  };
  while (hashMatch = hashPattern.exec(string)) {
    const hash = hashMatch[0];
    const key = hash.slice(2, -1);
    const replacement = watchUndef ? CACHE.HashRule[key] : CACHE.HashRule[key] ?? hash;
    recursionPreview["FROM " + hash] = `GETS ${replacement} FROM ${string}`;
    if (replacement === void 0) {
      return errors.undefinedHash(recursionPreview, hash);
    }
    if (recursionSequence.includes(hash)) {
      return errors.recursionLoop(recursionPreview, hash);
    }
    string = string.replace(hashPattern, replacement);
    recursionSequence.push(hash);
  }
  response.result = string;
  return response;
}
function UPLOAD() {
  const hashrule = RAW.HASHRULE;
  const hashruleErrors = [];
  CACHE.HashRule = { ...hashrule };
  Object.keys(hashrule).map((key) => {
    const hash = "#" + key;
    const response = IMPORT(hash);
    if (typeof hashrule[key] === "string") {
      if (response.status) {
        hashrule[key] = response.result;
      } else {
        delete hashrule[key];
        hashruleErrors.push(response.error);
      }
    }
  });
  CACHE.HashRule = hashrule;
  return main_default.MOLD.std.Block([
    main_default.MOLD.primary.Section("Active Hashrules"),
    main_default.MOLD.std.Block(Props.std(hashrule), main_default.list.std.Bullets),
    ...hashruleErrors.length ? [main_default.MOLD.failed.Footer("Invalid Hashrules", hashruleErrors)] : []
  ]);
}
function RENDER(string, sourcePath = "", ErrorisWarning = false) {
  const extended = IMPORT(string, true, ErrorisWarning);
  string = extended.result;
  const length = string.length;
  let rule = "", selector = "", Marker = 0, deviance = 0;
  for (let i = 0; i < length; i++) {
    const ch = string[i];
    if (")}".includes(ch)) {
      deviance--;
    }
    if (deviance) {
      rule += ch;
    } else if (ch === "$") {
      Marker = i + 1;
      break;
    } else {
      switch (ch) {
        case "{":
          rule += "";
          break;
        case "}":
          rule += "";
          break;
        case ",":
          rule += TWEAKS.shorthands ? ", " : ",";
          break;
        case "|":
          rule += TWEAKS.shorthands ? " or " : "|";
          break;
        case "&":
          rule += TWEAKS.shorthands ? " and " : "&";
          break;
        case "!":
          rule += TWEAKS.shorthands ? " not " : "!";
          break;
        case "*":
          rule += TWEAKS.shorthands ? " all " : "*";
          break;
        case "^":
          rule += TWEAKS.shorthands ? " only " : "^";
          break;
        case "@":
          rule = "@" + rule;
          rule += " ";
          break;
        default:
          rule += ch;
      }
    }
    if ("({".includes(ch)) {
      deviance++;
    }
  }
  if (Marker > 0) {
    for (let i = Marker; i < length; i++) {
      const ch = string[i];
      if (ch === "{") {
        if (i + 1 < string.length && string[i + 1] !== ":") {
          selector += " ";
        }
      } else if (ch !== "}") {
        selector += ch;
      }
    }
  }
  const finalRule = rule.trim().replace(/width\s*>=/g, "min-width:").replace(/width\s*<=/g, "max-width:").replace(/height\s*>=/g, "min-height:").replace(/height\s*<=/g, "max-height:").replace(/\s+/g, " ");
  return {
    rule: finalRule,
    subSelector: selector.trim(),
    status: extended.status,
    error: extended.error + main_default.MOLD.text.Item(sourcePath) + "\n"
  };
}
var hash_rules_default = {
  IMPORT,
  UPLOAD,
  RENDER
};

// typescript/Style/block.ts
var OPEN_CHARS = ["{", "[", "("];
var CLOSE_CHARS = ["}", "]", ")"];
var QUOTE_CHARS = ["`", "'", '"'];
function parseBlock(content, blockArrays = false) {
  content += ";";
  const length = content.length;
  let keyStart = 0, valStart = 0, deviance = 0, quote = "", key = "", isProp = true;
  const result = {
    assemble: [],
    attachment: [],
    variables: {},
    XatProps: [],
    atProps: {},
    Xproperties: [],
    properties: {},
    XatRules: [],
    atRules: {},
    Xnested: [],
    nested: {},
    Xclasses: [],
    classes: {},
    Xflats: [],
    flats: {},
    XallBlocks: [],
    allBlocks: {}
  };
  for (let index = 0; index < length; index++) {
    const ch = content[index];
    if (ch === "\\") {
      index++;
      continue;
    }
    if (QUOTE_CHARS.includes(ch)) {
      if (quote === "") {
        quote = ch;
      } else if (quote === ch) {
        quote = "";
      }
    }
    if (quote === "") {
      if (CLOSE_CHARS.includes(ch)) {
        deviance--;
      }
      if (deviance === 0) {
        switch (ch) {
          case "{":
            isProp = false;
            key = main_default2.string.minify(content.slice(keyStart, index));
            valStart = index + 1;
            break;
          case ":":
            key = main_default2.string.minify(content.slice(keyStart, index));
            valStart = index + 1;
            break;
          case "}":
          case ";": {
            const value = main_default2.string.minify(content.slice(valStart, index));
            if (isProp) {
              if (key.length > 0) {
                if (key.startsWith("--")) {
                  result.variables[key] = value;
                }
                result.properties[key] = value;
                if (blockArrays) {
                  result.Xproperties.push([key, value]);
                }
              } else if (value[0] === "@") {
                const firstSpaceIndex = value.indexOf(" ");
                const spaceIndex = firstSpaceIndex < 0 ? value.length : firstSpaceIndex;
                const directive = value.slice(0, spaceIndex);
                switch (directive) {
                  case "@--attach":
                    result.attachment.push(
                      ...main_default2.string.zeroBreaks(value.slice(spaceIndex))
                    );
                    break;
                  case "@--assemble":
                    result.assemble.push(
                      ...main_default2.string.zeroBreaks(value.slice(spaceIndex))
                    );
                    break;
                  default:
                    result.atProps[value] = "";
                    if (blockArrays) {
                      result.XatProps.push([value, ""]);
                    }
                }
              } else {
                const breaks = main_default2.string.zeroBreaks(value);
                switch (breaks[0]) {
                  case "*":
                    breaks.shift();
                    result.attachment.push(...breaks);
                    break;
                  case "+":
                    breaks.shift();
                    result.assemble.push(...breaks);
                    break;
                }
              }
            } else {
              switch (key[0]) {
                case "@":
                  result.atRules[key] = value;
                  if (blockArrays) {
                    result.XatRules.push([key, value]);
                  }
                  break;
                case "&":
                  result.nested[key] = value;
                  if (blockArrays) {
                    result.Xnested.push([key, value]);
                  }
                  break;
                case ".":
                  result.classes[key] = value;
                  if (blockArrays) {
                    result.Xclasses.push([key, value]);
                  }
                  break;
                default:
                  result.flats[key] = value;
                  if (blockArrays) {
                    result.Xflats.push([key, value]);
                  }
              }
              result.allBlocks[key] = value;
              if (blockArrays) {
                result.XallBlocks.push([key, value]);
              }
            }
            keyStart = index + 1;
            valStart = index + 1;
            key = "";
            isProp = true;
          }
        }
      }
      if (OPEN_CHARS.includes(ch)) {
        deviance++;
      }
    }
  }
  return result;
}

// typescript/Style/parse.ts
function xtylemerge(classList = []) {
  const result = {}, attachments = [];
  classList.reduce((res, className) => {
    const index = (CACHE.PortableStyle2Index[className] || 0) + (CACHE.LibraryStyle2Index[className] || 0) + (CACHE.NativeStyle2Index[className] || 0);
    if (index) {
      const found = INDEX.IMPORT(index);
      attachments.push(...found.attachments);
      res = main_default2.object.multiMerge([result, found.object], true);
    }
    return res;
  }, {});
  return { result, attachments };
}
function SCANNER(content, initial, sourceSelector, forceImportant = false) {
  const scanned = parseBlock(content);
  const variables = scanned.variables;
  const merged = xtylemerge(scanned.assemble);
  const attachments = [...merged.attachments, ...scanned.attachment.filter((attach) => attach[0] !== "/")];
  const object = main_default2.object.deepMerge(merged.result, {
    ...Object.entries(scanned.atProps).map(([propKey, propValue]) => {
      return [propKey, RAW.WATCH ? `${propValue}/* ${initial} ${sourceSelector} */` : propValue];
    }),
    ...Object.entries(scanned.properties).map(([propKey, propValue]) => {
      return [propKey, (RAW.WATCH ? `${propValue}/* ${initial} ${sourceSelector} */` : propValue) + (forceImportant ? " !important" : "")];
    })
  });
  for (const selector in scanned.allBlocks) {
    const result = SCANNER(scanned.allBlocks[selector], initial, sourceSelector + " -> " + selector);
    Object.assign(variables, result.variables);
    attachments.push(...result.attachments);
    object[selector] = result.object;
  }
  return { object, attachments, variables };
}
function CSSCANNER(content, initial = "") {
  const variables = {}, attachments = [];
  const scanned = parseBlock(content, true);
  const object = scanned.XatProps;
  scanned.XallBlocks.forEach(([key, value]) => {
    const result = SCANNER(value, initial, key);
    Object.assign(variables, result.variables);
    attachments.push(...result.attachments);
    object.push([key, result.object]);
  });
  return { object, attachments, variables };
}
function CSSLIBRARY(fileDatas = [], initial = "", forPortable = false) {
  const selectorList = [], selectors = {}, indexSkeleton = {};
  const IndexMap = forPortable ? CACHE.PortableStyle2Index : CACHE.LibraryStyle2Index;
  fileDatas.forEach((source) => {
    const { stamp, filePath, metaFront, content, group } = source;
    parseBlock(content, true).XallBlocks.forEach(([selector, OBJECT]) => {
      const declaration = source.sourcePath;
      const stampSelector = stamp + main_default2.string.normalize(selector, [], ["\\", "."]);
      const scannedStyle = SCANNER(OBJECT, initial + " : " + filePath + " ||", selector);
      const attachments = scannedStyle.attachments;
      const object = { "": scannedStyle.object };
      const index = (IndexMap[stampSelector] || 0) + (selectors[stampSelector] || 0);
      if (index) {
        const InStash = INDEX.IMPORT(index);
        InStash.declarations.push(declaration);
      } else {
        const metadata = {
          info: [],
          variables: scannedStyle.variables,
          skeleton: main_default2.object.skeleton(object),
          declarations: []
          // manifest and cross-check declarations assigned later from parse.js
        };
        const identity = INDEX.DECLARE({
          portable: forPortable ? source.fileName : "",
          scope: group,
          selector,
          object,
          metadata,
          attachments: forPortable ? attachments.map((attach) => stamp + attach) : attachments,
          metaClass: metaFront + "_" + main_default2.string.normalize(stampSelector, [], [], ["$", "/"]),
          declarations: [declaration],
          // only library declarations
          snippets: {
            Main: "",
            Style: "",
            Attach: "",
            Stencil: ""
          }
        });
        source.styleData.usedIndexes.add(identity.index);
        selectors[stampSelector] = identity.index;
        indexSkeleton[stampSelector] = metadata;
        selectorList.push(stampSelector);
      }
    });
  });
  for (const selector in selectors) {
    IndexMap[selector] = selectors[selector];
  }
  return { indexMetaCollection: indexSkeleton, selectorList };
}
function TAGSTYLE(raw, file, IndexMap = {}) {
  const object = {}, attachments = [], errors = [], essentials = [];
  const forPortable = file.group === "xtyling";
  const xcope = (forPortable ? "" : raw.scope).toUpperCase();
  const xelector = raw.selector === "" ? "" : file.stamp + raw.selector;
  const declaration = `${file.filePath}:${raw.rowIndex}:${raw.colIndex}`;
  const metaClass = `${xcope}${file.metaFront}\\:${raw.rowIndex}\\:${raw.colIndex}_${main_default2.string.normalize(raw.selector, [], [], forPortable ? ["$", "/"] : ["$"])}`;
  const variables = {};
  for (const subSelector in raw.styles) {
    const query = hash_rules_default.RENDER(subSelector, declaration, forPortable);
    if (!query.status) {
      errors.push(query.error);
    }
    const styleObj = SCANNER(raw.styles[subSelector], `${raw.scope.toUpperCase()} : ${file.filePath} ||`, `${raw.selector} => ${subSelector}`);
    attachments.push(...styleObj.attachments);
    Object.assign(variables, styleObj.variables);
    if (Object.keys(styleObj).length) {
      if (raw.selector === "") {
        if (query.rule === "") {
          if (query.subSelector !== "") {
            object[query.subSelector] = styleObj.object;
          }
        } else {
          if (query.subSelector === "") {
            object[query.rule] = styleObj.object;
          } else {
            if (!object[query.rule]) {
              object[query.rule] = {};
            }
            object[query.rule][query.subSelector] = styleObj.object;
          }
        }
      } else {
        if (!object[query.rule]) {
          object[query.rule] = {};
        }
        if (query.subSelector === "") {
          object[query.rule] = { ...object[query.rule], ...styleObj.object };
        } else {
          object[query.rule]["&" + query.subSelector] = styleObj.object;
        }
      }
    }
  }
  let isOriginal = false;
  let identity = { index: 0, class: "" };
  if (raw.selector === "") {
    essentials.push(...Object.entries(object).map(([k, v]) => [
      RAW.WATCH ? `${k} /* ${declaration} */` : k,
      v
    ]));
  } else {
    const index = (IndexMap[xelector] || 0) + (CACHE.LibraryStyle2Index[xelector] || 0) + (CACHE.GlobalsStyle2Index[xelector] || 0);
    if (index) {
      const InStash = INDEX.IMPORT(index);
      InStash.metadata.declarations.push(declaration);
      if (CACHE.LibraryStyle2Index[xelector] || 0) {
        errors.push(main_default.MOLD.failed.List("Multiple declarations: " + InStash.selector, InStash.metadata.declarations, main_default.list.text.Bullets));
      }
    } else {
      const declarations = [declaration];
      isOriginal = true;
      identity = INDEX.DECLARE({
        portable: forPortable ? file.fileName : "",
        scope: raw.scope,
        selector: raw.selector,
        object,
        metadata: {
          info: raw.comments,
          variables,
          skeleton: main_default2.object.skeleton(object),
          declarations
        },
        attachments: forPortable ? attachments.map((attach) => file.stamp + "$/" + attach) : attachments,
        metaClass,
        declarations,
        snippets: {
          Main: "",
          Style: "",
          Attach: "",
          Stencil: ""
        }
      });
      IndexMap[xelector] = identity.index;
    }
  }
  return {
    selector: xelector,
    index: identity.index,
    isOriginal,
    essentials,
    attachments,
    metadata: INDEX.IMPORT(identity.index).metadata,
    errors
  };
}
var parse_default = {
  CSSLIBRARY,
  CSSCANNER,
  TAGSTYLE
};

// typescript/Style/prefix.ts
var VENDORS = APP.vendors;

// typescript/Worker/kryptic.ts
var subtle = crypto.subtle;
var asymKeyPair = async () => {
  const keyPair = await subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    true,
    ["encrypt", "decrypt"]
  );
  const publicKey = await subtle.exportKey("spki", keyPair.publicKey);
  const privateKey = await subtle.exportKey("pkcs8", keyPair.privateKey);
  return {
    publicKey: Buffer.from(publicKey).toString("base64"),
    privateKey: Buffer.from(privateKey).toString("base64")
  };
};
var asymEncrypt = async (data, publicKey) => {
  const importedKey = await subtle.importKey(
    "spki",
    Buffer.from(publicKey, "base64"),
    {
      name: "RSA-OAEP",
      hash: "SHA-256"
    },
    false,
    ["encrypt"]
  );
  const encodedData = new TextEncoder().encode(data);
  const encrypted = await subtle.encrypt(
    {
      name: "RSA-OAEP"
    },
    importedKey,
    encodedData
  );
  return Buffer.from(encrypted).toString("base64");
};
var asymDecrypt = async (encryptedData, privateKey) => {
  const importedKey = await subtle.importKey(
    "pkcs8",
    Buffer.from(privateKey, "base64"),
    {
      name: "RSA-OAEP",
      hash: "SHA-256"
    },
    false,
    ["decrypt"]
  );
  const encryptedBuffer = Buffer.from(encryptedData, "base64");
  const decrypted = await subtle.decrypt(
    {
      name: "RSA-OAEP"
    },
    importedKey,
    encryptedBuffer
  );
  return new TextDecoder().decode(decrypted);
};
function symGencrypt(data) {
  const key = subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(data);
  const encryptedData = key.then((generatedKey) => {
    return subtle.encrypt(
      {
        name: "AES-GCM",
        iv
      },
      generatedKey,
      encodedData
    ).then((encrypted) => {
      return subtle.exportKey("raw", generatedKey).then((exportedKey) => {
        return {
          key: Buffer.from(exportedKey).toString("base64"),
          data: Buffer.from(encrypted).toString("base64"),
          iv: Buffer.from(iv).toString("base64")
        };
      });
    });
  });
  return encryptedData;
}
async function symEncrypt(data, base64Key, base64Iv) {
  const keyBuffer = Buffer.from(base64Key, "base64");
  const iv = Buffer.from(base64Iv, "base64");
  const encodedData = new TextEncoder().encode(data);
  const generatedKey = await subtle.importKey(
    "raw",
    keyBuffer,
    {
      name: "AES-GCM"
    },
    false,
    // non-extractable
    ["encrypt"]
  );
  const encrypted = await subtle.encrypt(
    {
      name: "AES-GCM",
      iv
    },
    generatedKey,
    encodedData
  );
  return {
    key: base64Key,
    // Reuse the provided base64Key
    data: Buffer.from(encrypted).toString("base64"),
    iv: base64Iv
    // Reuse the provided base64Iv
  };
}
function symDecrypt(encryptedData, base64Key, base64Iv) {
  const keyBuffer = Buffer.from(base64Key, "base64");
  const iv = Buffer.from(base64Iv, "base64");
  const encryptedBuffer = Buffer.from(encryptedData, "base64");
  const key = subtle.importKey(
    "raw",
    keyBuffer,
    {
      name: "AES-GCM"
    },
    false,
    // non-extractable
    ["decrypt"]
  );
  const decryptedData = key.then((importedKey) => {
    return subtle.decrypt(
      {
        name: "AES-GCM",
        iv
      },
      importedKey,
      encryptedBuffer
    ).then((decrypted) => {
      return new TextDecoder().decode(decrypted);
    });
  });
  return decryptedData;
}
var kryptic_default = {
  sym: {
    gencrypt: symGencrypt,
    encrypt: symEncrypt,
    decrypt: symDecrypt
  },
  asym: {
    genKeyPair: asymKeyPair,
    encrypt: asymEncrypt,
    decrypt: asymDecrypt
  }
};

// typescript/Worker/organize.ts
function previewOrganize(arrarr, merge = true) {
  let maxLen = 0;
  const lenmap_arrarr = arrarr.reduce((acc, arr) => {
    if (acc[arr.length]) {
      acc[arr.length].push(arr);
    } else {
      acc[arr.length] = [arr];
    }
    if (maxLen < arr.length) {
      maxLen = arr.length;
    }
    return acc;
  }, {});
  const sorted_arrarr = (() => {
    const sorted = [];
    do {
      if (lenmap_arrarr[maxLen]) {
        sorted.push(...lenmap_arrarr[maxLen]);
      }
    } while (--maxLen);
    return sorted;
  })();
  const shorted_arrarr = sorted_arrarr.reduce((acc, arr) => {
    const superParent = merge ? main_default2.array.findArrSuperParent(arr, sorted_arrarr) : arr;
    const superParentString = JSON.stringify(superParent);
    if (acc[superParentString]) {
      acc[superParentString].push(arr);
    } else {
      acc[superParentString] = [arr];
    }
    return acc;
  }, {});
  const onlyParrentArrays = Object.keys(shorted_arrarr).map((i) => JSON.parse(i));
  let counter = 4096;
  const indexMap = {};
  const referenceMap = Object.entries(shorted_arrarr).reduce((acc, [key, arrarr2]) => {
    const templateArray = JSON.parse(key);
    const indexMapFragment = templateArray.reduce((map, item) => {
      map[item] = "_" + main_default2.string.enCounter(counter++);
      indexMap[map[item]] = Number(item);
      return map;
    }, {});
    arrarr2.forEach((arr) => {
      acc[JSON.stringify(arr)] = indexMapFragment;
    });
    return acc;
  }, {});
  return {
    referenceMap,
    indexMap,
    classes: counter - 768,
    shortlistedArrays: onlyParrentArrays
  };
}

// typescript/Worker/order-api.ts
APP.URL["Worker"] = "https://workers.xpktr.com/api/xcss-build-request";
async function order(sequences, CMD, KEY = "", portable = {
  name: "",
  version: "",
  jsonContent: ""
}) {
  const previewResult = previewOrganize(sequences);
  if (CMD === "publish") {
    if (KEY.length < 25) {
      return {
        status: false,
        message: "Invalid Key. Fallback: preview",
        result: previewResult
      };
    }
    const projectId = KEY.slice(0, 24);
    const publicKey = KEY.slice(25);
    const contentCrypt = await kryptic_default.sym.gencrypt(JSON.stringify(previewResult.shortlistedArrays));
    let asymEncrypted;
    try {
      asymEncrypted = await kryptic_default.asym.encrypt(
        projectId + contentCrypt.iv + contentCrypt.key,
        publicKey
      );
    } catch {
      return {
        status: false,
        message: "Invalid Key. Fallback: preview",
        result: previewResult
      };
    }
    const data = JSON.stringify({
      access: publicKey,
      private: asymEncrypted,
      content: contentCrypt.data,
      portable: {
        name: portable.name,
        version: portable.version,
        content: portable.jsonContent
      }
    });
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: data,
      redirect: "follow"
    };
    return fetch(APP.URL["Worfer"], requestOptions).then((response) => response.json()).then(async (response) => {
      if (response.status) {
        return {
          status: true,
          message: response.message,
          result: JSON.parse(
            await kryptic_default.sym.decrypt(
              response.result,
              contentCrypt.key,
              contentCrypt.iv
            )
          )
        };
      } else {
        return {
          status: false,
          message: response.message ?? "Failed to establish connection with server. Fallback: preview",
          result: previewResult
        };
      }
    });
  } else {
    return Promise.resolve({
      status: true,
      message: "Preview Build",
      result: previewResult
    });
  }
}

// typescript/Script/value.ts
function loadActiveIndexes(classList, StyleStack) {
  return classList.reduce((A, entry) => {
    const index = (StyleStack.Portable[entry] || 0) + (StyleStack.Library[entry] || 0) + (StyleStack.Native[entry] || 0) + (StyleStack.Global[entry] || 0) + (StyleStack.Local[entry] || 0);
    if (index) {
      A.push(index);
    }
    return A;
  }, []);
}
function classExtract(string, action, fileData, attacments, StyleStack, FileCursor, OrderedClassList) {
  const classList = [], quotes = ["'", "`", '"'];
  let activeQuote = "", entry = "", scribed = string, marker = 0, ch = string[marker], inQuote = false;
  while (ch !== void 0) {
    if (inQuote) {
      if (ch === " " || ch === activeQuote) {
        classList.push(entry);
        entry = "";
      } else {
        entry += ch;
      }
      if (ch === activeQuote) {
        inQuote = false;
        activeQuote = "";
      }
    } else if (quotes.includes(ch)) {
      inQuote = true;
      activeQuote = ch;
    }
    ch = string[++marker];
  }
  if (action !== "read") {
    const metaFront = `TAG${fileData.metaFront}\\:${FileCursor.rowMarker}\\:${FileCursor.colMarker}__`;
    activeQuote = "";
    entry = "";
    scribed = "";
    marker = 0;
    inQuote = false;
    ch = string[marker];
    const availableIndexes = action === "preview" || action === "publish" ? main_default2.array.setback(loadActiveIndexes(classList, StyleStack)) : [];
    const index_to_classNames = action === "preview" || action === "publish" ? OrderedClassList[JSON.stringify(availableIndexes)] : [];
    while (ch !== void 0) {
      if (inQuote) {
        if (ch === " " || ch === activeQuote) {
          if (["<", ">"].includes(entry[0])) {
            const className = entry.slice(1);
            if (entry[0] === "*") {
              attacments.add(className);
            }
          } else {
            const index = (StyleStack.Portable[entry] || 0) + (StyleStack.Library[entry] || 0) + (StyleStack.Native[entry] || 0) + (StyleStack.Global[entry] || 0) + (StyleStack.Local[entry] || 0);
            if (index) {
              switch (action) {
                case "archive": {
                  const isGlobal = StyleStack.Global[entry] || 0;
                  const isLibrary = StyleStack.Global[entry] || 0;
                  const className = isGlobal ? `/${RAW.PACKAGE}/${entry}` : isLibrary ? `/${RAW.PACKAGE}/$/${entry}` : entry;
                  scribed += className;
                  break;
                }
                case "watch": {
                  const devClass = metaFront + INDEX.IMPORT(index).metaClass;
                  scribed += main_default2.string.normalize(devClass, ["/", ".", ":", "|", "$"], ["\\"]);
                  CACHE.FinalStack["." + devClass] = index;
                  break;
                }
                case "preview":
                case "publish": {
                  if (availableIndexes.includes(index)) {
                    scribed += index_to_classNames[index];
                  }
                  break;
                }
              }
            } else {
              scribed += entry;
            }
          }
          scribed += ch;
          entry = "";
        } else {
          entry += ch;
        }
        if (ch === activeQuote) {
          inQuote = false;
          activeQuote = "";
        }
      } else {
        scribed += ch;
        if (quotes.includes(ch)) {
          inQuote = true;
          activeQuote = ch;
        }
      }
      ch = string[++marker];
    }
  }
  return { classList, scribed };
}

// typescript/Script/tag.ts
var bracePair = {
  "{": "}",
  "[": "]",
  "(": ")",
  "'": "'",
  "`": "`",
  '"': '"'
};
var openBraces = Object.keys(bracePair);
var closeBraces = ["]", "}", ")"];
var rgx_subXtyleRegex = /[\$@#]/;
var rgx_zeroXtyleRegex = /^[\w\-]*\$+[\w\-]*$/i;
var rgx_openlibXtyleRegex = /^[\w\-]*\$+[\w\-]+$/i;
var rgx_onlylibXtyleRegex = /^[\w\-]+\$+[\w\-]+$/i;
function scanner(fileData, classProps = [], action = "read", attachments = /* @__PURE__ */ new Set(), styleStack = { Portable: {}, Library: {}, Native: {}, Local: {}, Global: {} }, OrderedClassList, fileCursor = main_default2.cursor.Initialize(fileData.content)) {
  const classList = [], braceTrack = [], nativeAttributes = {}, styleDeclarations = {
    element: "",
    elvalue: "",
    selector: "",
    scope: "essential",
    tagCount: fileCursor.active.tagCount,
    rowIndex: fileCursor.active.rowMarker,
    colIndex: fileCursor.active.colMarker,
    tagOpenMarker: 0,
    comments: [],
    styles: {},
    snippet_Style: "",
    snippet_Attach: "",
    snippet_Stencil: ""
  };
  let deviance = 0, attr = "", value = "", awaitBrace = "", ok = false, isVal = false, selfClosed = false, fallbackAquired = false;
  while (fileCursor.active.marker < fileData.content.length) {
    const lastCh = fileCursor.active.char;
    const liveCh = main_default2.cursor.Incremnet(fileCursor);
    if (lastCh !== "\\") {
      if (!fallbackAquired && liveCh === "<") {
        fallbackAquired = true;
        Object.assign(fileCursor.fallback, fileCursor.active);
      }
      if (awaitBrace === liveCh) {
        braceTrack.pop();
        deviance = braceTrack.length;
        awaitBrace = bracePair[braceTrack[deviance - 1]];
      } else if (openBraces.includes(liveCh) && !["'", '"', "`"].includes(awaitBrace)) {
        braceTrack.push(liveCh);
        deviance = braceTrack.length;
        awaitBrace = bracePair[liveCh];
      } else if (deviance === 0 && closeBraces.includes(liveCh)) {
        break;
      }
      if (deviance === 0 && [" ", "\n", "\r", ">", "	"].includes(liveCh) && attr !== "") {
        const tr_Attr = attr.trim();
        const tr_Value = value.trim();
        if (!styleDeclarations.element.length) {
          styleDeclarations.element = tr_Attr;
          styleDeclarations.elvalue = tr_Value;
        } else if (tr_Attr === "$") {
          styleDeclarations.comments.push(...tr_Value.slice(1, -1).split("\n").map((l) => l.trim()));
        } else if (TWEAKS.openXtyles && rgx_openlibXtyleRegex.test(tr_Attr) || !TWEAKS.openXtyles && rgx_onlylibXtyleRegex.test(tr_Attr)) {
          styleDeclarations.selector = tr_Attr;
          styleDeclarations.scope = tr_Attr.includes("$$$") ? "public" : tr_Attr.includes("$$") ? "global" : "local";
          if (tr_Value) {
            styleDeclarations.styles[""] = tr_Value;
          }
        } else if (!rgx_zeroXtyleRegex.test(tr_Attr) && rgx_subXtyleRegex.test(tr_Attr) && !tr_Attr.endsWith("$") && !tr_Attr.startsWith("@")) {
          styleDeclarations.styles[tr_Attr] = tr_Value;
        } else if (classProps.includes(tr_Attr)) {
          const result = classExtract(tr_Value, action, fileData, attachments, styleStack, fileCursor.active, OrderedClassList);
          classList.push(...result.classList);
          nativeAttributes[tr_Attr] = result.scribed;
        } else {
          nativeAttributes[tr_Attr] = tr_Value;
        }
        isVal = false;
        attr = "";
        value = "";
      }
      if (deviance === 0 && (liveCh === ">" || liveCh === ";" || liveCh === "," || liveCh === "<")) {
        ok = liveCh === ">";
        break;
      }
    }
    if (deviance === 0 && ![" ", "=", "\n", "\r", "	", ">"].includes(liveCh) || deviance !== 0) {
      if (isVal) {
        value += liveCh;
      } else {
        attr += liveCh;
      }
    } else if (deviance === 0 && liveCh === "=") {
      isVal = true;
    }
  }
  ;
  if (ok) {
    fileCursor.active.tagCount++;
    selfClosed = fileData.content[fileCursor.active.marker - 1] === "/";
    styleDeclarations.tagOpenMarker = fileCursor.active.marker + 1;
  } else if (fallbackAquired) {
    Object.assign(fileCursor.active, fileCursor.fallback);
  }
  return { ok, selfClosed, styleDeclarations, nativeAttributes, classList, fileCursor };
}

// typescript/Script/file.ts
var TagSummonStyle = `<${APP.customTag.style}/>`;
var TagSummonAttach = `<${APP.customTag.attach}/>`;
var TagSummonStencil = `<${APP.customTag.stencil}/>`;
var CustomTagElements = Object.values(APP.customTag);
var TagFn_ReplaceStyle = (sourceString, replacement) => sourceString.replace(TagSummonStyle, replacement);
var TagFn_ReplaceAttach = (sourceString, replacement) => sourceString.replace(TagSummonAttach, replacement);
var TagFn_ReplaceStencil = (sourceString, replacement) => sourceString.replace(TagSummonStencil, replacement);
function scanner2(fileData, classProps = [], action = "read", attachments = /* @__PURE__ */ new Set(), styleStack = { Portable: {}, Library: {}, Native: {}, Local: {}, Global: {} }, OrderedClassList = {}) {
  fileData.styleData.hasMainTag = false;
  fileData.styleData.hasStyleTag = false;
  fileData.styleData.hasAttachTag = false;
  fileData.styleData.hasStencilTag = false;
  const stylesList = [];
  const content = fileData.content;
  const tagTrack = [];
  const classesList = [];
  const fileCursor = main_default2.cursor.Initialize(fileData.content);
  let scribed = "";
  do {
    const char = fileCursor.active.char;
    if (content[fileCursor.active.marker - 1] !== "\\" && char === "<" && /^[/\d\w-]*$/i.test(content[fileCursor.active.marker + 1])) {
      let subScribed = "";
      const tagStart = fileCursor.active.marker;
      const { ok, selfClosed, styleDeclarations, nativeAttributes, classList } = scanner(fileData, classProps, action, attachments, styleStack, OrderedClassList, fileCursor);
      const fragment = content.slice(tagStart + 1, styleDeclarations.tagOpenMarker);
      if (ok) {
        switch (fragment) {
          case TagSummonStyle:
            fileData.styleData.hasStyleTag = true;
            break;
          case TagSummonAttach:
            fileData.styleData.hasAttachTag = true;
            break;
          case TagSummonStencil:
            fileData.styleData.hasStencilTag = true;
            break;
        }
        subScribed = (action === "archive" ? styleDeclarations.scope === "local" : Object.keys(nativeAttributes).length === 0 && Object.keys(styleDeclarations.styles).length === 0) ? fragment : "<" + [
          styleDeclarations.element + (styleDeclarations.elvalue.length ? `=${styleDeclarations.elvalue}` : ""),
          ...Object.entries(nativeAttributes).map(([A, V]) => V === "" ? A : `${A}=${V}`)
        ].join(" ") + ">";
        main_default2.cursor.Incremnet(fileCursor);
        if (classList.length) {
          classesList.push(classList);
        }
        if (Object.keys(styleDeclarations.styles).length > 0) {
          stylesList.push(styleDeclarations);
        }
        Object.entries(styleDeclarations.styles).forEach(([k, v]) => styleDeclarations.styles[k] = v.slice(1, -1));
      } else {
        subScribed += fragment;
      }
      if (!selfClosed && ok) {
        if (styleDeclarations.element[0] === "/") {
          const element = styleDeclarations.element.slice(1);
          const watchTrack = tagTrack.pop();
          if (watchTrack !== void 0) {
            if (watchTrack.element === element) {
              const snippet = content.slice(watchTrack.tagOpenMarker, tagStart).trim();
              switch (element) {
                case APP.customTag["style"]:
                  watchTrack.snippet_Style = snippet;
                  break;
                case APP.customTag["attach"]:
                  watchTrack.snippet_Attach = snippet;
                  break;
                case APP.customTag["stencil"]:
                  watchTrack.snippet_Stencil = snippet;
                  break;
              }
            } else {
              tagTrack.push(watchTrack);
            }
          }
        } else if (CustomTagElements.includes(styleDeclarations.element)) {
          tagTrack.push(styleDeclarations);
        }
      }
      if (tagTrack.length === 0) {
        scribed += subScribed;
      }
    } else {
      main_default2.cursor.Incremnet(fileCursor);
      if (tagTrack.length === 0) {
        scribed += char;
      }
    }
  } while (fileCursor.active.marker < content.length);
  return { scribed, classesList, stylesList };
}

// typescript/Data/filing.ts
function FILING(target, source, filePath, content, isXtylesFolder = false, isPortable = false) {
  const targetPath = target.length ? target + "/" + filePath : filePath;
  const sourcePath = source.length ? source + "/" + filePath : filePath;
  const [extension, fileName, id, cluster] = targetPath.slice(targetPath.lastIndexOf("/") + 1).split(".").reverse();
  const idn = typeof id === "number" || Number(id) < 0 ? 0 : parseInt(id, 10);
  const normalFileName = main_default2.string.normalize(fileName);
  const group = isPortable ? extension === "css" ? "binding" : extension === "xcss" ? "xtyling" : "readme" : isXtylesFolder ? cluster ? "cluster" : "axiom" : "proxy";
  const stamp = (isPortable ? `/${normalFileName}${group === "binding" ? "/$/" : "/"}` : "") + (idn === 0 && extension === "css" ? "" : main_default2.string.normalize(cluster) + "$".repeat(idn));
  const result = {
    id,
    group,
    stamp,
    cluster,
    filePath,
    fileName,
    extension,
    sourcePath,
    targetPath,
    metaFront: `${isXtylesFolder ? group.toLocaleUpperCase() : ""}\\|${main_default2.string.normalize(targetPath, [], [], ["/", "."])}`,
    content: isXtylesFolder && extension === "css" ? main_default2.code.uncomment.Css(content) : content,
    midway: "",
    manifest: {
      file: {
        group: "",
        id: ""
      },
      global: {},
      local: {}
    },
    styleData: {
      usedIndexes: /* @__PURE__ */ new Set(),
      essentials: [],
      styleGlobals: {},
      styleLocals: {},
      styleMap: {},
      classGroups: [],
      attachments: [],
      errors: [],
      hasMainTag: false,
      hasStyleTag: false,
      hasAttachTag: false,
      hasStencilTag: false
    }
  };
  return result;
}

// typescript/Script/class.ts
var C_Proxy = class {
  constructor({
    source,
    target,
    stylesheet,
    extensions,
    fileContents,
    stylesheetContent
  }) {
    this.source = "";
    this.target = "";
    this.stylesheetPath = "";
    this.sourceStylesheet = "";
    this.targetStylesheet = "";
    this.stylesheetContent = "";
    this.extensions = [];
    this.extnsProps = {};
    this.fileCache = {};
    extensions["xcss"] = [];
    this.source = source;
    this.target = target;
    this.stylesheetPath = stylesheet;
    this.sourceStylesheet = fileman_default.path.join(source, stylesheet);
    this.targetStylesheet = fileman_default.path.join(target, stylesheet);
    this.extnsProps = extensions;
    this.extensions = Object.keys(extensions);
    this.stylesheetContent = stylesheetContent || "";
    Object.entries(fileContents || {}).forEach(([filePath, fileContent]) => this.SaveFile(filePath, fileContent));
  }
  SaveFile(filePath, fileContent) {
    if (this.fileCache[filePath]) {
      this.fileCache[filePath].styleData.usedIndexes.forEach((index) => INDEX.DISPOSE(index));
      Object.keys(this.fileCache[filePath].styleData.styleGlobals).forEach((key) => INDEX.DISPOSE(Number(key)));
      delete this.fileCache[filePath];
    }
    const file = FILING(this.target, this.source, filePath, fileContent, false);
    const fileStyle = file.styleData;
    this.fileCache[file.filePath] = file;
    const sciptResponse = scanner2(file, this.extnsProps[file.extension]);
    fileStyle.classGroups.push(...sciptResponse.classesList);
    sciptResponse.stylesList.forEach((style2) => {
      const IndexMap = style2.scope === "global" ? fileStyle.styleGlobals : style2.scope === "local" ? fileStyle.styleLocals : {};
      const skeletonMap = style2.scope === "global" ? file.manifest.global : style2.scope === "local" ? file.manifest.global : {};
      const response = parse_default.TAGSTYLE(style2, file, IndexMap);
      if (style2.scope === "essential") {
        file.styleData.attachments.push(...response.attachments);
        file.styleData.essentials.push(...response.essentials);
      } else if (response.isOriginal) {
        skeletonMap[response.selector] = response.metadata;
        file.styleData.usedIndexes.add(response.index);
      }
      file.styleData.errors.push(...response.errors);
    });
    Object.assign(CACHE.GlobalsStyle2Index, file.styleData.styleGlobals);
    Object.assign(file.manifest.file, { group: "target", id: RAW.WorkPath + file.targetPath });
  }
  Accumulator() {
    let localCount = 0, globalCount = 0;
    const C = {
      report: [],
      errors: [],
      indexes: [],
      styleMap: [],
      essentials: [],
      attachments: /* @__PURE__ */ new Set()
    }, styleGlobals = {};
    C.styleMap.push({ file: { group: "stylesheet", id: RAW.WorkPath + this.targetStylesheet }, global: {}, local: {} });
    Object.values(this.fileCache).forEach((file) => {
      C.indexes.push(...Object.values(file.styleData.styleLocals));
      C.indexes.push(...Object.values(file.styleData.styleGlobals));
      const fileLocalCount = Object.keys(file.styleData.styleLocals).length;
      localCount += fileLocalCount;
      const fileGlobalCount = Object.keys(file.styleData.styleGlobals).length;
      globalCount += fileGlobalCount;
      if (fileLocalCount + fileGlobalCount) {
        C.report.push(main_default.MOLD.tertiary.Topic(
          `[ ${fileLocalCount} Local + ${fileGlobalCount} Global ] : ${file.targetPath}`,
          [
            ...main_default.list.secondary.Entries(Object.keys(file.styleData.styleGlobals)),
            main_default.canvas.divider.mid,
            ...main_default.list.text.Entries(Object.keys(file.styleData.styleLocals))
          ]
        ));
      }
      Object.values(file.styleData.styleLocals).forEach((index) => {
        const InStash = INDEX.IMPORT(index);
        if (InStash.declarations.length > 1) {
          C.errors.push(main_default.MOLD.failed.List("Multiple declarations: " + InStash.selector, InStash.declarations, main_default.list.text.Bullets));
        }
      });
      C.styleMap.push(file.manifest);
      C.errors.push(...file.styleData.errors);
      C.essentials.push(...file.styleData.essentials);
      Object.assign(styleGlobals, file.styleData.styleGlobals);
      file.styleData.attachments.forEach((bind) => C.attachments.add(bind));
    });
    Object.values(styleGlobals).forEach((index) => {
      const InStash = INDEX.IMPORT(index);
      if (InStash.declarations.length > 1) {
        C.errors.push(main_default.MOLD.failed.List("Multiple declarations: " + InStash.selector, InStash.declarations, main_default.list.text.Bullets));
      }
    });
    C.report.unshift(main_default.MOLD.primary.Section(`PROXY : [ ${localCount} Locals + ${globalCount} Globals ] : ${this.target} -> ${this.source}`));
    return C;
  }
  RenderFiles(attachments = /* @__PURE__ */ new Set(), Command, OrderedClassList = {}) {
    Object.values(this.fileCache).forEach((file) => {
      file.midway = scanner2(
        file,
        this.extnsProps[file.extension],
        Command,
        attachments,
        {
          Local: file.styleData.styleLocals,
          Global: CACHE.GlobalsStyle2Index,
          Native: CACHE.NativeStyle2Index,
          Library: CACHE.LibraryStyle2Index,
          Portable: CACHE.PortableStyle2Index
        },
        OrderedClassList
      ).scribed;
    });
  }
  SummonFiles(SaveFiles = {}, stylesheet, StyleBlock, AttachBlock, StencilBlock) {
    const tagSummons = [this.sourceStylesheet];
    Object.values(this.fileCache).forEach((file) => {
      if (file.extension !== "xcss") {
        let fileContent = file.midway;
        if (file.styleData.hasStyleTag) {
          fileContent = TagFn_ReplaceStyle(fileContent, StyleBlock);
        }
        if (file.styleData.hasAttachTag) {
          fileContent = TagFn_ReplaceAttach(fileContent, AttachBlock);
        }
        if (file.styleData.hasStencilTag) {
          fileContent = TagFn_ReplaceStencil(fileContent, StencilBlock);
        }
        tagSummons.push(file.sourcePath);
        SaveFiles[file.sourcePath] = fileContent;
      }
    });
    SaveFiles[this.sourceStylesheet] = stylesheet;
    return tagSummons;
  }
  GetTracks() {
    const classTracks = [];
    Object.values(this.fileCache).forEach((file) => {
      file.styleData.classGroups.forEach((group) => {
        const indexGroup = group.reduce((indexAcc, className) => {
          const index = (CACHE.PortableStyle2Index[className] || 0) + (CACHE.LibraryStyle2Index[className] || 0) + (CACHE.GlobalsStyle2Index[className] || 0) + (CACHE.NativeStyle2Index[className] || 0) + (file.styleData.styleLocals[className] || 0);
          if (index) {
            indexAcc.push(index);
          }
          return indexAcc;
        }, []);
        if (indexGroup.length) {
          classTracks.push(indexGroup);
        }
      });
    });
    return classTracks;
  }
  UpdateCache() {
    Object.entries(this.fileCache).forEach(([file, cache]) => {
      this.SaveFile(file, cache.content);
    });
  }
  ClearFiles() {
    Object.entries(this.fileCache).forEach(([filePath, fileCache]) => {
      fileCache.styleData.usedIndexes.forEach((index) => INDEX.DISPOSE(index));
      delete this.fileCache[filePath];
    });
  }
  // ComponentSpilt(timeStamp: string) {
  // 	const SavedFiles: Record<string, string> = {};
  // 	Object.values(this.fileCache).forEach((file) => {
  // 		if (file.extension === "xcss") {
  // 			if (Object.keys(SavedFiles).includes(file.targetPath)) { SavedFiles[file.targetPath] += "\n\n" + file.content; }
  // 		} else if (Object.keys(file.styleData.styleGlobals).length) {
  // 			SavedFiles[file.targetPath] = SCRIPTPARSE(file, this.extnsProps[file.extension], "archive").scribed;
  // 			SavedFiles[file.targetPath + ".xcss"] = Object.entries(file.styleData.styleGlobals).reduce((A, [selector, index]) => {
  // 				const inStash = INDEX.IMPORT(index);
  // 				const object = inStash.object;
  // 				const bindStack = FORGE.bindIndex(new Set(inStash.preBinds), new Set(inStash.postBinds));
  // 				A.push(...GenerateXtyleBlock(selector, object, bindStack.preBindsList, bindStack.postBindsList));
  // 				return A;
  // 			}, [`## ${timeStamp}`]).join("\n");
  // 		}
  // 	});
  // 	return SavedFiles;
  // }
};

// typescript/Style/stash.ts
function _DeleteLibraryFile(filePath) {
  if (STACK.LIBRARIES[filePath]) {
    STACK.LIBRARIES[filePath].styleData.usedIndexes.forEach((i) => INDEX.DISPOSE(i));
    delete STACK.LIBRARIES[filePath];
  }
}
function _DeletePortableFile(filePath) {
  if (STACK.PORTABLES[filePath]) {
    STACK.PORTABLES[filePath].styleData.usedIndexes.forEach((i) => INDEX.DISPOSE(i));
    delete STACK.PORTABLES[filePath];
  }
}
function _ClearStash() {
  Object.entries(CACHE.LibraryStyle2Index).forEach(([selector, index]) => {
    INDEX.DISPOSE(index);
    delete CACHE.LibraryStyle2Index[selector];
  });
  Object.entries(CACHE.PortableStyle2Index).forEach(([selector, index]) => {
    INDEX.DISPOSE(index);
    delete CACHE.PortableStyle2Index[selector];
  });
  CACHE.PortableEssentials = [];
  Object.keys(STACK.LIBRARIES).forEach((filePath) => _DeleteLibraryFile(filePath));
  Object.keys(STACK.PORTABLES).forEach((filePath) => _DeletePortableFile(filePath));
}
function _SaveLibraryFile(filePath, fileContent) {
  if (STACK.LIBRARIES[filePath]) {
    _DeleteLibraryFile(filePath);
  }
  STACK.LIBRARIES[filePath] = FILING(
    "",
    NAV.folder.library.path,
    filePath.slice(NAV.folder.library.path.length + 1),
    fileContent,
    true,
    false
  );
}
function _SavePortableFile(filePath, fileContent) {
  if (STACK.PORTABLES[filePath]) {
    _DeletePortableFile(filePath);
  }
  STACK.PORTABLES[filePath] = FILING(
    "",
    NAV.folder.portables.path,
    filePath.slice(NAV.folder.portables.path.length + 1),
    fileContent,
    true,
    true
  );
}
function _StackLibraryFiles() {
  let length = 0;
  const axiom = {}, cluster = {}, libraryTable = {};
  Object.entries(STACK.LIBRARIES).forEach(([filePath, fileData]) => {
    const { id, group } = fileData;
    libraryTable[filePath] = { group, id };
    if (group === "axiom") {
      if (!axiom[id]) {
        axiom[id] = [];
      }
      axiom[id].push(fileData);
    } else if (group === "cluster") {
      if (!cluster[id]) {
        cluster[id] = [];
      }
      cluster[id].push(fileData);
    }
    if (Number(id) > length) {
      length = Number(id);
    }
  });
  const axiomsArray = main_default2.array.fromNumberedObject(axiom, length);
  const clustersArray = main_default2.array.fromNumberedObject(cluster, length);
  return { libraryTable, axiomsArray, clustersArray };
}
function _StackPortableFiles() {
  const bindingArray = [], xtylingArray = [], portableTable = {};
  Object.entries(STACK.PORTABLES).forEach(([filePath, fileData]) => {
    fileData.id = filePath;
    const { id, group } = fileData;
    portableTable[filePath] = { group, id };
    if (group === "binding") {
      bindingArray.push(fileData);
    } else if (group === "xtyling") {
      xtylingArray.push(fileData);
    }
  });
  return { portableTable, bindingArray, xtylingArray };
}
var report = "";
var axiomCount = 0;
var clusterCount = 0;
var bindingCount = 0;
var portableCount = 0;
var warnings = [];
var axiomChart = {};
var clusterChart = {};
var bindingChart = {};
var portableChart = {};
function _UpdateFiles() {
  _ClearStash();
  Object.entries(RAW.LIBRARIES).forEach(([filePath, fileContent]) => {
    _SaveLibraryFile(filePath, fileContent);
  });
  Object.entries(RAW.PORTABLES).forEach(([filePath, fileContent]) => {
    _SavePortableFile(filePath, fileContent);
  });
}
function ReRender() {
  _UpdateFiles();
  report = "";
  axiomCount = 0;
  clusterCount = 0;
  portableCount = 0;
  bindingCount = 0;
  warnings = [];
  axiomChart = {};
  clusterChart = {};
  bindingChart = {};
  portableChart = {};
  const { libraryTable, axiomsArray, clustersArray } = _StackLibraryFiles();
  const { portableTable: modulesTable, bindingArray, xtylingArray: portablesArray } = _StackPortableFiles();
  const PortableEssentials = [];
  const XtylingStyleSkeleton = portablesArray.reduce((collection, fileData) => {
    const filePath = NAV.folder.portables + "/" + fileData.filePath;
    const tagStash = scanner2(fileData).stylesList, indexMetaCollection = {};
    tagStash.forEach((style2) => {
      style2.scope = "package";
      const response = parse_default.TAGSTYLE(style2, fileData, CACHE.PortableStyle2Index);
      warnings.push(...response.errors);
      if (response.selector === "") {
        PortableEssentials.push(...response.essentials);
        if (!RAW.WATCH) {
          fileData.styleData.essentials.push(...response.essentials);
        }
      } else if (response.isOriginal) {
        fileData.styleData.usedIndexes.add(response.index);
        indexMetaCollection[response.selector] = response.metadata;
        portableCount++;
      }
    });
    collection[filePath] = indexMetaCollection;
    const classNames = Object.keys(indexMetaCollection);
    if (classNames.length) {
      portableChart[`Portable [${fileData.filePath}]: ${classNames.length} Classes`] = classNames;
    }
    return collection;
  }, {});
  const BindingStyleSkeleton = bindingArray.reduce((collection, fileData) => {
    const result = parse_default.CSSLIBRARY([fileData], "BINDING", true);
    collection[NAV.folder.portables + "/" + fileData.filePath] = result.indexMetaCollection;
    if (result.selectorList.length) {
      bindingChart[`Binding [${fileData.filePath}]: ${result.selectorList.length} Classes`] = result.selectorList;
    }
    bindingCount += result.selectorList.length;
    return collection;
  }, {});
  const AxiomStyleSkeleton = axiomsArray.reduce((collection, fileData, index) => {
    const result = parse_default.CSSLIBRARY(fileData, "AXIOM");
    collection[index] = result.indexMetaCollection;
    if (result.selectorList.length) {
      axiomChart[`Level ${index}: ${result.selectorList.length} Classes`] = result.selectorList;
    }
    axiomCount += result.selectorList.length;
    return collection;
  }, {});
  const ClusterStyleSkeleton = clustersArray.reduce((collection, level, index) => {
    const result = parse_default.CSSLIBRARY(level, "CLUSTER");
    collection[index] = result.indexMetaCollection;
    if (result.selectorList.length) {
      clusterChart[`Level ${index}: ${result.selectorList.length} Classes`] = result.selectorList;
    }
    clusterCount += result.selectorList.length;
    return collection;
  }, {});
  Object.values(CACHE.PortableStyle2Index).forEach((index) => {
    const InStash = INDEX.IMPORT(index);
    if (InStash.metadata.declarations.length > 1) {
      warnings.push(
        main_default.MOLD.warning.List(
          "Multiple portable declarations: " + InStash.selector,
          InStash.declarations,
          main_default.list.text.Bullets
        )
      );
    }
  });
  Object.values(CACHE.LibraryStyle2Index).forEach((index) => {
    const InStash = INDEX.IMPORT(index);
    if (InStash.declarations.length > 1) {
      warnings.push(
        main_default.MOLD.warning.List(
          "Multiple Library declarations: " + InStash.selector,
          InStash.declarations,
          main_default.list.text.Bullets
        )
      );
    }
  });
  report = [
    main_default.MOLD.primary.Section(
      `Axioms: ${axiomCount}`,
      Object.entries(axiomChart).map(
        ([heading, entries]) => main_default.MOLD.tertiary.Topic(heading, entries, main_default.list.text.Entries)
      )
    ),
    main_default.MOLD.primary.Section(
      `Clusters: ${clusterCount}`,
      Object.entries(clusterChart).map(
        ([heading, entries]) => main_default.MOLD.tertiary.Topic(heading, entries, main_default.list.text.Entries)
      )
    ),
    main_default.MOLD.primary.Section(
      `Bindings: ${bindingCount}`,
      Object.entries(bindingChart).map(
        ([heading, entries]) => main_default.MOLD.tertiary.Topic(heading, entries, main_default.list.text.Entries)
      )
    ),
    main_default.MOLD.primary.Section(
      `Xtylings: ${portableCount}`,
      Object.entries(portableChart).map(
        ([heading, entries]) => main_default.MOLD.tertiary.Topic(heading, entries, main_default.list.text.Entries)
      )
    )
  ].join("");
  const nameCollitions = [];
  Object.values(STACK.PORTABLES).forEach((F) => {
    if (RAW.PACKAGE === F.fileName) {
      nameCollitions.push(F.sourcePath);
    }
  });
  if (nameCollitions.length) {
    warnings.push(main_default.MOLD.warning.List(`Package-name collitions: ${RAW.PACKAGE}`, nameCollitions, main_default.list.failed.Bullets));
  }
  return {
    libraryTable,
    modulesTable,
    nameCollitions,
    PortableEssentials,
    AxiomStyleSkeleton,
    ClusterStyleSkeleton,
    BindingStyleSkeleton,
    XtylingStyleSkeleton
  };
}
function ReDeclare() {
  Object.values(CACHE.LibraryStyle2Index).forEach((val) => {
    const value = CACHE.Index2StylesObject[val];
    value.metadata.declarations = [...value.declarations];
  });
}
function Appendix(indexes = []) {
  const stash = {}, essentials = [];
  if (!RAW.WATCH) {
    const usedPortables = Object.values(CACHE.PortableStyle2Index).filter((i) => indexes.includes(i)).reduce((a, c) => {
      a.add(INDEX.IMPORT(c).portable);
      return a;
    }, /* @__PURE__ */ new Set());
    Object.values(STACK.PORTABLES).forEach((F) => {
      if (usedPortables.has(F.fileName)) {
        if (F.extension === "md") {
          if (stash[F.fileName]) {
            stash[F.fileName].readme.push(F.content);
          } else {
            stash[F.fileName] = { readme: [F.content], binding: [], xtyling: [] };
          }
        } else if (F.extension === "xcss") {
          if (stash[F.fileName]) {
            F.styleData.usedIndexes.forEach((i) => stash[F.fileName].xtyling.push(i));
          } else {
            stash[F.fileName] = { readme: [], binding: [], xtyling: Array.from(F.styleData.usedIndexes) };
          }
        } else if (F.extension === "css") {
          if (stash[F.fileName]) {
            F.styleData.usedIndexes.forEach((i) => stash[F.fileName].binding.push(i));
          } else {
            stash[F.fileName] = { readme: [], binding: Array.from(F.styleData.usedIndexes), xtyling: [] };
          }
        }
        essentials.push(...F.styleData.essentials);
      }
    });
  }
  return {
    essentials,
    warnings,
    report,
    stash
  };
}
var stash_default = {
  ReRender,
  ReDeclare,
  Appendix
};

// typescript/execute.ts
function UpdateXtylesFolder() {
  INDEX.RESET();
  PUBLISH.MANIFEST.prefix = RAW.PACKAGE;
  Object.assign(CACHE, { PortableEssentials: [], LibraryStyle2Index: {}, PortableStyle2Index: {} });
  Object.assign(STACK, { LIBRARIES: {}, PORTABLES: {} });
  const {
    libraryTable,
    modulesTable,
    PortableEssentials,
    AxiomStyleSkeleton,
    ClusterStyleSkeleton,
    XtylingStyleSkeleton,
    BindingStyleSkeleton
  } = stash_default.ReRender();
  PUBLISH.MANIFEST.axiom = AxiomStyleSkeleton;
  PUBLISH.MANIFEST.cluster = ClusterStyleSkeleton;
  PUBLISH.MANIFEST.xtyling = XtylingStyleSkeleton;
  PUBLISH.MANIFEST.binding = BindingStyleSkeleton;
  CACHE.PortableEssentials = PortableEssentials;
  PUBLISH.LibFilesTemp = { ...libraryTable, ...modulesTable };
}
function ProcessProxies(action = "upload", targetFolder = "", filePath = "", fileContent = "", extension = "") {
  if (RAW.PROXYFILES[targetFolder].fileContents === void 0) {
    RAW.PROXYFILES[targetFolder].fileContents = {};
  }
  let reCache = true;
  switch (action) {
    case "add":
    case "change":
      if (STACK.PROXYCACHE[targetFolder].stylesheetPath === filePath) {
        RAW.PROXYFILES[targetFolder].stylesheetContent = fileContent;
        STACK.PROXYCACHE[targetFolder].stylesheetContent = fileContent;
        reCache = false;
      } else if (STACK.PROXYCACHE[targetFolder].extensions.includes(extension)) {
        RAW.PROXYFILES[targetFolder].fileContents[filePath] = fileContent;
        PUBLISH.DeltaPath = `${STACK.PROXYCACHE[targetFolder].source}/${filePath}`;
      } else {
        PUBLISH.DeltaPath = `${STACK.PROXYCACHE[targetFolder].source}/${filePath}`;
        PUBLISH.DeltaContent = fileContent;
        reCache = false;
      }
      break;
    case "unlink":
      if (RAW.PROXYFILES[targetFolder]) {
        delete RAW.PROXYFILES[targetFolder].fileContents[filePath];
      }
      break;
    default:
      PUBLISH.Report.hashrule = hash_rules_default.UPLOAD();
      PUBLISH.MANIFEST.hashrules = CACHE.HashRule;
  }
  if (reCache) {
    stash_default.ReDeclare();
    Object.keys(CACHE.GlobalsStyle2Index).forEach((key) => delete CACHE.GlobalsStyle2Index[key]);
    Object.entries(STACK.PROXYCACHE).forEach(([key, cache]) => {
      cache.ClearFiles();
      delete STACK.PROXYCACHE[key];
    });
    Object.entries(RAW.PROXYFILES).forEach(([key, files]) => {
      STACK.PROXYCACHE[key] = new C_Proxy(files);
    });
    CACHE.NativeStyle2Index = {
      ...Object.fromEntries(Object.entries(CACHE.LibraryStyle2Index).map(([s, i]) => [`/${RAW.PACKAGE}/$/${s}`, i])),
      ...Object.fromEntries(Object.entries(CACHE.GlobalsStyle2Index).map(([s, i]) => [`/${RAW.PACKAGE}/${s}`, i]))
    };
  }
}
async function Engine() {
  const CUMULATES = {
    report: [],
    errors: [],
    indexes: [],
    styleMap: [],
    essentials: [],
    attachments: /* @__PURE__ */ new Set()
  };
  const SAVEFILES = {};
  Object.values(STACK.PROXYCACHE).forEach((cache) => {
    const cumulated = cache.Accumulator();
    CUMULATES.report.push(...cumulated.report);
    CUMULATES.errors.push(...cumulated.errors);
    CUMULATES.indexes.push(...cumulated.indexes);
    CUMULATES.styleMap.push(...cumulated.styleMap);
    CUMULATES.essentials.push(...cumulated.essentials);
    cumulated.attachments.forEach((i) => CUMULATES.attachments.add(i));
  });
  PUBLISH.MANIFEST.global = {};
  PUBLISH.MANIFEST.local = {};
  PUBLISH.MANIFEST.file = PUBLISH.LibFilesTemp;
  CUMULATES.styleMap.forEach((map) => {
    PUBLISH.MANIFEST.global[map.file.id] = map.global;
    PUBLISH.MANIFEST.local[map.file.id] = map.local;
    PUBLISH.MANIFEST.file[map.file.id] = map.file;
  });
  if (RAW.WATCH) {
    CACHE.FinalStack = {};
    PUBLISH.FinalMessage = CUMULATES.errors.length ? "Errors in " + CUMULATES.errors.length + " Tags." : "Zero errors.";
  } else {
    const TRACKS = [];
    Object.values(STACK.PROXYCACHE).forEach((cache) => TRACKS.push(...cache.GetTracks()));
    let output;
    if ("publish" === RAW.COMMAND) {
      if (CUMULATES.errors.length) {
        RAW.CMD = "preview";
        output = await order(TRACKS, RAW.COMMAND, RAW.ARGUMENT);
        PUBLISH.FinalMessage = "Errors in " + CUMULATES.errors.length + " Tags. Falling back to 'preview' command.";
      } else {
        output = await order(TRACKS, RAW.CMD, RAW.ARG);
        if (output.status) {
          PUBLISH.FinalMessage = "Build Success.";
        } else {
          RAW.CMD = "preview";
          PUBLISH.FinalError = output.message;
          PUBLISH.FinalMessage = "Build Atttempt Failed. Fallback with Preview.";
        }
      }
    } else {
      if (CUMULATES.errors.length)
        PUBLISH.FinalMessage = CUMULATES.errors.length + " Unresolved Errors. Rectify them to proceed with 'publish' command.";
      else
        PUBLISH.FinalMessage = "Preview verified. Procceed to 'publish' using your key.";
      output = await order(RAW.CMD, RAW.ARG, TRACKS, FALLBACK);
    }
    CACHE.FinalStack = output.result.reduce((A, I) => {
      A["." + INDEX.STYLE(I).class] = I;
      return A;
    }, {});
    CACHE.SortedIndexes = output.result;
  }
  return { CUMULATES, SAVEFILES };
}
async function Generate() {
  const { SAVEFILES, CUMULATES } = await Engine();
  const XRESPONSE = stash_default.Appendix(CACHE.SortedIndexes);
  PUBLISH.Report.library = XRESPONSE.report;
  PUBLISH.Report.targets = main_default.MOLD.std.Block(CUMULATES.report);
  if (PUBLISH.FinalError.length) {
    CUMULATES.errors.push(main_default.MOLD.failed.List(PUBLISH.FinalError));
  }
  PUBLISH.ErrorCount = CUMULATES.errors.length;
  PUBLISH.WarningCount = XRESPONSE.warnings.length;
  PUBLISH.Report.errors = main_default.MOLD[PUBLISH.ErrorCount ? "failed" : "success"].Section(
    `${PUBLISH.ErrorCount} Errors & ${PUBLISH.WarningCount} Warnings`,
    [...XRESPONSE.warnings, ...CUMULATES.errors]
  );
  PUBLISH.DeltaPath = "";
  PUBLISH.DeltaContent = "";
  return {
    SaveFiles: SAVEFILES,
    ConsoleReport: main_default.MOLD.std.Block(
      Object.values(PUBLISH.Report).filter((string) => string !== "")
    )
  };
}

// typescript/command.ts
function reporter(heading, targets, report2) {
  main_default.POST(
    main_default.MOLD.std.Block([
      main_default.MOLD.title.Chapter(heading, targets.map((i) => `Watching : ${i}`), main_default.list.tertiary.Bullets),
      report2,
      main_default.MOLD.failed.Footer("Press Ctrl+C to stop watching.", MemoryUsage(), main_default.list.tertiary.Entries)
    ])
  );
}
async function execute(chapter) {
  let stopWatcher = null;
  let report2 = "", targets = [], reportNext = false, step2 = "Initialize", staticsFetched = false, heading = "Initial Build";
  main_default.POST(main_default.MOLD.tertiary.Chapter(chapter));
  do {
    const SaveFiles = {};
    switch (step2) {
      case "Initialize":
      case "VerifySetupStruct": {
        const verifyStructResult = await VerifySetupStruct();
        if (!verifyStructResult.proceed) {
          report2 = verifyStructResult.report;
          step2 = "WatchFolders";
          break;
        } else {
          report2 = "";
        }
      }
      case "ReadIndex": {
        await FetchIndexContent();
      }
      case "ReadLibraries": {
        await ReloadLibrary();
      }
      case "VerifyConfigure": {
        const verifyConfigsResult = await VerifyConfigure(!staticsFetched);
        if (!verifyConfigsResult.status) {
          report2 = verifyConfigsResult.report;
          step2 = "WatchFolders";
          break;
        } else {
          staticsFetched = true;
          report2 = "";
        }
      }
      case "ReadProxyFolders": {
        await UpdateProxies();
      }
      case "ReadHashrules": {
        const hashruleAnalysis = await AnalyzeHashrules();
        if (!hashruleAnalysis.status) {
          report2 = hashruleAnalysis.report;
          step2 = "WatchFolders";
          break;
        } else {
          report2 = "";
        }
      }
      case "ProcessXtylesFolder": {
        UpdateXtylesFolder();
      }
      case "ProcessProxyFolders": {
        ProcessProxies();
      }
      case "GenerateFinals": {
        const response = await Generate();
        Object.assign(SaveFiles, response.SaveFiles);
        report2 = response.ConsoleReport;
      }
      case "Publish": {
        if (Object.keys(SaveFiles).length) {
          await fileman_default.write.bulk(SaveFiles);
        }
        if (reportNext) {
          reporter(heading, targets, report2);
          reportNext = false;
        }
        ;
      }
      case "WatchFolders": {
        if (RAW.WATCH) {
          step2 = "WatchFolders";
        } else {
          if (stopWatcher) {
            stopWatcher();
            stopWatcher = null;
          }
          break;
        }
        if (!stopWatcher) {
          targets = Object.keys(STACK.PROXYCACHE);
          const targetFolders = [...targets, NAV.folder.setup.path];
          process.on("SIGINT", () => {
            if (stopWatcher) {
              stopWatcher();
              stopWatcher = null;
              main_default.render.write("\n", 2);
            }
            process.exit();
          });
          stopWatcher = watchFolders(targetFolders);
          reporter(heading, targets, report2);
        }
        if (EventQueue.hasEvents()) {
          const event = EventQueue.dequeue();
          if (!event) {
            break;
          }
          const filePath = `${event.folder}/${event.filePath}`;
          if (filePath.startsWith(NAV.folder.autogen.path)) {
            break;
          } else {
            if (event.folder === NAV.folder.setup.path) {
              if (event.action === "add" || event.action === "change") {
                switch (filePath) {
                  case NAV.json.configure.path:
                    stopWatcher();
                    stopWatcher = null;
                    step2 = "VerifyConfigure";
                    break;
                  case NAV.css.atrules.path:
                  case NAV.css.constants.path:
                  case NAV.css.elements.path:
                  case NAV.css.extends.path:
                    await FetchIndexContent();
                    step2 = "GenerateFinals";
                    break;
                  case NAV.json.hashrules.path:
                    step2 = "ReadHashrules";
                    break;
                  default:
                    if (filePath.startsWith(NAV.folder.library.path) && event.extension === "css") {
                      RAW.LIBRARIES[filePath] = event.fileContent;
                    } else if (filePath.startsWith(NAV.folder.portables.path) && ["xcss", "css", "md"].includes(event.extension)) {
                      RAW.PORTABLES[filePath] = event.fileContent;
                    }
                    step2 = "ProcessXtylesFolder";
                }
              } else {
                step2 = "VerifySetupStruct";
              }
            } else if (event.action === "add" || event.action === "change" || event.action === "unlink") {
              ProcessProxies(event.action, event.folder, event.filePath, event.fileContent, event.extension);
              step2 = "GenerateFinals";
            } else {
              step2 = "VerifyConfigure";
            }
            heading = `[${event.timeStamp}] | ${event.filePath} | [${event.action}]`;
            reportNext = true;
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }
  } while (RAW.WATCH);
  if (stopWatcher) {
    stopWatcher();
    stopWatcher = null;
  } else {
    main_default.POST(report2);
  }
}
async function commander({
  command,
  argument,
  rootPath,
  workPath,
  originPackageEssential
}) {
  RAW.COMMAND = command;
  RAW.ARGUMENT = argument;
  RAW.WATCH = argument === "watch";
  RAW.PACKAGE = originPackageEssential.name;
  RAW.VERSION = originPackageEssential.version;
  SetENV(rootPath, workPath, originPackageEssential);
  main_default.INIT(command !== "debug" && command !== "archive");
  switch (RAW.COMMAND) {
    case "init": {
      await main_default.PLAY.Title(APP.name + " : Initialize", 500);
      const setupInit = await VerifySetupStruct();
      if (setupInit.unstart) {
        main_default.POST(await Initialize2());
      }
      break;
    }
    case "debug": {
      execute(RAW.PACKAGE + " : Debug " + RAW.WATCH ? "Watch" : "Build");
      break;
    }
    case "preview": {
      await execute(RAW.PACKAGE + " : Preview " + RAW.WATCH ? "Watch" : "Build");
      break;
    }
    case "publish": {
      await execute(RAW.PACKAGE + " : Production Build");
      break;
    }
    case "archive": {
      await execute(RAW.PACKAGE + " : Split for Components");
      break;
    }
    case "install": {
      main_default.POST("\n" + main_default.MOLD.secondary.Section("Installing Portables"));
      const verifyStructResult = await VerifySetupStruct();
      if (verifyStructResult.proceed) {
        const verifyConfigsResult = await VerifyConfigure(true);
        if (verifyConfigsResult.status) {
        } else {
          main_default.POST(verifyConfigsResult.report);
        }
        ;
      } else {
        main_default.POST(verifyStructResult.report);
      }
      ;
      break;
    }
    default: {
      await FetchDocs();
      main_default.POST(
        main_default.MOLD.std.Chapter(`${RAW.COMMAND} @ ` + APP.version, [
          SYNC.DOCS.alerts.content || ""
        ])
      );
      main_default.POST(
        main_default.MOLD.secondary.Section(
          "Available Commands",
          Props.std(APP.commandList)
        )
      );
      main_default.POST(
        main_default.MOLD.secondary.Section(
          "Agreements",
          Props.std(Object.fromEntries(Object.values(SYNC.AGREEMENT).map((i) => [i.title, i.path])))
        )
      );
      main_default.POST(
        main_default.MOLD.secondary.Section("Documentation : " + SYNC.DOCS.readme.path, [
          "For more information visit " + main_default.MAKE(APP.website, main_default.style.TS_Bold, main_default.style.FG_Bright_White)
        ])
      );
    }
  }
}
var command_default = commander;

// typescript/index.ts
var fallback_name = "xcss";
var fallback_version = "0.0.0";
var fallback_website = "xcss.io";
var commandList = [
  "init",
  "debug",
  "preview",
  "publish",
  "archive",
  "install"
];
async function main() {
  const command = process.argv[2];
  const argument = process.argv[3];
  const workPath = fileman_default.path.resolves(".");
  const rootPath = fileman_default.path.fromOrigin(".");
  const originPackagePath = fileman_default.path.fromOrigin("package.json");
  const [
    originPackageJson,
    projectPackageJson
  ] = await Promise.all([
    await fileman_default.read.json(originPackagePath),
    await fileman_default.read.json("package.json")
  ]);
  if (!originPackageJson.status && typeof originPackageJson === "object") {
    console.error("Bad Origin package.json file.");
    process.exit(1);
  }
  const originPackageEssential = {
    name: typeof originPackageJson.data.name === "string" ? originPackageJson.data.name : fallback_name,
    version: typeof originPackageJson.data.version === "string" ? originPackageJson.data.version : fallback_version,
    website: typeof originPackageJson.data.homepage === "string" ? originPackageJson.data.homepage : fallback_website,
    bins: Object.keys(originPackageJson.data.bin ?? {}),
    scripts: typeof originPackageJson.data.scripts === "object" ? Object.entries(originPackageJson.data.scripts).reduce((A, [K, V]) => {
      if (typeof V === "string") {
        A[K] = V;
      }
      return A;
    }, {}) : {}
  };
  if (projectPackageJson.status && typeof projectPackageJson.data.scripts === "object" && commandList.includes(command)) {
    let addedCommands = 0;
    const scripts = projectPackageJson.data.scripts;
    for (const cmd of commandList) {
      if (originPackageEssential.scripts[cmd] && !scripts[cmd]) {
        addedCommands++;
        scripts[`${originPackageEssential.bins[0]}:${cmd}`] = originPackageEssential.scripts[cmd];
      }
    }
    if (addedCommands) {
      fileman_default.write.json("package.json", projectPackageJson.data);
    }
  }
  await command_default({
    command,
    argument,
    rootPath,
    workPath,
    originPackageEssential
  });
}
main();
/*! Bundled license information:

chokidar/index.js:
  (*! chokidar - MIT License (c) 2012 Paul Miller (paulmillr.com) *)
*/
