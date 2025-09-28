#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
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
  "node_modules/readdirp/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReaddirpStream = exports.EntryTypes = void 0;
    exports.readdirp = readdirp;
    exports.readdirpPromise = readdirpPromise;
    var promises_1 = __require("node:fs/promises");
    var node_stream_1 = __require("node:stream");
    var node_path_1 = __require("node:path");
    exports.EntryTypes = {
      FILE_TYPE: "files",
      DIR_TYPE: "directories",
      FILE_DIR_TYPE: "files_directories",
      EVERYTHING_TYPE: "all"
    };
    var defaultOptions = {
      root: ".",
      fileFilter: (_entryInfo) => true,
      directoryFilter: (_entryInfo) => true,
      type: exports.EntryTypes.FILE_TYPE,
      lstat: false,
      depth: 2147483648,
      alwaysStat: false,
      highWaterMark: 4096
    };
    Object.freeze(defaultOptions);
    var RECURSIVE_ERROR_CODE = "READDIRP_RECURSIVE_ERROR";
    var NORMAL_FLOW_ERRORS = /* @__PURE__ */ new Set(["ENOENT", "EPERM", "EACCES", "ELOOP", RECURSIVE_ERROR_CODE]);
    var ALL_TYPES = [
      exports.EntryTypes.DIR_TYPE,
      exports.EntryTypes.EVERYTHING_TYPE,
      exports.EntryTypes.FILE_DIR_TYPE,
      exports.EntryTypes.FILE_TYPE
    ];
    var DIR_TYPES = /* @__PURE__ */ new Set([
      exports.EntryTypes.DIR_TYPE,
      exports.EntryTypes.EVERYTHING_TYPE,
      exports.EntryTypes.FILE_DIR_TYPE
    ]);
    var FILE_TYPES = /* @__PURE__ */ new Set([
      exports.EntryTypes.EVERYTHING_TYPE,
      exports.EntryTypes.FILE_DIR_TYPE,
      exports.EntryTypes.FILE_TYPE
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
          this._stat = (path2) => statMethod(path2, { bigint: true });
        } else {
          this._stat = statMethod;
        }
        this._maxDepth = opts.depth ?? defaultOptions.depth;
        this._wantsDir = type ? DIR_TYPES.has(type) : false;
        this._wantsFile = type ? FILE_TYPES.has(type) : false;
        this._wantsEverything = type === exports.EntryTypes.EVERYTHING_TYPE;
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
              const { path: path2, depth } = par;
              const slice = fil.splice(0, batch).map((dirent) => this._formatEntry(dirent, path2));
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
      async _exploreDir(path2, depth) {
        let files;
        try {
          files = await (0, promises_1.readdir)(path2, this._rdOptions);
        } catch (error) {
          this._onError(error);
        }
        return { files, depth, path: path2 };
      }
      async _formatEntry(dirent, path2) {
        let entry;
        const basename = this._isDirent ? dirent.name : dirent;
        try {
          const fullPath = (0, node_path_1.resolve)((0, node_path_1.join)(path2, basename));
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
    exports.ReaddirpStream = ReaddirpStream;
    function readdirp(root2, options = {}) {
      let type = options.entryType || options.type;
      if (type === "both")
        type = exports.EntryTypes.FILE_DIR_TYPE;
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
    exports.default = readdirp;
  }
});

// node_modules/chokidar/handler.js
var require_handler = __commonJS({
  "node_modules/chokidar/handler.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NodeFsHandler = exports.EVENTS = exports.isIBMi = exports.isFreeBSD = exports.isLinux = exports.isMacos = exports.isWindows = exports.IDENTITY_FN = exports.EMPTY_FN = exports.STR_CLOSE = exports.STR_END = exports.STR_DATA = void 0;
    var fs_1 = __require("fs");
    var promises_1 = __require("fs/promises");
    var sysPath = __require("path");
    var os_1 = __require("os");
    exports.STR_DATA = "data";
    exports.STR_END = "end";
    exports.STR_CLOSE = "close";
    var EMPTY_FN = () => {
    };
    exports.EMPTY_FN = EMPTY_FN;
    var IDENTITY_FN = (val) => val;
    exports.IDENTITY_FN = IDENTITY_FN;
    var pl = process.platform;
    exports.isWindows = pl === "win32";
    exports.isMacos = pl === "darwin";
    exports.isLinux = pl === "linux";
    exports.isFreeBSD = pl === "freebsd";
    exports.isIBMi = (0, os_1.type)() === "OS400";
    exports.EVENTS = {
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
    var EV = exports.EVENTS;
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
    var addAndConvert = (main, prop, item) => {
      let container = main[prop];
      if (!(container instanceof Set)) {
        main[prop] = container = /* @__PURE__ */ new Set([container]);
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
    var delFromSet = (main, prop, item) => {
      const container = main[prop];
      if (container instanceof Set) {
        container.delete(item);
      } else if (container === item) {
        delete main[prop];
      }
    };
    var isEmptySet = (val) => val instanceof Set ? val.size === 0 : !val;
    var FsWatchInstances = /* @__PURE__ */ new Map();
    function createFsWatchInstance(path2, options, listener, errHandler, emitRaw) {
      const handleEvent = (rawEvent, evPath) => {
        listener(path2);
        emitRaw(rawEvent, evPath, { watchedPath: path2 });
        if (evPath && path2 !== evPath) {
          fsWatchBroadcast(sysPath.resolve(path2, evPath), KEY_LISTENERS, sysPath.join(path2, evPath));
        }
      };
      try {
        return (0, fs_1.watch)(path2, {
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
    var setFsWatchListener = (path2, fullPath, options, handlers) => {
      const { listener, errHandler, rawEmitter } = handlers;
      let cont = FsWatchInstances.get(fullPath);
      let watcher;
      if (!options.persistent) {
        watcher = createFsWatchInstance(path2, options, listener, errHandler, rawEmitter);
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
          path2,
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
          if (exports.isWindows && error.code === "EPERM") {
            try {
              const fd = await (0, promises_1.open)(path2, "r");
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
    var setFsWatchFileListener = (path2, fullPath, options, handlers) => {
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
              foreach(cont.listeners, (listener2) => listener2(path2, curr));
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
      _watchWithNodeFs(path2, listener) {
        const opts = this.fsw.options;
        const directory = sysPath.dirname(path2);
        const basename = sysPath.basename(path2);
        const parent = this.fsw._getWatchedDir(directory);
        parent.add(basename);
        const absolutePath = sysPath.resolve(path2);
        const options = {
          persistent: opts.persistent
        };
        if (!listener)
          listener = exports.EMPTY_FN;
        let closer;
        if (opts.usePolling) {
          const enableBin = opts.interval !== opts.binaryInterval;
          options.interval = enableBin && isBinaryPath(basename) ? opts.binaryInterval : opts.interval;
          closer = setFsWatchFileListener(path2, absolutePath, options, {
            listener,
            rawEmitter: this.fsw._emitRaw
          });
        } else {
          closer = setFsWatchListener(path2, absolutePath, options, {
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
        const listener = async (path2, newStats) => {
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
              if ((exports.isMacos || exports.isLinux || exports.isFreeBSD) && prevStats.ino !== newStats2.ino) {
                this.fsw._closeFile(path2);
                prevStats = newStats2;
                const closer2 = this._watchWithNodeFs(file, listener);
                if (closer2)
                  this.fsw._addPathCloser(path2, closer2);
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
      async _handleSymlink(entry, directory, path2, item) {
        if (this.fsw.closed) {
          return;
        }
        const full = entry.fullPath;
        const dir = this.fsw._getWatchedDir(directory);
        if (!this.fsw.options.followSymlinks) {
          this.fsw._incrReadyCount();
          let linkPath;
          try {
            linkPath = await (0, promises_1.realpath)(path2);
          } catch (e) {
            this.fsw._emitReady();
            return true;
          }
          if (this.fsw.closed)
            return;
          if (dir.has(item)) {
            if (this.fsw._symlinkPaths.get(full) !== linkPath) {
              this.fsw._symlinkPaths.set(full, linkPath);
              this.fsw._emit(EV.CHANGE, path2, entry.stats);
            }
          } else {
            dir.add(item);
            this.fsw._symlinkPaths.set(full, linkPath);
            this.fsw._emit(EV.ADD, path2, entry.stats);
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
        stream.on(exports.STR_DATA, async (entry) => {
          if (this.fsw.closed) {
            stream = void 0;
            return;
          }
          const item = entry.path;
          let path2 = sysPath.join(directory, item);
          current.add(item);
          if (entry.stats.isSymbolicLink() && await this._handleSymlink(entry, directory, path2, item)) {
            return;
          }
          if (this.fsw.closed) {
            stream = void 0;
            return;
          }
          if (item === target || !target && !previous.has(item)) {
            this.fsw._incrReadyCount();
            path2 = sysPath.join(dir, sysPath.relative(dir, path2));
            this._addToNodeFs(path2, initialAdd, wh, depth + 1);
          }
        }).on(EV.ERROR, this._boundHandleError);
        return new Promise((resolve, reject) => {
          if (!stream)
            return reject();
          stream.once(exports.STR_END, () => {
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
      async _addToNodeFs(path2, initialAdd, priorWh, depth, target) {
        const ready = this.fsw._emitReady;
        if (this.fsw._isIgnored(path2) || this.fsw.closed) {
          ready();
          return false;
        }
        const wh = this.fsw._getWatchHelpers(path2);
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
            const absPath = sysPath.resolve(path2);
            const targetPath = follow ? await (0, promises_1.realpath)(path2) : path2;
            if (this.fsw.closed)
              return;
            closer = await this._handleDir(wh.watchPath, stats, initialAdd, depth, target, wh, targetPath);
            if (this.fsw.closed)
              return;
            if (absPath !== targetPath && targetPath !== void 0) {
              this.fsw._symlinkPaths.set(absPath, targetPath);
            }
          } else if (stats.isSymbolicLink()) {
            const targetPath = follow ? await (0, promises_1.realpath)(path2) : path2;
            if (this.fsw.closed)
              return;
            const parent = sysPath.dirname(wh.watchPath);
            this.fsw._getWatchedDir(parent).add(wh.watchPath);
            this.fsw._emit(EV.ADD, wh.watchPath, stats);
            closer = await this._handleDir(parent, stats, initialAdd, depth, path2, wh, targetPath);
            if (this.fsw.closed)
              return;
            if (targetPath !== void 0) {
              this.fsw._symlinkPaths.set(sysPath.resolve(path2), targetPath);
            }
          } else {
            closer = this._handleFile(wh.watchPath, stats, initialAdd);
          }
          ready();
          if (closer)
            this.fsw._addPathCloser(path2, closer);
          return false;
        } catch (error) {
          if (this.fsw._handleError(error)) {
            ready();
            return path2;
          }
        }
      }
    };
    exports.NodeFsHandler = NodeFsHandler;
  }
});

// node_modules/chokidar/index.js
var require_chokidar = __commonJS({
  "node_modules/chokidar/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FSWatcher = exports.WatchHelper = void 0;
    exports.watch = watch;
    var fs_1 = __require("fs");
    var promises_1 = __require("fs/promises");
    var events_1 = __require("events");
    var sysPath = __require("path");
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
    function normalizePath(path2) {
      if (typeof path2 !== "string")
        throw new Error("string expected");
      path2 = sysPath.normalize(path2);
      path2 = path2.replace(/\\/g, "/");
      let prepend = false;
      if (path2.startsWith("//"))
        prepend = true;
      const DOUBLE_SLASH_RE2 = /\/\//;
      while (path2.match(DOUBLE_SLASH_RE2))
        path2 = path2.replace(DOUBLE_SLASH_RE2, "/");
      if (prepend)
        path2 = "/" + path2;
      return path2;
    }
    function matchPatterns(patterns, testString, stats) {
      const path2 = normalizePath(testString);
      for (let index = 0; index < patterns.length; index++) {
        const pattern = patterns[index];
        if (pattern(path2, stats)) {
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
    var normalizePathToUnix = (path2) => toUnix(sysPath.normalize(toUnix(path2)));
    var normalizeIgnored = (cwd = "") => (path2) => {
      if (typeof path2 === "string") {
        return normalizePathToUnix(sysPath.isAbsolute(path2) ? path2 : sysPath.join(cwd, path2));
      } else {
        return path2;
      }
    };
    var getAbsolutePath = (path2, cwd) => {
      if (sysPath.isAbsolute(path2)) {
        return path2;
      }
      return sysPath.join(cwd, path2);
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
      constructor(path2, follow, fsw) {
        this.fsw = fsw;
        const watchPath = path2;
        this.path = path2 = path2.replace(REPLACER_RE, "");
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
    exports.WatchHelper = WatchHelper;
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
          paths = paths.map((path2) => {
            const absPath = getAbsolutePath(path2, cwd);
            return absPath;
          });
        }
        paths.forEach((path2) => {
          this._removeIgnoredPath(path2);
        });
        this._userIgnored = void 0;
        if (!this._readyCount)
          this._readyCount = 0;
        this._readyCount += paths.length;
        Promise.all(paths.map(async (path2) => {
          const res = await this._nodeFsHandler._addToNodeFs(path2, !_internal, void 0, 0, _origAdd);
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
        paths.forEach((path2) => {
          if (!sysPath.isAbsolute(path2) && !this._closers.has(path2)) {
            if (cwd)
              path2 = sysPath.join(cwd, path2);
            path2 = sysPath.resolve(path2);
          }
          this._closePath(path2);
          this._addIgnoredPath(path2);
          if (this._watched.has(path2)) {
            this._addIgnoredPath({
              path: path2,
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
      async _emit(event, path2, stats) {
        if (this.closed)
          return;
        const opts = this.options;
        if (handler_js_1.isWindows)
          path2 = sysPath.normalize(path2);
        if (opts.cwd)
          path2 = sysPath.relative(opts.cwd, path2);
        const args = [path2];
        if (stats != null)
          args.push(stats);
        const awf = opts.awaitWriteFinish;
        let pw;
        if (awf && (pw = this._pendingWrites.get(path2))) {
          pw.lastChange = /* @__PURE__ */ new Date();
          return this;
        }
        if (opts.atomic) {
          if (event === handler_js_1.EVENTS.UNLINK) {
            this._pendingUnlinks.set(path2, [event, ...args]);
            setTimeout(() => {
              this._pendingUnlinks.forEach((entry, path3) => {
                this.emit(...entry);
                this.emit(handler_js_1.EVENTS.ALL, ...entry);
                this._pendingUnlinks.delete(path3);
              });
            }, typeof opts.atomic === "number" ? opts.atomic : 100);
            return this;
          }
          if (event === handler_js_1.EVENTS.ADD && this._pendingUnlinks.has(path2)) {
            event = handler_js_1.EVENTS.CHANGE;
            this._pendingUnlinks.delete(path2);
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
          this._awaitWriteFinish(path2, awf.stabilityThreshold, event, awfEmit);
          return this;
        }
        if (event === handler_js_1.EVENTS.CHANGE) {
          const isThrottled = !this._throttle(handler_js_1.EVENTS.CHANGE, path2, 50);
          if (isThrottled)
            return this;
        }
        if (opts.alwaysStat && stats === void 0 && (event === handler_js_1.EVENTS.ADD || event === handler_js_1.EVENTS.ADD_DIR || event === handler_js_1.EVENTS.CHANGE)) {
          const fullPath = opts.cwd ? sysPath.join(opts.cwd, path2) : path2;
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
      _throttle(actionType, path2, timeout) {
        if (!this._throttled.has(actionType)) {
          this._throttled.set(actionType, /* @__PURE__ */ new Map());
        }
        const action = this._throttled.get(actionType);
        if (!action)
          throw new Error("invalid throttle");
        const actionPath = action.get(path2);
        if (actionPath) {
          actionPath.count++;
          return false;
        }
        let timeoutObject;
        const clear = () => {
          const item = action.get(path2);
          const count = item ? item.count : 0;
          action.delete(path2);
          clearTimeout(timeoutObject);
          if (item)
            clearTimeout(item.timeoutObject);
          return count;
        };
        timeoutObject = setTimeout(clear, timeout);
        const thr = { timeoutObject, clear, count: 0 };
        action.set(path2, thr);
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
      _awaitWriteFinish(path2, threshold, event, awfEmit) {
        const awf = this.options.awaitWriteFinish;
        if (typeof awf !== "object")
          return;
        const pollInterval = awf.pollInterval;
        let timeoutHandler;
        let fullPath = path2;
        if (this.options.cwd && !sysPath.isAbsolute(path2)) {
          fullPath = sysPath.join(this.options.cwd, path2);
        }
        const now = /* @__PURE__ */ new Date();
        const writes = this._pendingWrites;
        function awaitWriteFinishFn(prevStat) {
          (0, fs_1.stat)(fullPath, (err, curStat) => {
            if (err || !writes.has(path2)) {
              if (err && err.code !== "ENOENT")
                awfEmit(err);
              return;
            }
            const now2 = Number(/* @__PURE__ */ new Date());
            if (prevStat && curStat.size !== prevStat.size) {
              writes.get(path2).lastChange = now2;
            }
            const pw = writes.get(path2);
            const df = now2 - pw.lastChange;
            if (df >= threshold) {
              writes.delete(path2);
              awfEmit(void 0, curStat);
            } else {
              timeoutHandler = setTimeout(awaitWriteFinishFn, pollInterval, curStat);
            }
          });
        }
        if (!writes.has(path2)) {
          writes.set(path2, {
            lastChange: now,
            cancelWait: () => {
              writes.delete(path2);
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
      _isIgnored(path2, stats) {
        if (this.options.atomic && DOT_RE.test(path2))
          return true;
        if (!this._userIgnored) {
          const { cwd } = this.options;
          const ign = this.options.ignored;
          const ignored = (ign || []).map(normalizeIgnored(cwd));
          const ignoredPaths = [...this._ignoredPaths];
          const list = [...ignoredPaths.map(normalizeIgnored(cwd)), ...ignored];
          this._userIgnored = anymatch(list, void 0);
        }
        return this._userIgnored(path2, stats);
      }
      _isntIgnored(path2, stat) {
        return !this._isIgnored(path2, stat);
      }
      /**
       * Provides a set of common helpers and properties relating to symlink handling.
       * @param path file or directory pattern being watched
       */
      _getWatchHelpers(path2) {
        return new WatchHelper(path2, this.options.followSymlinks, this);
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
        const path2 = sysPath.join(directory, item);
        const fullPath = sysPath.resolve(path2);
        isDirectory = isDirectory != null ? isDirectory : this._watched.has(path2) || this._watched.has(fullPath);
        if (!this._throttle("remove", path2, 100))
          return;
        if (!isDirectory && this._watched.size === 1) {
          this.add(directory, item, true);
        }
        const wp = this._getWatchedDir(path2);
        const nestedDirectoryChildren = wp.getChildren();
        nestedDirectoryChildren.forEach((nested) => this._remove(path2, nested));
        const parent = this._getWatchedDir(directory);
        const wasTracked = parent.has(item);
        parent.remove(item);
        if (this._symlinkPaths.has(fullPath)) {
          this._symlinkPaths.delete(fullPath);
        }
        let relPath = path2;
        if (this.options.cwd)
          relPath = sysPath.relative(this.options.cwd, path2);
        if (this.options.awaitWriteFinish && this._pendingWrites.has(relPath)) {
          const event = this._pendingWrites.get(relPath).cancelWait();
          if (event === handler_js_1.EVENTS.ADD)
            return;
        }
        this._watched.delete(path2);
        this._watched.delete(fullPath);
        const eventName = isDirectory ? handler_js_1.EVENTS.UNLINK_DIR : handler_js_1.EVENTS.UNLINK;
        if (wasTracked && !this._isIgnored(path2))
          this._emit(eventName, path2);
        this._closePath(path2);
      }
      /**
       * Closes all watchers for a path
       */
      _closePath(path2) {
        this._closeFile(path2);
        const dir = sysPath.dirname(path2);
        this._getWatchedDir(dir).remove(sysPath.basename(path2));
      }
      /**
       * Closes only file-specific watchers
       */
      _closeFile(path2) {
        const closers = this._closers.get(path2);
        if (!closers)
          return;
        closers.forEach((closer) => closer());
        this._closers.delete(path2);
      }
      _addPathCloser(path2, closer) {
        if (!closer)
          return;
        let list = this._closers.get(path2);
        if (!list) {
          list = [];
          this._closers.set(path2, list);
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
    exports.FSWatcher = FSWatcher;
    function watch(paths, options = {}) {
      const watcher = new FSWatcher(options);
      watcher.add(paths);
      return watcher;
    }
    exports.default = { watch, FSWatcher };
  }
});

// ts/fileman.ts
import fs from "fs";
import path from "path";

// ts/utils/string.ts
var ALPHANUMERIC = /[a-z0-9]/gi;
var SPACE = /\s+/g;
var AT = /@+/g;
var string_default = {
  normalize: (string = "", keepChars = [], skipChars = [], addBackSlashFor = []) => {
    let final = "";
    string.replace(SPACE, "_").replace(AT, "_").split("").forEach((ch) => {
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
    const digits = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const base = digits.length;
    let result = "", reminder = 0;
    number += 512;
    while (number) {
      reminder = number % base;
      result = digits[reminder] + result;
      number = Math.floor(number / base);
    }
    return result;
  },
  stringMem: (string) => Number((string.length / 1024).toFixed(2))
};

// ts/utils/object.ts
function innerMerge(target, source, aggressive = false, arrayMerge = false) {
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
function bulkMerge(objectArray = [], aggressive = false, arrayMerge = false) {
  if (!Array.isArray(objectArray) || objectArray.length === 0) {
    return {};
  }
  return objectArray.reduce(
    (result, obj) => innerMerge(structuredClone(result), obj, aggressive, arrayMerge),
    {}
  );
}
function skeleton(object = {}) {
  return Object.entries(object).reduce((result, [k, v]) => {
    if (typeof v === "object") {
      result[k] = skeleton(v);
    } else if (k.startsWith("--") && typeof v === "string") {
      result[k] = v;
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
  onlyB: ObjectDelta,
  multiMerge: bulkMerge
};
var object_default = utils;

// ts/utils/array.ts
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

// ts/utils/code.ts
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
function stripComments(content, single = true, multi = true, html = true) {
  const result = [];
  let i = 0;
  while (i < content.length) {
    const char = content[i];
    if (single && char === "/" && i + 1 < content.length && content[i + 1] === "/" && !isInString(content, i)) {
      i += 2;
      while (i < content.length && content[i] !== "\n") {
        i++;
      }
      continue;
    }
    if (multi && char === "/" && i + 1 < content.length && content[i + 1] === "*" && !isInString(content, i)) {
      i += 2;
      while (i + 1 < content.length && !(content[i] === "*" && content[i + 1] === "/")) {
        i++;
      }
      i += 2;
      continue;
    }
    if (html && char === "<" && i + 3 < content.length && content.substring(i, i + 4) === "<!--" && !isInString(content, i)) {
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

// ts/utils/color.ts
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

// ts/utils/main.ts
var main_default = {
  string: string_default,
  object: object_default,
  array: array_default,
  code: code_default,
  color: color_default
};

// ts/fileman.ts
import { fileURLToPath } from "url";
var root = path.resolve(fileURLToPath(import.meta.url), "..", "..", "..");
var fileman = {
  path: {
    basename: (pathString) => {
      return path.basename(pathString);
    },
    /**
     * Joins multiple path segments together.
     * @param pathString1 The first path segment.
     * @param pathString2 The second path segment.
     * @returns The joined path string.
     */
    join: (...pathFrags) => {
      return path.join(...pathFrags);
    },
    /**
     * Joins path segments to the calculated root directory of the project.
     * @param pathStrings - Multiple path segments to join.
     * @returns The absolute path from the project root.
     */
    fromOrigin: (...pathStrings) => {
      return path.join(root, ...pathStrings);
    },
    /**
     * Resolves a sequence of paths or path segments into an absolute path.
     * @param pathString The path string to resolve.
     * @returns The resolved absolute path.
     */
    resolves: (pathString) => {
      return path.resolve(pathString);
    },
    /**
     * Checks if a given path exists and determines its type (file or folder).
     * @param pathString The path to check.
     * @returns An object indicating existence and  TYPE.
     */
    available: (pathString) => {
      try {
        const stats = fs.statSync(pathString);
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
      const relative1 = path.relative(folder1, folder2);
      const relative2 = path.relative(folder2, folder1);
      const notInside = (relative) => relative && relative.startsWith("..") || path.isAbsolute(relative);
      return notInside(relative1) && notInside(relative2);
    },
    /**
     * Recursively lists all files in a directory.
     * @param dir The directory to list files from.
     * @param fileList An optional array to accumulate file paths (for recursion).
     * @returns A promise that resolves to an array of file paths.
     */
    listFiles: async (dir, fileList = []) => {
      if (!fs.existsSync(dir)) {
        return fileList;
      }
      const files = await fs.promises.readdir(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = await fs.promises.stat(filePath);
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
      if (!fs.existsSync(dir)) {
        return folderList;
      }
      const files = await fs.promises.readdir(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = await fs.promises.stat(filePath);
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
      if (!fs.existsSync(source)) {
        throw new Error("Target folder does not exist.\n" + source);
      }
      const copyRecursiveAsync = async (src, dest) => {
        const stats = await fs.promises.stat(src);
        if (stats.isDirectory()) {
          await fs.promises.mkdir(dest, { recursive: true });
          const children = await fs.promises.readdir(src);
          for (const child of children) {
            const childSrc = path.join(src, child);
            const childDest = path.join(dest, child);
            if (!ignoreFiles.includes(childSrc)) {
              await copyRecursiveAsync(childSrc, childDest);
            }
          }
        } else if (!ignoreFiles.includes(src)) {
          await fs.promises.copyFile(src, dest);
        }
      };
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
      const destinationFiles = fs.existsSync(destination) ? [
        ...await fileman.path.listFiles(destination),
        ...await fileman.path.listFolders(destination)
      ].map(
        (file) => path.join(source, file.replace(destination, ""))
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
          if (!fs.existsSync(target)) {
            throw new Error(`File does not exist: ${target}`);
          }
          const fileData = await fs.promises.readFile(target, "utf8");
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
          if (!fs.existsSync(target)) {
            throw new Error(`File does not exist: ${target}`);
          }
          const fileContent = await fs.promises.readFile(target, "utf8");
          const cleanedContent = main_default.code.uncomment.Script(fileContent);
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
        if (desiredExtensions.includes(path.extname(file)) || desiredExtensions.length === 0) {
          result[file] = await fs.promises.readFile(file, "utf-8");
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
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          await fs.promises.mkdir(dir, { recursive: true });
        }
        await fs.promises.writeFile(filePath, content, "utf8");
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
        const dir = path.dirname(pathString);
        if (!fs.existsSync(dir)) {
          await fs.promises.mkdir(dir, { recursive: true });
        }
        await fs.promises.writeFile(
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
      }
      const current = await fileman.read.file(localPath);
      if (current.status) {
        return current.data;
      }
      await fileman.write.file(localPath, latest.data);
      return "";
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
      const sourceExists = fs.existsSync(source);
      const targetExists = fs.existsSync(target);
      if (!sourceExists && !targetExists) {
        return { status: false, fileContents: {} };
      }
      if (!targetExists) {
        await fileman.clone.hard(source, target);
      } else if (!sourceExists) {
        await fileman.clone.hard(target, source);
      }
      const targetFiles = await fileman.path.listFiles(target);
      const relativeTargetFiles = targetFiles.map((file) => path.relative(target, file)).filter(
        (file) => !fileExcludes.some((ignore) => file.startsWith(ignore))
      );
      const sourceFiles = await fileman.path.listFiles(source);
      const relativeSourceFiles = sourceFiles.map((file) => path.relative(source, file)).filter(
        (file) => !fileExcludes.some((ignore) => file.startsWith(ignore))
      );
      for (const file of relativeTargetFiles) {
        if (!relativeSourceFiles.includes(file) || unsyncExtensions.includes(path.extname(file))) {
          await fs.promises.unlink(path.join(target, file));
        }
      }
      for (const file of relativeSourceFiles) {
        const sourceFilePath = path.join(source, file);
        const targetFilePath = path.join(target, file);
        const targetDirPath = path.dirname(targetFilePath);
        if (!fs.existsSync(targetDirPath)) {
          await fs.promises.mkdir(targetDirPath, { recursive: true });
        }
        if (includeExtensions.includes(path.extname(file))) {
          result.fileContents[file] = await fs.promises.readFile(
            sourceFilePath,
            "utf-8"
          );
        } else {
          await fs.promises.copyFile(sourceFilePath, targetFilePath);
        }
      }
      const targetFolders = (await fileman.path.listFolders(target)).map((folder) => path.relative(target, folder)).filter((value, index, self) => self.indexOf(value) === index);
      for (const folder of targetFolders) {
        const targetFolderPath = path.join(target, folder);
        const sourceFolderPath = path.join(source, folder);
        if (fs.existsSync(targetFolderPath) && !fs.existsSync(sourceFolderPath)) {
          const filesInTargetFolder = await fs.promises.readdir(targetFolderPath);
          if (filesInTargetFolder.length === 0) {
            await fs.promises.rm(targetFolderPath, { recursive: true, force: true });
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
        if (fs.existsSync(pathToDelete)) {
          const stats = await fs.promises.stat(pathToDelete);
          if (stats.isDirectory()) {
            await fs.promises.rm(pathToDelete, {
              recursive: true,
              force: true
            });
          } else {
            await fs.promises.unlink(pathToDelete);
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
        if (!fs.existsSync(folderPath)) {
          return { success: false, message: "Folder does not exist." };
        }
        const files = await fileman.path.listFiles(folderPath);
        for (const file of files) {
          if (ignorePaths.includes(file)) {
            continue;
          }
          if (extensions.length === 0 || extensions.includes(path.extname(file).substring(1))) {
            await fs.promises.unlink(file);
          }
        }
        const folders = await fileman.path.listFolders(folderPath);
        for (let i = folders.length - 1; i >= 0; i--) {
          const subFolder = folders[i];
          if (ignorePaths.includes(subFolder)) {
            continue;
          }
          const filesInSubFolder = await fs.promises.readdir(subFolder);
          if (filesInSubFolder.length === 0) {
            await fs.promises.rm(subFolder, { recursive: true, force: true });
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

// ts/shell/play/main.ts
var main_exports = {};
__export(main_exports, {
  Loki: () => Loki,
  Title: () => Title
});

// ts/shell/render.ts
var render_exports = {};
__export(render_exports, {
  animate: () => animate,
  backspace: () => backspace,
  write: () => write
});
import readline from "readline";
function backspace(chars) {
  if (chars <= 0) {
    return;
  }
  readline.moveCursor(process.stdout, -chars, 0);
  readline.clearLine(process.stdout, 1);
}
function write(string = "", backRows = 0) {
  if (backRows > 0) {
    readline.moveCursor(process.stdout, 0, -backRows);
    readline.clearScreenDown(process.stdout);
  } else if (backRows < 0) {
    console.clear();
  }
  const rowsCreated = string.split("\n").length;
  console.log(string);
  return rowsCreated;
}
function animate(frames = [], duration = 1e3, repeat = 0) {
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
}

// ts/shell/style.ts
var style_exports = {};
__export(style_exports, {
  AR_2Underline: () => AR_2Underline,
  AR_blinking: () => AR_blinking,
  AR_hidden: () => AR_hidden,
  AR_intensity: () => AR_intensity,
  AR_inverted: () => AR_inverted,
  AR_italic: () => AR_italic,
  AR_struck: () => AR_struck,
  AR_underline: () => AR_underline,
  AS_Blink_Fast: () => AS_Blink_Fast,
  AS_Blink_Slow: () => AS_Blink_Slow,
  AS_Bold: () => AS_Bold,
  AS_Dim: () => AS_Dim,
  AS_Hidden: () => AS_Hidden,
  AS_Italic: () => AS_Italic,
  AS_Rare: () => AS_Rare,
  AS_Reverse: () => AS_Reverse,
  AS_Strikethrough: () => AS_Strikethrough,
  AS_Underline: () => AS_Underline,
  TB_Bright_Black: () => TB_Bright_Black,
  TB_Bright_Blue: () => TB_Bright_Blue,
  TB_Bright_Cyan: () => TB_Bright_Cyan,
  TB_Bright_Green: () => TB_Bright_Green,
  TB_Bright_Magenta: () => TB_Bright_Magenta,
  TB_Bright_Red: () => TB_Bright_Red,
  TB_Bright_White: () => TB_Bright_White,
  TB_Bright_Yellow: () => TB_Bright_Yellow,
  TB_Normal_Black: () => TB_Normal_Black,
  TB_Normal_Blue: () => TB_Normal_Blue,
  TB_Normal_Cyan: () => TB_Normal_Cyan,
  TB_Normal_Green: () => TB_Normal_Green,
  TB_Normal_Magenta: () => TB_Normal_Magenta,
  TB_Normal_Red: () => TB_Normal_Red,
  TB_Normal_White: () => TB_Normal_White,
  TB_Normal_Yellow: () => TB_Normal_Yellow,
  TC_Bright_Black: () => TC_Bright_Black,
  TC_Bright_Blue: () => TC_Bright_Blue,
  TC_Bright_Cyan: () => TC_Bright_Cyan,
  TC_Bright_Green: () => TC_Bright_Green,
  TC_Bright_Magenta: () => TC_Bright_Magenta,
  TC_Bright_Red: () => TC_Bright_Red,
  TC_Bright_White: () => TC_Bright_White,
  TC_Bright_Yellow: () => TC_Bright_Yellow,
  TC_Normal_Black: () => TC_Normal_Black,
  TC_Normal_Blue: () => TC_Normal_Blue,
  TC_Normal_Cyan: () => TC_Normal_Cyan,
  TC_Normal_Green: () => TC_Normal_Green,
  TC_Normal_Magenta: () => TC_Normal_Magenta,
  TC_Normal_Red: () => TC_Normal_Red,
  TC_Normal_White: () => TC_Normal_White,
  TC_Normal_Yellow: () => TC_Normal_Yellow
});
var AS_Bold = "1";
var AS_Dim = "2";
var AS_Italic = "3";
var AS_Underline = "4";
var AS_Blink_Slow = "5";
var AS_Blink_Fast = "6";
var AS_Reverse = "7";
var AS_Hidden = "8";
var AS_Strikethrough = "9";
var AS_Rare = "20";
var AR_2Underline = "21";
var AR_intensity = "22";
var AR_italic = "23";
var AR_underline = "24";
var AR_blinking = "25";
var AR_inverted = "27";
var AR_hidden = "28";
var AR_struck = "29";
var TB_Normal_Black = "40";
var TB_Normal_Red = "41";
var TB_Normal_Green = "42";
var TB_Normal_Yellow = "43";
var TB_Normal_Blue = "44";
var TB_Normal_Magenta = "45";
var TB_Normal_Cyan = "46";
var TB_Normal_White = "47";
var TB_Bright_Black = "100";
var TB_Bright_Red = "101";
var TB_Bright_Green = "102";
var TB_Bright_Yellow = "103";
var TB_Bright_Blue = "104";
var TB_Bright_Magenta = "105";
var TB_Bright_Cyan = "106";
var TB_Bright_White = "107";
var TC_Normal_Black = "30";
var TC_Normal_Red = "31";
var TC_Normal_Green = "32";
var TC_Normal_Yellow = "33";
var TC_Normal_Blue = "34";
var TC_Normal_Magenta = "35";
var TC_Normal_Cyan = "36";
var TC_Normal_White = "37";
var TC_Bright_Black = "90";
var TC_Bright_Red = "91";
var TC_Bright_Green = "92";
var TC_Bright_Yellow = "93";
var TC_Bright_Blue = "94";
var TC_Bright_Magenta = "95";
var TC_Bright_Cyan = "96";
var TC_Bright_White = "97";

// ts/shell/tag.ts
var tag_exports = {};
__export(tag_exports, {
  Br: () => Br,
  H1: () => H1,
  H2: () => H2,
  H3: () => H3,
  H4: () => H4,
  H5: () => H5,
  H6: () => H6,
  Hr: () => Hr,
  Li: () => Li,
  P: () => P,
  Span: () => Span,
  Tab: () => Tab
});

// ts/shell/root.ts
var canvas = {
  config: {
    taskActive: true,
    postActive: true,
    tabSpace: 2
  },
  divider: {
    top: "\u203E",
    mid: "\u2500",
    btm: "_"
  },
  tab: " ",
  width: () => typeof process.stdout.columns === "number" ? process.stdout.columns : 48
};
var preset = {
  title: [TC_Normal_Green],
  text: [TC_Normal_White],
  link: [AS_Underline],
  primary: [TC_Normal_Yellow],
  secondary: [TC_Normal_Yellow],
  tertiary: [TC_Bright_Black],
  warning: [TC_Normal_Yellow],
  success: [TC_Normal_Green],
  failed: [TC_Normal_Red]
};
function init(taskActive = true, postActive = true, tabWidth = 2) {
  const width = canvas.width();
  canvas.tab = canvas.tab[0].repeat(tabWidth);
  canvas.config.taskActive = taskActive;
  canvas.config.postActive = postActive;
  canvas.divider.btm = canvas.divider.btm[0].repeat(width);
  canvas.divider.mid = canvas.divider.mid[0].repeat(width);
  canvas.divider.top = canvas.divider.top[0].repeat(width);
}
function fmt(string = "", ...styles) {
  return styles.length ? `\x1B[${styles.join(";")}m${string}\x1B[0m` : string;
}
function post(string, ...styles) {
  write(fmt(string, ...styles));
}

// ts/shell/tag.ts
function H1(content = "", presets = [], ...styles) {
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
  return fmt(["", canvas.divider.mid, ...paddedLines, canvas.divider.mid, ""].join("\n"), ...presets, ...styles);
}
function H2(content = "", presets = [], ...styles) {
  return fmt([canvas.divider.mid, content, canvas.divider.mid, ""].join("\n"), ...presets, ...styles);
}
function H3(content = "", presets = [], ...styles) {
  return fmt(["", content, canvas.divider.mid].join("\n"), ...presets, ...styles);
}
function H4(content = "", presets = [], ...styles) {
  return fmt([canvas.divider.mid, content, ""].join("\n"), ...presets, ...styles);
}
function H5(content = "", presets = [], ...styles) {
  return fmt([content + canvas.tab + canvas.divider.mid[0].repeat(canvas.width() - canvas.tab.length - content.length), ""].join("\n"), ...presets, ...styles);
}
function H6(content = "", presets = [], ...styles) {
  return fmt([canvas.divider.mid[0].repeat(canvas.width() - canvas.tab.length - content.length) + canvas.tab + content].join("\n"), ...presets, ...styles);
}
function P(content = "", presets = [], ...styles) {
  return fmt(canvas.tab + content, ...presets, ...styles) + "\n";
}
function Span(content = "", presets = [], ...styles) {
  return fmt(content, ...presets, ...styles);
}
function Li(content = "", presets = [], ...styles) {
  return fmt(">" + canvas.tab + content, ...presets, ...styles);
}
function Hr(content = canvas.divider.mid[0], presets = [], ...styles) {
  return fmt("\n" + content.repeat(Math.ceil(canvas.width() / content.length)).slice(0, canvas.width()), ...presets, ...styles);
}
function Br(repeat = 1, presets = [], ...styles) {
  return fmt("\n".repeat(repeat < 0 ? 0 : repeat), ...presets, ...styles);
}
function Tab(repeat = 1, presets = [], ...styles) {
  return fmt(canvas.tab.repeat(repeat < 0 ? 0 : repeat), ...presets, ...styles);
}

// ts/shell/play/0.title.ts
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
      fmt(canvas.divider.top, AS_Bold, AS_Underline, ...preset.title),
      "",
      ""
    ]),
    ...new Array(previewFrames).fill([
      "",
      canvas.divider.btm,
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
      canvas.divider.btm,
      ""
    ])
  ].map((frame) => fmt(frame.join("\n"), AS_Bold, ...preset.title));
  string = "   " + string + "   ";
  while (string.length !== 1 && string.length !== 2) {
    string = modifyString(string);
    renders.unshift(
      fmt(H1(string, []), AS_Bold, ...preset.title)
    );
  }
  return preview.concat(renders);
};

// ts/shell/play/1.loki.ts
var loki_default = (string, frames = 1) => {
  const characters = Math.floor(Math.random() * string.length);
  const styles = Object.keys(style_exports);
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
      const styledCharacter = fmt(string[randomIndex], randomStyle);
      styledString = styledString.substring(0, randomIndex) + styledCharacter + styledString.substring(randomIndex + 1);
    }
    renders.push(styledString);
  }
  return renders;
};

// ts/shell/play/main.ts
function Title(string, duration, frames = 1) {
  return new Promise((resolve) => {
    resolve(animate(title_default(string), duration, frames));
  });
}
function Loki(string, duration, frames = 50) {
  return new Promise((resolve) => {
    resolve(animate(loki_default(string, frames), duration, 0));
  });
}

// ts/shell/list.ts
var list_exports = {};
__export(list_exports, {
  Blocks: () => Blocks,
  Bullets: () => Bullets,
  Catalog: () => Catalog,
  Level: () => Level,
  Numbers: () => Numbers,
  Paragraphs: () => Paragraphs,
  Waterfall: () => Waterfall
});
var Bullets = (items = [], intent = 0, preset2 = [], ...styles) => {
  intent = intent < 0 ? 0 : intent;
  return items.map((item) => Tab(intent) + fmt(Li(item), ...preset2, ...styles));
};
var Numbers = (items = [], intent = 0, preset2 = [], ...styles) => {
  intent = intent < 0 ? 0 : intent;
  return items.map(
    (item, index) => Tab(intent) + fmt(String(index + 1) + Tab() + fmt(item), ...preset2, ...styles)
  );
};
var Level = (items = [], intent = 0, preset2 = [], ...styles) => {
  intent = intent < 0 ? 0 : intent;
  const keyLength = items.reduce((max, key) => key.length > max ? key.length : max, 0);
  return items.map((key) => Tab(intent) + fmt(key.padEnd(keyLength) + Tab(), ...preset2, ...styles));
};
var Paragraphs = (items = [], intent = 0, preset2 = [], ...styles) => {
  intent = intent < 0 ? 0 : intent;
  return items.map((item) => Tab(intent) + fmt(P(item), ...preset2, ...styles));
};
var Blocks = (items = [], intent = 0, preset2 = [], ...styles) => {
  intent = intent < 0 ? 0 : intent;
  return items.map((item) => "\n".repeat(intent) + fmt(item, ...preset2, ...styles));
};
var Waterfall = (items = [], intent = 0, preset2 = [], ...styles) => {
  intent = intent < 0 ? 0 : intent;
  return items.map((item, key) => {
    return Tab(intent) + fmt((key === items.length - 1 ? " \u2514\u2500> " : " \u251C\u2500> ") + Tab() + item, ...preset2, ...styles);
  });
};
var Catalog = (items = [], intent = 0, preset2 = [], ...styles) => {
  intent = intent < 0 ? 0 : intent;
  const prefix = Tab(intent);
  const size = items.reduce((l, i) => {
    if (i.length > l) {
      l = i.length;
    }
    return l;
  }, 0);
  const cols = Math.floor((canvas.width() - prefix.length + Tab().length) / (size + Tab().length));
  const result = [];
  let subResult = "";
  items.forEach((item, index) => {
    if ((index + 1) % cols === 0) {
      subResult += fmt(item.padEnd(size), ...preset2, ...styles);
      result.push(subResult);
      subResult = "";
    } else {
      subResult += fmt(item.padEnd(size), ...preset2, ...styles) + Tab();
    }
  });
  if (subResult.length) {
    result.push(subResult);
  }
  return result.map((i) => prefix + i);
};

// ts/shell/main.ts
function task(string, rowshift = -1) {
  if (canvas.config.taskActive && canvas.config.postActive) {
    write(
      [
        rowshift >= 0 ? Br(rowshift) : "",
        fmt(">>>", AS_Bold, ...preset.primary),
        canvas.tab,
        fmt(string + ".", AS_Bold, AS_Italic, ...preset.tertiary),
        Br(1)
      ].join(""),
      rowshift < 0 ? -rowshift : rowshift
    );
  }
}
function step(string, rowshift = -1) {
  if (canvas.config.taskActive && canvas.config.postActive) {
    write(
      [
        rowshift >= 0 ? Br(rowshift) : "",
        fmt(">>>", AS_Rare, ...preset.primary),
        canvas.tab,
        fmt(string + " ...", AS_Italic, ...preset.tertiary)
      ].join(""),
      rowshift < 0 ? -rowshift : rowshift
    );
  }
}
function MAKE(heading, contents = [], ...listDeplyment) {
  const modContents = listDeplyment.reduce((A, [type, intent, preset2, ...styles]) => {
    A = type(A, intent, preset2, ...styles);
    return A;
  }, contents);
  if (contents.length) {
    modContents.push(fmt());
  }
  return (
    // heading.length ?
    [
      fmt(heading, AS_Bold),
      ...modContents
    ].join("\n")
  );
}
var main_default2 = {
  tag: tag_exports,
  list: list_exports,
  render: render_exports,
  init,
  canvas,
  preset,
  style: style_exports,
  PLAY: main_exports,
  MAKE,
  POST: post,
  TASK: task,
  STEP: step,
  FMT: fmt
};

// ts/shell.ts
function ListProps(record, keystyles = [], valstyles = []) {
  const keys = [];
  const values = [];
  Object.entries(record).forEach(([k, v]) => {
    keys.push(main_default2.FMT(k, ...keystyles));
    values.push(main_default2.FMT(v, ...valstyles));
  });
  return main_default2.list.Level(keys).map((k, i) => k + ": " + main_default2.FMT(values[i], ...valstyles));
}
function ListSteps(heading, steps) {
  return main_default2.MAKE(
    main_default2.tag.H2(heading, main_default2.preset.primary),
    steps,
    [main_default2.list.Bullets, 0, []]
  );
}
function ListRecord(heading, record = {}) {
  return main_default2.MAKE(
    main_default2.tag.H2(heading, main_default2.preset.primary),
    ListProps(record, main_default2.preset.primary, main_default2.preset.text),
    [main_default2.list.Bullets, 0, main_default2.preset.primary]
  );
}
function ListCatalog(heading, items = []) {
  return main_default2.MAKE(
    main_default2.tag.H2(heading, main_default2.preset.primary),
    items,
    [main_default2.list.Catalog, 0, []]
  );
}
function ClassChart(heading, items) {
  return Object.keys(items).length ? main_default2.MAKE(
    main_default2.tag.H2(heading, main_default2.preset.primary),
    Object.entries(items).map(
      ([heading2, entries]) => main_default2.MAKE(
        main_default2.tag.H6(heading2, main_default2.preset.tertiary),
        entries,
        [main_default2.list.Catalog, 0, main_default2.preset.primary]
      )
    )
  ) : "";
}
function HashruleError(primitive, cause, source, message, preview) {
  preview["ERROR BY"] = main_default2.FMT(cause, main_default2.style.AS_Bold, main_default2.style.TC_Normal_Red);
  const error = main_default2.tag.Li(main_default2.FMT(source, ...main_default2.preset.tertiary), main_default2.preset.failed, main_default2.style.AS_Bold) + "\n " + main_default2.tag.Tab(1) + main_default2.MAKE(
    main_default2.FMT(primitive, ...main_default2.preset.primary) + " : " + main_default2.FMT(message, ...main_default2.preset.failed),
    ListProps(preview, main_default2.preset.primary, main_default2.preset.tertiary),
    [main_default2.list.Waterfall, 1, main_default2.preset.primary]
  );
  preview["ERROR BY"] = cause;
  const diagnostic = {
    message: main_default2.MAKE(
      primitive + " : " + message,
      ListProps(preview),
      [main_default2.list.Waterfall, 0, []]
    ),
    sources: [source]
  };
  return {
    error,
    diagnostic
  };
}
function HashruleReport(hashrule, errors) {
  return main_default2.MAKE(
    ListRecord(
      "Active Hashrule",
      hashrule
    ),
    errors.length ? [
      main_default2.MAKE(
        main_default2.tag.H4("Invalid Hashrule", main_default2.preset.failed),
        errors
      )
    ] : []
  );
}
function GenerateError(message, declaration) {
  return {
    error: main_default2.MAKE(
      main_default2.tag.Li(message, main_default2.preset.warning),
      declaration,
      [main_default2.list.Bullets, 1, main_default2.preset.tertiary]
    ),
    diagnostic: {
      message,
      sources: declaration
    }
  };
}

// ts/data/cache.ts
var id = "xcss";
var domain = `${id}.io`;
var ROOT = {
  bin: "",
  name: id,
  version: "0.0.0",
  extension: id,
  vendors: [],
  url: {
    Cdn: `https://cdn.${domain}/`,
    Site: `https://www.${domain}/`,
    Worker: `https://worker.${domain}/`,
    Console: `https://console.${domain}/`,
    Prefixes: `https://prefix.${domain}/`,
    Artifacts: `https://artifact.${domain}/`
  },
  commands: {
    init: `Initiate or Update & Verify setup.`,
    debug: `Live build for developer environment`,
    preview: `Test build. Pass test for "publish" command.`,
    publish: `Optimized build, uses web-api.`,
    install: `Install external artifacts.`
  },
  scripts: {
    "init": `init`,
    "debug": `debug watch`,
    "watch": `preview watch`,
    "preview": `preview`,
    "publish": `publish`,
    "install": `install`
  },
  Tweaks: {
    CacheUsage: false
  },
  customElements: {
    style: 1,
    staple: 2,
    summon: 3
  },
  customOperations: {
    attach: "~",
    assign: "="
  },
  customAtrules: {
    attach: "@--attach",
    assign: "@--assign"
  }
};
var STATIC = {
  WATCH: false,
  DEBUG: false,
  ProjectName: "",
  ProjectVersion: "",
  Archive: {
    name: "",
    version: "",
    licence: "",
    readme: ""
  },
  Command: "",
  Argument: "",
  RootCSS: "",
  RootPath: "",
  WorkPath: "",
  ProxyMap: [],
  Hashrule: {},
  Prefix: {
    atrules: {},
    attributes: {},
    pseudos: {},
    classes: {},
    elements: {},
    values: {}
  },
  Tweaks: {
    ...ROOT.Tweaks
  },
  Libraries_Saved: {},
  Targetdir_Saved: {},
  Artifacts_Saved: {}
};
var DELTA = {
  DeltaPath: "",
  DeltaContent: "",
  FinalMessage: "",
  PublishError: "",
  ErrorCount: 0,
  Report: {
    artifacts: "",
    libraries: "",
    archives: "",
    constants: "",
    hashrule: "",
    errors: "",
    memChart: "",
    footer: ""
  },
  Lookup: {
    libraries: {},
    artifacts: {},
    archives: {}
  },
  Errors: {
    archives: [],
    libraries: [],
    artifacts: [],
    multiples: []
  },
  Diagnostics: {
    archives: [],
    libraries: [],
    artifacts: [],
    multiples: []
  },
  Manifest: {
    constants: [],
    hashrules: {},
    filelookup: {},
    errors: [],
    AXIOM: {},
    CLUSTER: {},
    LOCAL: {},
    GLOBAL: {},
    ARTIFACT: {}
  }
};
var CLASS = {
  Hashrule: {},
  Index_to_Data: {},
  Global___Index: {},
  Public___Index: {},
  Library__Index: {},
  Artifact_Index: {},
  Sync_ClassDictionary: {},
  Sync_PublishIndexMap: []
};
var FILES = {
  LIBRARIES: {},
  ARTIFACTS: {},
  TARGETDIR: {}
};
var SYNC = {
  MARKDOWN: {
    readme: {
      title: "README",
      url: "readme.md",
      path: "",
      frags: ["readme.md"],
      content: ""
    },
    alerts: {
      title: "ALERTS",
      url: "alerts.md",
      path: "",
      frags: ["documents", "alerts.md"],
      content: ""
    },
    changelog: {
      title: "CHANGELOG",
      url: "changelog.md",
      path: "",
      frags: ["documents", "changelog.md"],
      content: ""
    },
    guildelines: {
      title: "guildelines",
      url: "agentic.md",
      path: "",
      frags: ["documents", "guildelines.md"],
      content: ""
    }
  },
  AGREEMENT: {
    license: {
      title: "LICENSE",
      url: "agreements-txt/license.txt",
      path: "",
      frags: ["agreements", "license.txt"],
      content: ""
    },
    terms: {
      title: "TERMS & CONDITIONS",
      url: "agreements-txt/terms.txt",
      path: "",
      frags: ["agreements", "terms.txt"],
      content: ""
    },
    privacy: {
      title: "PRIVACY POLICY",
      url: "agreements-txt/privacy.txt",
      path: "",
      frags: ["agreements", "privacy.txt"],
      content: ""
    }
  }
};
var PATH = {
  blueprint: {
    scaffold: {
      frags: ["blueprint", "scaffold"],
      path: "",
      content: "",
      essential: true
    },
    prefixes: {
      frags: ["blueprint", "prefixes.json"],
      path: "",
      content: "",
      essential: true
    },
    libraries: {
      frags: ["blueprint", "libraries"],
      path: "",
      content: "",
      essential: true
    }
  },
  folder: {
    scaffold: {
      frags: ["xtyles"],
      path: "",
      content: "",
      essential: true
    },
    autogen: {
      frags: ["xtyles", "autogen"],
      path: "",
      content: "",
      essential: false
    },
    artifacts: {
      frags: ["xtyles", "artifacts"],
      path: "",
      content: "",
      essential: false
    },
    archive: {
      frags: ["xtyles", "archive"],
      path: "",
      content: "",
      essential: false
    },
    arcversion: {
      frags: ["xtyles", "archive", "version"],
      path: "",
      content: "",
      essential: false
    },
    libraries: {
      frags: ["xtyles", "libraries"],
      path: "",
      content: "",
      essential: false
    }
  },
  css: {
    atrules: {
      frags: ["xtyles", "#at-rules.css"],
      path: "",
      content: "",
      essential: true
    },
    constants: {
      frags: ["xtyles", "#constants.css"],
      path: "",
      content: "",
      essential: true
    },
    elements: {
      frags: ["xtyles", "#elements.css"],
      path: "",
      content: "",
      essential: true
    },
    extends: {
      frags: ["xtyles", "#extends.css"],
      path: "",
      content: "",
      essential: true
    }
  },
  json: {
    configure: {
      frags: ["xtyles", "configure.jsonc"],
      path: "",
      content: "",
      essential: true
    },
    hashrule: {
      frags: ["xtyles", "hashrules.jsonc"],
      path: "",
      content: "",
      essential: true
    },
    archive: {
      frags: ["xtyles", "archive", "index.json"],
      path: "",
      content: "",
      essential: false
    }
  },
  md: {
    readme: {
      frags: ["xtyles", "readme.md"],
      path: "",
      content: "",
      essential: false
    },
    licence: {
      frags: ["xtyles", "licence.md"],
      path: "",
      content: "",
      essential: false
    },
    reference: {
      frags: ["xtyles", "autogen", "reference.md"],
      path: "",
      content: "",
      essential: false
    },
    guildelines: {
      frags: ["xtyles", "autogen", "guildelines.md"],
      path: "",
      content: "",
      essential: false
    }
  },
  autogen: {
    index: {
      path: "",
      frags: ["xtyles", "autogen", "preview", "index.css"],
      content: "",
      essential: false
    },
    watch: {
      path: "",
      frags: ["xtyles", "autogen", "preview", "watch.css"],
      content: "",
      essential: false
    },
    staple: {
      path: "",
      frags: ["xtyles", "autogen", "preview", "staple.htm"],
      content: "",
      essential: false
    },
    ignore: {
      path: "",
      frags: ["xtyles", ".gitignore"],
      content: "autogen",
      essential: false
    },
    manifest: {
      path: "",
      frags: ["xtyles", "autogen", "manifest.json"],
      content: JSON.stringify(DELTA.Manifest),
      essential: false
    }
  }
};

// ts/artifact.ts
function ARCHIVE() {
  delete STATIC.Archive.tweaks;
  delete STATIC.Archive.vendors;
  delete STATIC.Archive.proxymap;
  delete STATIC.Archive.artifacts;
  STATIC.Archive.exportclasses = [];
  STATIC.Archive.exportsheet = Object.values(Object.values(FILES.TARGETDIR).reduce((a, i) => {
    Object.assign(a, i.GetExports());
    return a;
  }, {})).map((i) => {
    if (i.symclass.includes("$$$")) {
      STATIC.Archive.exportclasses?.push(i.symclass);
    }
    return [
      "<" + [
        i.element,
        ...i.stylesheet.map(([A, V]) => {
          const symclass = i.symclass.startsWith("$") ? `-${i.symclass}` : i.symclass;
          if (A === "") {
            const value = (i.attachments.length ? `${ROOT.customOperations["attach"]} ${i.attachments.join(" ")};` : "") + V;
            return `${symclass}${value.length ? `="${value}"` : ""}`;
          } else {
            return `${"{" + JSON.parse(A).join("}&{") + "}&"}="${V}"`;
          }
        }),
        ...i.attributes.map(([k, v]) => `${k}=${v}`)
      ].join(" ") + ">",
      i.innertext,
      `</${i.element}>`,
      ``
    ].join(" ");
  }).join("\n\n");
  return STATIC.Archive;
}
async function DEPLOY(OUTFILES = {}) {
  const latestverfile = `latest.json`;
  const currentexport = JSON.stringify(STATIC.Archive);
  const currentverfile = `${STATIC.Archive.version}.json`;
  const availableversions = (await fileman_default.path.listFiles(PATH.folder.arcversion.path)).map((i) => fileman_default.path.basename(i));
  const latestpath = fileman_default.path.join(PATH.folder.arcversion.path, latestverfile);
  const currentpath = fileman_default.path.join(PATH.folder.arcversion.path, currentverfile);
  if (!availableversions.includes(latestverfile)) {
    availableversions.push(latestverfile);
  }
  if (!availableversions.includes(currentverfile)) {
    availableversions.push(currentverfile);
  }
  OUTFILES[latestpath] = currentexport;
  OUTFILES[currentpath] = currentexport;
  const indexexport = {
    ...STATIC.Archive,
    versions: availableversions.sort()
  };
  delete indexexport.exportsheet;
  OUTFILES[PATH.json.archive.path] = JSON.stringify(indexexport);
}
async function FETCH() {
  const outs = {}, Results = {};
  let message = "", status = true;
  if (STATIC.Archive.artifacts) {
    await Promise.all(Object.entries(STATIC.Archive.artifacts).map(async ([identifier, source]) => {
      const fetched = await async function() {
        const [name, version] = typeof source === "string" ? source.split("@") : ["", ""];
        const result1 = await fileman_default.read.json(source, true);
        if (result1.status) {
          return result1.data;
        }
        ;
        const result2 = await fileman_default.read.json(ROOT.url.Artifacts + `${name}/${version || "latest"}`, true);
        if (result2.status) {
          return result2.data;
        }
        ;
        return {};
      }();
      if (STATIC.Archive.name === identifier) {
        Results[identifier] = main_default2.tag.Span("Artifact identifer collition with project.", main_default2.preset.failed);
        status = false;
      } else if (Object.keys(fetched).length === 0) {
        Results[identifier] = main_default2.tag.Span("Unavailable", main_default2.preset.failed);
        status = false;
      } else {
        if (fetched.libraries) {
          Object.entries(fetched.libraries).forEach(([lib, str]) => {
            outs[fileman_default.path.join(PATH.folder.artifacts.path, identifier, `${lib}.${identifier}.css`)] = str;
          });
          delete fetched.libraries;
        }
        if (fetched.exportsheet) {
          outs[fileman_default.path.join(PATH.folder.artifacts.path, identifier, `${identifier}.${ROOT.extension}`)] = [
            `# ${fetched.name}@${fetched.version} : Available SymClasses`,
            "",
            ...fetched.exportclasses ? fetched.exportclasses.map((i) => {
              if (i.includes("$$$")) {
                return `> /${identifier}/${i.replace("$$$", "$")}`;
              } else {
                return `> /${identifier}/${i}`;
              }
            }) : [],
            "",
            "",
            "# Declarations",
            "",
            fetched.exportsheet
          ].join("\n");
          delete fetched.exportsheet;
        }
        if (fetched.readme) {
          outs[fileman_default.path.join(PATH.folder.artifacts.path, identifier, `readme.md`)] = fetched.readme;
          delete fetched.readme;
        }
        if (fetched.licence) {
          outs[fileman_default.path.join(PATH.folder.artifacts.path, identifier, `licence.md`)] = fetched.licence;
          delete fetched.licence;
        }
        Results[identifier] = main_default2.tag.Span("Successfull", main_default2.preset.success);
      }
    }));
  }
  message = main_default2.MAKE("", ListProps(Results), [main_default2.list.Bullets, 0, main_default2.preset.text]);
  return { status, outs, message };
}
var artifact_default = {
  ARCHIVE,
  DEPLOY,
  FETCH
};

// ts/type/style.ts
var _Import = [
  "",
  "LOCAL",
  "GLOBAL",
  "PUBLIC",
  "LIBRARY",
  "ARCHIVE",
  "ARCTACH",
  "ARTIFACT"
];

// ts/data/index.ts
var NOW = 0;
var BIN = /* @__PURE__ */ new Set();
function FETCH2(index) {
  return CLASS.Index_to_Data[String(index)];
}
function DECLARE(object) {
  object.index = BIN.values().next().value || ++NOW;
  if (BIN.has(object.index)) {
    BIN.delete(object.index);
  }
  object.metadata.watchclass = `__${main_default.string.enCounter(object.index)}`;
  CLASS.Index_to_Data[object.index] = object;
  return object.index;
}
function DISPOSE(...indexes) {
  indexes.forEach((index) => {
    if (index > 0) {
      BIN.add(index);
      delete CLASS.Index_to_Data[index.toString()];
    }
  });
}
function RESET(after = 0) {
  after = after > 0 ? after : 0;
  let removed = 0;
  Object.keys(CLASS.Index_to_Data).forEach((index) => {
    const number = Number(index);
    if (number > after) {
      if (BIN.has(number)) {
        BIN.delete(number);
      }
      delete CLASS.Index_to_Data[number];
      removed++;
    }
  });
  NOW = after;
  return removed;
}
function FIND(classname, localmap = {}) {
  let index = 0;
  let group = 0 /* NULL */;
  if (localmap[classname]) {
    index = localmap[classname];
    group = 1 /* LOCAL */;
  } else if (CLASS.Global___Index[classname]) {
    index = CLASS.Global___Index[classname];
    group = 2 /* GLOBAL */;
  } else if (CLASS.Public___Index[classname]) {
    index = CLASS.Public___Index[classname];
    group = 3 /* PUBLIC */;
  } else if (CLASS.Library__Index[classname]) {
    index = CLASS.Library__Index[classname];
    group = 4 /* LIBRARY */;
  } else if (CLASS.Artifact_Index[classname]) {
    index = CLASS.Artifact_Index[classname];
    group = 7 /* ARTIFACT */;
  }
  return { index, group };
}

// ts/style/hashrule.ts
var hashPattern = /#\{[a-z0-9-]+\}/i;
function IMPORT(rule, watchUndef = true, source = PATH.json.hashrule.path) {
  const primitive = rule;
  const recursionSequence = [];
  const preview = {};
  const response = (result, cause = "", message = "") => {
    const E = HashruleError(
      primitive,
      cause,
      source,
      message,
      preview
    );
    return {
      status: message.length === 0,
      result,
      error: E.error,
      diagnostic: E.diagnostic
    };
  };
  let rgxMatch;
  while (rgxMatch = hashPattern.exec(rule)) {
    const match = rgxMatch[0];
    const key = match.slice(2, -1);
    const replacement = watchUndef ? CLASS.Hashrule[key] : CLASS.Hashrule[key] ?? match;
    preview["FROM " + match] = `GETS ${replacement} FROM ${rule}`;
    if (replacement === void 0) {
      return response("", match, "Undefined Hashrule.");
    }
    if (recursionSequence.includes(match)) {
      return response("", match, "Hashrule recursion loop.");
    }
    rule = rule.replace(hashPattern, replacement);
    recursionSequence.push(match);
  }
  return response(rule);
}
function UPLOAD() {
  const errors = [];
  CLASS.Hashrule = STATIC.Hashrule;
  const hashrule = { ...STATIC.Hashrule };
  Object.keys(hashrule).map((key) => {
    const hash = `#{${key}}`;
    const response = IMPORT(hash);
    if (response.status) {
      hashrule[key] = response.result;
    } else {
      delete hashrule[key];
      errors.push(response.error);
    }
  });
  CLASS.Hashrule = hashrule;
  DELTA.Manifest.hashrules = hashrule;
  DELTA.Report.hashrule = HashruleReport(hashrule, errors);
}
function RENDER(string, sourcePath) {
  const extended = IMPORT(string, true, sourcePath);
  const snippets = main_default.string.zeroBreaks(extended.result, ["&"]);
  const wrappers = [];
  snippets.forEach((snippet) => {
    snippet = snippet.trim();
    const length = snippet.length;
    let wrapper = "", deviance = 0, splAtrule = false;
    for (let i = 0; i < length; i++) {
      const ch = snippet[i];
      if (")}".includes(ch)) {
        deviance--;
      }
      if (deviance) {
        wrapper += ch;
      } else {
        switch (ch) {
          case "{":
          case "}":
            wrapper += "";
            break;
          case "@":
            if (wrapper.length) {
              wrapper += " ";
              splAtrule = true;
            }
            wrapper = "@" + wrapper;
            break;
          default:
            wrapper += ch;
        }
      }
      if ("({".includes(ch)) {
        deviance++;
      }
    }
    if (wrapper.length) {
      wrappers.push((splAtrule ? wrapper.replace(/width\s*>=/g, "min-width:").replace(/width\s*<=/g, "max-width:").replace(/height\s*>=/g, "min-height:").replace(/height\s*<=/g, "max-height:") : wrapper).replace(/\s+/g, " "));
    }
  });
  return {
    wrappers,
    status: extended.status,
    error: extended.error,
    diagnostic: extended.diagnostic
  };
}
function WRAPPER(parentObject, keys, childObject) {
  const activeKey = keys.shift();
  if (activeKey) {
    if (keys.length) {
      if (!parentObject[activeKey]) {
        parentObject[activeKey] = {};
      }
      WRAPPER(parentObject[activeKey], keys, childObject);
    } else {
      parentObject[activeKey] = childObject;
    }
  }
}
var hashrule_default = {
  IMPORT,
  UPLOAD,
  RENDER,
  WRAPPER
};

// ts/style/block.ts
var OPEN_CHARS = ["{", "[", "("];
var CLOSE_CHARS = ["}", "]", ")"];
var QUOTE_CHARS = ["`", "'", '"'];
function parseBlock(content, blockInArrays = false) {
  content += ";";
  const length = content.length;
  let keyStart = 0, valStart = 0, deviance = 0, quote = "", key = "", isProp = true;
  const result = {
    assign: [],
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
            key = main_default.string.minify(content.slice(keyStart, index));
            valStart = index + 1;
            break;
          case ":":
            key = main_default.string.minify(content.slice(keyStart, index));
            valStart = index + 1;
            break;
          case "}":
          case ";": {
            const value = main_default.string.minify(content.slice(valStart, index));
            if (isProp) {
              if (key.length > 0) {
                if (key.startsWith("--")) {
                  result.variables[key] = value;
                }
                result.properties[key] = value;
                if (blockInArrays) {
                  result.Xproperties.push([key, value]);
                }
              } else if (value[0] === "@") {
                const firstSpaceIndex = value.indexOf(" ");
                const spaceIndex = firstSpaceIndex < 0 ? value.length : firstSpaceIndex;
                const directive = value.slice(0, spaceIndex);
                switch (directive) {
                  case ROOT.customAtrules["attach"]:
                    result.attachment.push(
                      ...main_default.string.zeroBreaks(value.slice(spaceIndex))
                    );
                    break;
                  case ROOT.customAtrules["assign"]:
                    result.assign.push(
                      ...main_default.string.zeroBreaks(value.slice(spaceIndex))
                    );
                    break;
                  default:
                    result.atProps[value] = "";
                    if (blockInArrays) {
                      result.XatProps.push([value, ""]);
                    }
                }
              } else {
                const breaks = main_default.string.zeroBreaks(value);
                switch (breaks[0]) {
                  case ROOT.customOperations["attach"]:
                    breaks.shift();
                    result.attachment.push(...breaks);
                    break;
                  case ROOT.customOperations["assign"]:
                    breaks.shift();
                    result.assign.push(...breaks);
                    break;
                }
              }
            } else {
              switch (key[0]) {
                case "@":
                  result.atRules[key] = value;
                  if (blockInArrays) {
                    result.XatRules.push([key, value]);
                  }
                  break;
                case "&":
                  result.nested[key] = value;
                  if (blockInArrays) {
                    result.Xnested.push([key, value]);
                  }
                  break;
                case ".":
                  result.classes[key] = value;
                  if (blockInArrays) {
                    result.Xclasses.push([key, value]);
                  }
                  break;
                default:
                  result.flats[key] = value;
                  if (blockInArrays) {
                    result.Xflats.push([key, value]);
                  }
              }
              result.allBlocks[key] = value;
              if (blockInArrays) {
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

// ts/style/parse.ts
function MERGER(classList = []) {
  const attachments = [], mergables = [], variables = {};
  classList.forEach((className) => {
    const found = FIND(className);
    if (found.group === 4 /* LIBRARY */) {
      const classdata = FETCH2(found.index);
      Object.assign(variables, classdata.metadata.variables);
      attachments.push(...classdata.attachments);
      mergables.push(classdata.style_object);
    }
  });
  const result = main_default.object.multiMerge(mergables, true);
  return { result, attachments, variables };
}
function SCANNER(content, initial, sourceSelector, merge_n_flatten) {
  const scanned = parseBlock(content);
  const assigned = MERGER(scanned.assign);
  const variables = { ...assigned.variables, ...scanned.variables };
  const attachments = [...assigned.attachments, ...scanned.attachment.filter((attach) => attach[0] !== "/")];
  const scannedAst = Object.fromEntries([
    ...Object.keys(assigned.variables).reduce((acc, varkey) => {
      if (scanned.properties[varkey]) {
        acc.push([varkey, STATIC.DEBUG ? `${scanned.properties[varkey]}/* ${initial} ${sourceSelector} */` : scanned.properties[varkey]]);
      }
      return acc;
    }, []),
    ...Object.entries(scanned.atProps).map(
      ([propKey, propValue]) => [propKey, STATIC.DEBUG ? `${propValue}/* ${initial} ${sourceSelector} */` : propValue]
    ),
    ...Object.entries(scanned.properties).map(
      ([propKey, propValue]) => [propKey, STATIC.DEBUG ? `${propValue}/* ${initial} ${sourceSelector} */` : propValue]
    )
  ]);
  const mergedAst = main_default.object.multiMerge([assigned.result, { "": scannedAst }], true);
  const styles = merge_n_flatten ? Object.entries(mergedAst).reduce((a, [k, v]) => {
    if (k === "") {
      Object.assign(a, v);
    } else {
      a[k] = v;
    }
    return a;
  }, {}) : mergedAst;
  const target = merge_n_flatten ? styles : styles[""];
  for (const selector in scanned.allBlocks) {
    const result = SCANNER(scanned.allBlocks[selector], initial, sourceSelector + " -> " + selector, true);
    Object.assign(variables, result.variables);
    attachments.push(...result.attachments);
    target[selector] = result.styles;
  }
  return { styles, attachments, variables };
}
function CSSFileScanner(content, initial = "") {
  const scanned = parseBlock(main_default.code.uncomment.Script(content), true);
  const styles = scanned.XatProps;
  const variables = {}, attachments = [];
  scanned.XallBlocks.forEach(([key, value]) => {
    const result = SCANNER(value, initial, key, true);
    Object.assign(variables, result.variables);
    attachments.push(...result.attachments);
    styles.push([key, result.styles]);
  });
  return { styles, attachments, variables };
}
function CSSBulkScanner(fileDatas, forArtifact = false) {
  const selectorList = [], selectors = {}, indexMetaCollection = {};
  const IndexMap = forArtifact ? CLASS.Artifact_Index : CLASS.Library__Index;
  fileDatas.forEach((source) => {
    const { classFront, filePath, debugclassFront, content, manifesting: manifest } = source;
    parseBlock(main_default.code.uncomment.Script(content), true).XallBlocks.forEach(([SELECTOR, OBJECT]) => {
      const declaration = source.sourcePath;
      const classname = classFront + main_default.string.normalize(SELECTOR, [], ["\\", "."]);
      const scannedStyle = SCANNER(OBJECT, `${manifest.lookup.type} : ${filePath} |`, SELECTOR, false);
      const attachments = scannedStyle.attachments;
      const object = scannedStyle.styles;
      const index = (IndexMap[classname] || 0) + (selectors[classname] || 0);
      if (index) {
        const InStash = FETCH2(index);
        InStash.metadata.declarations.push(declaration);
      } else {
        const selectorData = {
          index: 0,
          artifact: forArtifact ? source.artifact : "",
          definent: SELECTOR,
          symclass: classname,
          metadata: {
            info: [],
            watchclass: "",
            variables: scannedStyle.variables,
            skeleton: main_default.object.skeleton(object),
            declarations: [declaration],
            summon: "",
            attributes: {}
          },
          style_object: object,
          attachments: forArtifact ? attachments.map((attach) => classFront + attach) : attachments,
          debugclass: debugclassFront + "_" + main_default.string.normalize(classname, [], [], ["$", "/"]),
          declarations: [declaration],
          snippet_staple: "",
          snippet_style: { [SELECTOR]: object[""] }
        };
        const identity = DECLARE(selectorData);
        source.styleData.usedIndexes.push(identity);
        selectors[classname] = identity;
        indexMetaCollection[classname] = selectorData.metadata;
        selectorList.push(classname);
      }
    });
  });
  for (const selector in selectors) {
    IndexMap[selector] = selectors[selector];
  }
  return { indexMetaCollection, selectorList };
}
function TagStyleScanner(raw, file, IndexMap = {}) {
  const errors = [];
  const diagnostics = [];
  const attachments = [];
  const variables = {};
  const forArtifact = file.manifesting.lookup.type === "ARTIFACT";
  const declaration = `${file.targetPath}:${raw.rowIndex}:${raw.colIndex}`;
  const symzero = raw.symclasses[0].replace(/^-\$/, "$");
  const symclass = file.classFront + (forArtifact ? symzero.replace("$$$", "$") : symzero);
  const normalsymclass = main_default.string.normalize(symclass, [], [], forArtifact ? ["$", "/"] : ["$"]);
  let { index, group } = FIND(symclass, IndexMap);
  if (group !== 0 /* NULL */) {
    const InStash = FETCH2(index);
    InStash.metadata.declarations.push(declaration);
  } else {
    const scope = _Import[raw.scope === 7 /* ARTIFACT */ ? 0 /* NULL */ : raw.scope];
    const debugclass = `${scope}${file.debugclassFront}\\:${raw.rowIndex}\\:${raw.colIndex}_${normalsymclass}`;
    const styleScanned = SCANNER(
      main_default.code.uncomment.Script(raw.styles[""]),
      `${_Import[raw.scope]} : ${file.filePath} ||`,
      `${raw.symclasses} => []`,
      false
    );
    const object = styleScanned.styles;
    attachments.push(...styleScanned.attachments);
    Object.assign(variables, styleScanned.variables);
    for (const subSelector in raw.styles) {
      if (subSelector !== "") {
        const query = hashrule_default.RENDER(subSelector, declaration);
        if (query.status) {
          const styleScanned2 = SCANNER(
            main_default.code.uncomment.Script(raw.styles[subSelector]),
            `${_Import[raw.scope]} : ${file.filePath} |`,
            `${raw.symclasses} => ${subSelector}`,
            true
          );
          attachments.push(...styleScanned2.attachments);
          Object.assign(variables, styleScanned2.variables);
          if (Object.keys(styleScanned2).length) {
            object[JSON.stringify(query.wrappers)] = styleScanned2.styles;
          }
        } else {
          errors.push(query.error);
          diagnostics.push(query.diagnostic);
        }
      }
    }
    const style_snippet = SCANNER(
      raw.elid === ROOT.customElements.style ? main_default.code.uncomment.Script(raw.attachstring) : "",
      `${_Import[raw.scope]}:ATTACHMENT : ${file.filePath}:${raw.rowIndex}:${raw.colIndex} |`,
      `${raw.symclasses[0]}`,
      true
    );
    attachments.push(...style_snippet.attachments);
    Object.assign(variables, style_snippet.variables);
    index = DECLARE({
      index: 0,
      artifact: forArtifact ? file.artifact : STATIC.Archive.name,
      definent: raw.symclasses[0],
      symclass,
      style_object: object,
      metadata: {
        info: raw.comments,
        watchclass: "",
        variables,
        skeleton: main_default.object.skeleton(object),
        declarations: [declaration],
        summon: raw.elid === ROOT.customElements.summon ? raw.attachstring : "",
        attributes: raw.elid === ROOT.customElements.summon ? raw.attributes : {}
      },
      attachments: forArtifact ? attachments.map((a) => file.classFront + (a.includes("$$$") ? a.replace("$$$", "$") : `$/${a}`)) : attachments,
      debugclass,
      declarations: [declaration],
      snippet_staple: raw.elid === ROOT.customElements.staple ? raw.attachstring : "",
      snippet_style: style_snippet.styles
    });
    IndexMap[symclass] = index;
  }
  return {
    symclass,
    index,
    attachments,
    diagnostics,
    errors
  };
}
var parse_default = {
  TagStyleScanner,
  CSSBulkScanner,
  CSSFileScanner
};

// ts/style/color.ts
var bracePair = {
  "{": "}",
  "[": "]",
  "(": ")",
  "'": "'",
  "`": "`",
  '"': '"'
};
var openBraces = ["[", "{", "(", "'", '"', "`"];
var closeBraces = ["]", "}", ")"];
function stdScanner(content, marker, palette) {
  const values = [], braceTrack = [];
  let value = "", awaitBrace = "", ok = true, deviance = 0, ch = content[marker];
  while (ch !== void 0) {
    ch = content[++marker];
    if (deviance === 0 && (ch === ")" || ch === "," || ch === " " || ch === "/")) {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        if (trimmed.endsWith("deg")) {
          const numValue = parseFloat(trimmed.slice(0, -3));
          if (!isNaN(numValue)) {
            values.push(numValue);
          } else {
            ok = false;
          }
        } else if (trimmed.endsWith("%")) {
          const numValue = parseFloat(trimmed.slice(0, -1));
          if (!isNaN(numValue)) {
            if (ch === "/") {
              values.push(numValue / 100);
            } else if ((palette === "rgb" || palette === "rgba") && values.length < 3) {
              values.push(Math.round(numValue / 100 * 255));
            } else if (palette === "hsl" && (values.length === 1 || values.length === 2)) {
              values.push(numValue);
            } else if ((palette === "hwb" || palette === "lab" || palette === "lch" || palette === "oklab" || palette === "oklch") && values.length > 0) {
              values.push(numValue);
            } else {
              values.push(numValue);
            }
          } else {
            ok = false;
          }
        } else if (!isNaN(Number(trimmed))) {
          const numValue = Number(trimmed);
          if ((palette === "rgb" || palette === "rgba") && values.length < 3) {
            if (Number.isInteger(numValue) && numValue >= 0 && numValue <= 255) {
              values.push(numValue);
            } else {
              values.push(numValue);
            }
          } else {
            values.push(numValue);
          }
        } else {
          ok = false;
        }
      }
      value = "";
    } else {
      value += ch;
    }
    if (deviance === 0 && ch === ")") {
      break;
    } else if (awaitBrace === ch) {
      braceTrack.pop();
      deviance = braceTrack.length;
      awaitBrace = bracePair[braceTrack[deviance - 1]];
    } else if (openBraces.includes(ch) && !["'", '"', "`"].includes(awaitBrace)) {
      braceTrack.push(ch);
      deviance = braceTrack.length;
      awaitBrace = bracePair[ch];
    } else if (deviance === 0 && closeBraces.includes(ch)) {
      break;
    }
  }
  return { values: ok ? values : [], endingMarker: marker + 1 };
}
function parser(source, fallback_RGB1_HEX0 = true, fallbackPalettes = ["oklch", "oklab", "lab", "lch", "hwb", "rgba"]) {
  let activeMarker = 0, ch = source[activeMarker], capture = "", result = "", score = 0;
  while (activeMarker < source.length) {
    ch = source[activeMarker++];
    const isAlNum = /\w/i.test(ch);
    if (isAlNum) {
      capture += ch;
    } else {
      result += capture.length ? capture + ch : ch;
      capture = "";
    }
    if (fallbackPalettes.includes(capture) && source[activeMarker] === "(") {
      const { values, endingMarker } = stdScanner(source, activeMarker, capture);
      if (values.length > 2) {
        score++;
        let r = 0, g = 0, b = 0, alpha = 1, converted = "";
        switch (capture) {
          case "hsl":
          case "hsla":
            [r, g, b, alpha, converted] = (() => {
              const [h, s, l, a = 1] = values;
              const rgb = main_default.color.from.hsl(h, s * 100, l * 100, a);
              return [rgb.r, rgb.g, rgb.b, a, rgb.converted];
            })();
            break;
          case "hwb":
            [r, g, b, alpha, converted] = (() => {
              const [h, w, b_, a = 1] = values;
              const rgb = main_default.color.from.hwb(h, w * 100, b_ * 100, a);
              return [rgb.r, rgb.g, rgb.b, a, rgb.converted];
            })();
            break;
          case "lab":
            [r, g, b, alpha, converted] = (() => {
              const [l, a_, b_, a = 1] = values;
              const rgb = main_default.color.from.lab(l, a_, b_, a);
              return [rgb.r, rgb.g, rgb.b, a, rgb.converted];
            })();
            break;
          case "lch":
            [r, g, b, alpha, converted] = (() => {
              const [l, c, h, a = 1] = values;
              const rgb = main_default.color.from.lch(l, c, h, a);
              return [rgb.r, rgb.g, rgb.b, a, rgb.converted];
            })();
            break;
          case "oklab":
            [r, g, b, alpha, converted] = (() => {
              const [l, a_, b_, a = 1] = values;
              const rgb = main_default.color.from.oklab(l, a_, b_, a);
              return [rgb.r, rgb.g, rgb.b, a, rgb.converted];
            })();
            break;
          case "oklch":
            [r, g, b, alpha, converted] = (() => {
              const [l, c, h, a = 1] = values;
              const rgb = main_default.color.from.oklch(l, c, h, a);
              return [rgb.r, rgb.g, rgb.b, a, rgb.converted];
            })();
            break;
          default:
            converted = capture + source.slice(activeMarker, endingMarker);
        }
        result += fallback_RGB1_HEX0 ? converted : main_default.color.LoadHex(r, g, b, alpha);
      } else {
        result += capture + source.slice(activeMarker, endingMarker);
      }
      activeMarker = endingMarker;
      capture = "";
    }
  }
  return score ? [result, source] : [source];
}

// ts/style/prefix.ts
function forAttribute(content, prefixes = ROOT.vendors) {
  const attrVals = STATIC.Prefix.attributes[content];
  if (!attrVals) {
    return { "": content };
  }
  const result = {};
  Object.entries(attrVals).forEach(([vendor, value]) => {
    if (prefixes.includes(vendor)) {
      result[vendor] = value;
    }
  });
  result[""] = content;
  return result;
}
function forValues(attribute, value, prefixes = ROOT.vendors) {
  const cleanValue = main_default.code.uncomment.Css(value);
  const venVals = STATIC.Prefix.values?.[attribute]?.[cleanValue];
  if (!venVals) {
    return { "": value };
  }
  const result = {};
  Object.entries(venVals).forEach(([vendor, val]) => {
    if (prefixes.includes(vendor)) {
      result[vendor] = value.replace(cleanValue, val);
    }
  });
  result[""] = value;
  return result;
}
function LoadProps(attribute = "", value = "", prefixes = ROOT.vendors) {
  const results = [];
  const attributes = forAttribute(attribute, prefixes);
  const values = forValues(attribute, value);
  Object.entries(attributes).forEach(([attrVen, attr]) => {
    Object.entries(values).forEach(([valVen, val]) => {
      if (attrVen === valVen || valVen === "") {
        const valvars = parser(val);
        valvars.forEach((v) => results.push([attr, v]));
      }
    });
  });
  return results;
}
function forAtRule(content = "", prefixes = ROOT.vendors) {
  let index = content.indexOf(" ");
  index = index < 0 ? content.length : index;
  const rule = content.slice(0, index), data = content.slice(index);
  const result = {};
  prefixes.forEach((group) => {
    if (STATIC.Prefix.atrules[rule] && STATIC.Prefix.atrules[rule][group]) {
      result[group] = STATIC.Prefix.atrules[rule][group] + data;
    }
  }, {});
  result[""] = content;
  return result;
}
function forPseudos(content = "", prefixes = ROOT.vendors) {
  const stringList = main_default.string.zeroBreaks(content, [","]).map((i) => i.trim()), selectors = [];
  stringList.forEach((string = "") => {
    const result2 = Object.fromEntries([...ROOT.vendors, ""].map((ven) => [ven, { out: "", score: 0 }]));
    prefixes.forEach((group) => {
      result2[group].out = string.replace(/:+[\w-]+/g, (selector) => {
        if (STATIC.Prefix.pseudos[selector] && STATIC.Prefix.pseudos[selector][group]) {
          result2[group].score++;
          return STATIC.Prefix.pseudos[selector][group];
        }
        if (STATIC.Prefix.pseudos[selector]) {
          return selector;
        }
        return selector;
      });
    });
    selectors.push(
      ...Object.values(result2).reduce((acc, item) => {
        if (item.score) {
          acc.push(item.out);
        }
        return acc;
      }, []),
      string
    );
  });
  const finalIndex = selectors.length - 1;
  const result = selectors.map((s, i) => finalIndex !== i ? s + "," : s);
  return result;
}

// ts/style/render.ts
function objectSwitch(srcObject) {
  if (!srcObject || typeof srcObject !== "object") {
    return {};
  }
  const output = { "": {} };
  Object.entries(srcObject).forEach(([outerKey, outerObject]) => {
    Object.entries(outerObject).forEach(([innerKey, innerObject]) => {
      if (innerKey === "") {
        output[""][outerKey] = innerObject;
      } else {
        const keyseq = [...JSON.parse(innerKey), outerKey].map((key, index, array) => {
          if (index === 0 || (array[index - 1].startsWith("@") || key.startsWith("@"))) {
            return key;
          } else {
            return `& ${key}`;
          }
        });
        hashrule_default.WRAPPER(output, keyseq, innerObject);
      }
    });
  });
  return output;
}
function styleSwitch(object) {
  const result = {};
  const inits = [], mins = [], maxs = [], flats = [];
  const switched = objectSwitch(object);
  Object.keys(switched).forEach((key) => {
    const min = key.indexOf("min");
    const max = key.indexOf("max");
    if (key !== "") {
      if (min === -1 && max === -1) {
        inits.push(key);
      } else if (min < max) {
        mins.push(key);
      } else if (min > max) {
        maxs.push(key);
      } else if (min === max) {
        flats.push(key);
      }
    }
  });
  inits.forEach((key) => result[key] = switched[key]);
  Object.assign(result, switched[""]);
  [...flats.sort(), ...mins.sort().reverse(), ...maxs.sort()].forEach((key) => result[key] = switched[key]);
  return result;
}
function LoadVendors(collection = {}, vendor = "") {
  return vendor == "" ? ROOT.vendors.filter(
    (ven) => !Object.prototype.hasOwnProperty.call(collection, ven)
  ) : [vendor];
}
function partialsArrayPrefixer(object, vendors = LoadVendors()) {
  const result = [];
  Object.entries(object).forEach(([key, value]) => {
    if (typeof value === "object") {
      if (Object.keys(value).length) {
        result.push([key, value]);
      }
    } else if (key[0] === "@") {
      Object.values(forAtRule(key, vendors)).forEach(
        (r) => result.push([r + ";", ""])
      );
    } else {
      LoadProps(key, value, vendors).forEach(([k, v]) => {
        if (k === key || !object[k]) {
          result.push([k + ":", v + ";"]);
        }
      });
    }
  });
  return result;
}
function unNester(selector = "", object = {}, cumulates = {}) {
  const compounds = {}, pseudoclass = {}, pseudoelement = {}, children = {}, myself = {};
  const holder = myself[selector] = {};
  Object.entries(object).forEach(([subSelector, subContent]) => {
    if (typeof subContent === "object") {
      if (subSelector[0] === "&") {
        const xelector = selector + subSelector.slice(1);
        if (subSelector[1] === ":") {
          unNester(xelector, subContent, subSelector[2] === ":" ? pseudoelement : pseudoclass);
        } else if (subSelector[1] === " ") {
          unNester(xelector, subContent, children);
        } else {
          unNester(xelector, subContent, compounds);
        }
      } else {
        unNester(subSelector, subContent, holder);
      }
    } else {
      holder[subSelector] = subContent;
    }
  });
  Object.assign(cumulates, compounds, pseudoclass, myself, pseudoelement, children);
  return cumulates;
}
function _objectCompose(object, minify = false, vendors = LoadVendors(), first = true) {
  const tab = minify ? "" : "  ", space = minify ? "" : " ", styleSheet = [];
  partialsArrayPrefixer(object, vendors).forEach(([key, value]) => {
    if (typeof value === "object") {
      if (Object.keys(value).length) {
        if (!minify && first) {
          styleSheet.push("");
        }
        if (key[0] === "@") {
          const atPrefixes = forAtRule;
          Object.entries(atPrefixes(key, vendors)).forEach(
            ([vendor, selector]) => {
              const composedObject = _objectCompose(
                value,
                minify,
                LoadVendors(atPrefixes, vendor),
                false
              );
              if (composedObject.length) {
                styleSheet.push(
                  selector,
                  "{",
                  ...composedObject.map((i) => tab + i),
                  "}"
                );
              }
            }
          );
        } else {
          const composedObject = _objectCompose(
            value,
            minify,
            vendors,
            false
          );
          if (Object.keys(composedObject).length) {
            styleSheet.push(...forPseudos(key, vendors));
            styleSheet.push(
              "{",
              ...composedObject.map((i) => tab + i),
              "}"
            );
          }
        }
      }
    } else if (key[0] === "@") {
      styleSheet.push(key);
    } else {
      styleSheet.push(key + space + value);
    }
  });
  return styleSheet;
}
function ComposePrefixed(array, minify = !STATIC.DEBUG) {
  const styleSheet = [];
  array.forEach(([key, value]) => {
    if (typeof value === "object") {
      const unNested = unNester(key, value);
      if (Object.keys(unNested).length) {
        styleSheet.push(..._objectCompose(unNested, minify));
      }
    } else {
      styleSheet.push(..._objectCompose({ [key]: value }, minify));
    }
  });
  return styleSheet.join(minify ? "" : "\n");
}
function ComposeSwitched(selectorIndex, minify = !STATIC.DEBUG) {
  const objectMap = {};
  const classOrder = [];
  selectorIndex.forEach(([selector, index]) => {
    objectMap[selector] = FETCH2(index).style_object;
    classOrder.push(selector);
  });
  const preped = styleSwitch(objectMap);
  return ComposePrefixed(Object.entries(preped), minify);
}
function ArtifactPartial(object, minify = true) {
  const array = Object.entries(object);
  const styleSheet = [];
  const tab = minify ? "" : "  ";
  array.forEach(([key, value]) => {
    if (typeof value === "object") {
      if (Object.keys(value).length) {
        styleSheet.push(
          key,
          "{",
          ...ArtifactPartial(value).map((i) => tab + i),
          "}"
        );
      }
    } else if (key[0] === "@") {
      styleSheet.push(key + ";");
    } else {
      styleSheet.push(key + ": " + value + ";");
    }
  });
  return styleSheet;
}
function ComposeArtifact(index) {
  const style = FETCH2(index);
  const isPublic = style.symclass.includes("$$$");
  let element = "";
  if (style.snippet_staple.length) {
    element = "staple";
  } else if (style.metadata.summon.length) {
    element = "summon";
  } else {
    element = "style";
  }
  ;
  const symclass = style.definent.includes("$$$") ? style.definent : `$---${main_default.string.enCounter(style.index || 0)}`;
  const stylesheet = isPublic ? Object.entries(style.style_object).map(([k, v]) => [k, ArtifactPartial(v).join("")]) : [["", ""]];
  const attributes = isPublic ? Object.entries(style.metadata.attributes).map(([k, v]) => [k, main_default.string.minify(v)]) : [];
  const innertext = main_default.string.minify(style.snippet_staple || style.metadata.summon || ArtifactPartial(style.snippet_style).join(""));
  return {
    element,
    symclass,
    innertext,
    stylesheet,
    attributes,
    attachments: []
  };
}
var render_default = {
  Prefixed: ComposePrefixed,
  Switched: ComposeSwitched,
  Artifact: ComposeArtifact
};

// ts/sort/kryptic.ts
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

// ts/sort/organize.ts
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
    } while (maxLen--);
    return sorted;
  })();
  const shortlisted_arrays = sorted_arrarr.reduce((acc, arr) => {
    const superParent = merge ? main_default.array.findArrSuperParent(arr, sorted_arrarr) : arr;
    const superParentString = JSON.stringify(superParent);
    if (acc[superParentString]) {
      acc[superParentString].push(arr);
    } else {
      acc[superParentString] = [arr];
    }
    return acc;
  }, {});
  let counted = 0;
  const recompClasslist = [];
  const referenceMap = Object.entries(shortlisted_arrays).reduce((acc, [key, arrarr2]) => {
    const templateArray = JSON.parse(key);
    const indexMapFragment = templateArray.reduce((map, item) => {
      map[item] = ++counted;
      recompClasslist.push([item, counted]);
      return map;
    }, {});
    arrarr2.forEach((arr) => {
      acc[JSON.stringify(arr)] = indexMapFragment;
    });
    return acc;
  }, {});
  return {
    counted,
    referenceMap,
    recompClasslist
  };
}

// ts/sort/order-api.ts
ROOT.url["Worker"] = "https://workers.xpktr.com/api/xcss-build-request";
async function order(sequences, command, argument = "", artifact = {
  name: "",
  version: "",
  readme: "",
  licence: ""
}) {
  const RESPONSE = {
    status: command === "preview",
    message: "Preview Build",
    result: previewOrganize(sequences)
  };
  if (command === "publish") {
    if (argument.length < 25) {
      RESPONSE.message = "Invalid Key. Fallback: preview";
      return RESPONSE;
    }
    const projectId = argument.slice(0, 24);
    const publicKey = argument.slice(25);
    const contentCrypt = await kryptic_default.sym.gencrypt(JSON.stringify(sequences));
    let asymEncrypted;
    try {
      asymEncrypted = await kryptic_default.asym.encrypt(
        projectId + contentCrypt.iv + contentCrypt.key,
        publicKey
      );
    } catch {
      RESPONSE.message = "Invalid Key. Fallback: preview";
      return RESPONSE;
    }
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const data = JSON.stringify({
      access: publicKey,
      private: asymEncrypted,
      content: contentCrypt.data,
      artifact
    });
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: data,
      redirect: "follow"
    };
    fetch(ROOT.url["Worker"], requestOptions).then((res) => res.json()).then(async (res) => {
      RESPONSE.status = res.status;
      if (res.status) {
        RESPONSE.message = res.message;
        RESPONSE.result = JSON.parse(await kryptic_default.sym.decrypt(res.result, contentCrypt.key, contentCrypt.iv));
      } else {
        RESPONSE.message = res.message ?? "Failed to establish connection with server. Fallback: preview";
      }
    });
  }
  return RESPONSE;
}

// ts/script/value.ts
function EvaluateIndexTraces(action, metaFront, classList, localClassMap) {
  let classMap = {};
  const index_array = [];
  const valid_class_trace = [];
  classList.forEach((entry) => {
    const found = FIND(entry, localClassMap);
    if (found.index) {
      valid_class_trace.push([entry, found.index]);
      index_array.push(found.index);
    }
  });
  const indexSetback = main_default.array.setback(index_array);
  if (action === 1 /* sync */) {
    const dictionary = CLASS.Sync_ClassDictionary[JSON.stringify(indexSetback)] || {};
    valid_class_trace.forEach(([K, V]) => {
      classMap[K] = dictionary[V];
    });
  } else {
    if (action === 2 /* watch */) {
      classMap = Object.fromEntries(valid_class_trace.map(([K, V], index) => {
        const classname = metaFront + index;
        CLASS.Sync_PublishIndexMap.push(["." + classname, Number(V)]);
        return [K, classname];
      }));
    }
    if (action === 3 /* monitor */) {
      classMap = Object.fromEntries(valid_class_trace.map(([K, V]) => {
        const classname = metaFront + FETCH2(V).debugclass;
        CLASS.Sync_PublishIndexMap.push(["." + classname, Number(V)]);
        return [K, main_default.string.normalize(classname, ["/", ".", ":", "|", "$"], ["\\"])];
      }));
    }
  }
  return classMap;
}
function classExtract(value, action, fileData, FileCursor) {
  const classList = [], quotes = ["'", "`", '"'];
  const attachments = [];
  let entry = "";
  let scribed = value;
  let activeQuote = "";
  let marker = 0;
  let inQuote = false;
  let ch = value[marker];
  while (ch !== void 0) {
    if (inQuote) {
      if (ch === " " || ch === activeQuote) {
        if (entry.startsWith(ROOT.customOperations["attach"])) {
          attachments.push(entry.slice(1));
        } else if (entry.startsWith(ROOT.customOperations["assign"])) {
          classList.push(entry.slice(1));
        }
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
    ch = value[++marker];
  }
  if (action !== 0 /* read */) {
    entry = "";
    scribed = "";
    activeQuote = "";
    marker = 0;
    inQuote = false;
    ch = value[marker];
    const metaFront = action === 3 /* monitor */ ? `TAG${fileData.debugclassFront}\\:${FileCursor.rowMarker}\\:${FileCursor.colMarker}__` : action === 2 /* watch */ ? `_${fileData.label}_${FileCursor.cycle}_` : "";
    const classMap = EvaluateIndexTraces(action, metaFront, classList, fileData.styleData.localClasses);
    while (ch !== void 0) {
      if (inQuote) {
        if (ch === " " || ch === activeQuote) {
          if (!entry.startsWith(ROOT.customOperations["attach"])) {
            if (entry.startsWith(ROOT.customOperations["assign"])) {
              entry = entry.slice(1);
            }
            scribed += classMap[entry] ? action === 3 /* monitor */ ? main_default.string.normalize(classMap[entry], ["/", ".", ":", "|", "$"], ["\\"]) : classMap[entry] : entry;
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
      ch = value[++marker];
    }
  }
  return { classList, attachments, scribed };
}

// ts/script/_cursor.ts
var Cursor = class {
  constructor(content) {
    this.content = content;
    this.active = {
      last: "",
      char: "",
      next: "",
      marker: 0,
      rowMarker: 1,
      colMarker: 0,
      cycle: 0,
      colFallback: 0
    };
    this.fallback = {
      last: "",
      char: "",
      next: "",
      marker: 0,
      rowMarker: 0,
      colMarker: 0,
      cycle: 0,
      colFallback: 0
    };
    this.active.char = this.content[this.active.marker];
    if (this.active.char === "\n") {
      this.active.rowMarker++;
      this.active.colMarker = 0;
    } else {
      this.active.colMarker++;
    }
  }
  increment() {
    this.active.last = this.active.char;
    this.active.char = this.content[++this.active.marker];
    this.active.next = this.content[this.active.marker + 1];
    if (this.active.char === "\n") {
      this.active.rowMarker++;
      this.active.colFallback = this.active.colMarker;
      this.active.colMarker = 0;
    } else {
      this.active.colMarker++;
    }
    return this.active.char;
  }
  decrement() {
    this.active.next = this.active.char;
    this.active.char = this.content[--this.active.marker];
    this.active.last = this.content[this.active.marker - 1];
    if (this.active.char === "\n") {
      this.active.rowMarker--;
      this.active.colMarker = this.active.colFallback;
    } else {
      this.active.colMarker--;
    }
    return this.active.char;
  }
  savefallback() {
    Object.assign(this.fallback, this.active);
  }
  loadfallback() {
    Object.assign(this.active, this.fallback);
  }
};

// ts/script/tag.ts
var bracePair2 = {
  "{": "}",
  "[": "]",
  "(": ")",
  "'": "'",
  "`": "`",
  '"': '"'
};
var openBraces2 = Object.keys(bracePair2);
var closeBraces2 = ["]", "}", ")"];
function scanner(fileData, classProps = [], action, fileCursor = new Cursor(fileData.content)) {
  const classesList = [], attachments = [], braceTrack = [], nativeAttributes = {}, styleDeclarations = {
    elid: 0,
    element: "",
    elvalue: "",
    symclasses: [],
    attributes: {},
    scope: 0 /* NULL */,
    tagCount: ++fileCursor.active.cycle,
    rowIndex: fileCursor.active.rowMarker,
    colIndex: fileCursor.active.colMarker,
    endMarker: 0,
    comments: [],
    styles: {},
    attachstring: ""
  };
  let deviance = 0, attr = "", value = "", awaitBrace = "", ok = false, isVal = false, selfClosed = false, classSynced = false, fallbackAquired = false;
  while (fileCursor.active.marker < fileCursor.content.length) {
    const ch = fileCursor.increment();
    if (fileCursor.active.last !== "\\") {
      if (!fallbackAquired && fileCursor.active.next === "<") {
        fallbackAquired = true;
        fileCursor.savefallback();
      }
      if (awaitBrace === ch) {
        braceTrack.pop();
        deviance = braceTrack.length;
        awaitBrace = bracePair2[braceTrack[deviance - 1]];
      } else if (openBraces2.includes(ch) && !["'", '"', "`"].includes(awaitBrace)) {
        braceTrack.push(ch);
        deviance = braceTrack.length;
        awaitBrace = bracePair2[ch];
      } else if (deviance === 0 && closeBraces2.includes(ch)) {
        break;
      }
      if (deviance === 0 && [" ", "\n", "\r", ">", "	"].includes(ch) && attr !== "") {
        const tr_Attr = attr.trim();
        const tr_Value = value.trim();
        if (!styleDeclarations.element.length) {
          styleDeclarations.elid = ROOT.customElements[tr_Attr] || 0;
          styleDeclarations.element = tr_Attr;
          styleDeclarations.elvalue = tr_Value;
        } else if (tr_Attr === "&") {
          if (tr_Value.length) {
            tr_Value.slice(1, -1).split("\n").map((l) => {
              const commentTrimmed = l.trim();
              if (commentTrimmed.length) {
                styleDeclarations.comments.push(commentTrimmed);
              }
            });
          }
        } else if (/^[\w\-]+\$+[\w\-]+$/i.test(tr_Attr)) {
          if (styleDeclarations.symclasses.length === 0) {
            if (tr_Attr.includes("$$$$")) {
              styleDeclarations.scope = 0 /* NULL */;
            } else if (fileData.manifesting.lookup.type === "ARTIFACT") {
              styleDeclarations.scope = 7 /* ARTIFACT */;
            } else if (tr_Attr.includes("$$$")) {
              styleDeclarations.scope = 3 /* PUBLIC */;
            } else if (tr_Attr.includes("$$")) {
              styleDeclarations.scope = 2 /* GLOBAL */;
            } else {
              styleDeclarations.scope = 1 /* LOCAL */;
            }
            if (styleDeclarations.scope !== 0 /* NULL */) {
              styleDeclarations.styles[""] = tr_Value;
            }
          }
          styleDeclarations.symclasses.push(tr_Attr);
        } else if (tr_Attr.endsWith("&")) {
          if (tr_Value.length) {
            styleDeclarations.styles[tr_Attr] = tr_Value;
          }
        } else if (classProps.includes(tr_Attr)) {
          classSynced = true;
          const result = classExtract(tr_Value, action, fileData, fileCursor.active);
          if (result.classList.length) {
            classesList.push(result.classList);
          }
          if (result.attachments.length) {
            attachments.push(...result.attachments);
          }
          nativeAttributes[tr_Attr] = result.scribed;
        } else {
          nativeAttributes[tr_Attr] = tr_Value;
        }
        isVal = false;
        attr = "";
        value = "";
      }
      if (deviance === 0 && (ch === ">" || ch === ";" || ch === "," || ch === "<")) {
        ok = ch === ">";
        break;
      }
    }
    if (deviance === 0 && ![" ", "=", "\n", "\r", "	", ">"].includes(ch) || deviance !== 0) {
      if (isVal) {
        value += ch;
      } else {
        attr += ch;
      }
    } else if (deviance === 0 && ch === "=") {
      isVal = true;
    }
  }
  ;
  styleDeclarations.endMarker = fileCursor.active.marker + (fileCursor.active.char === "<" ? 0 : 1);
  if (ok) {
    selfClosed = fileCursor.content[fileCursor.active.marker - 1] === "/";
  } else if (fallbackAquired) {
    fileCursor.loadfallback();
  }
  return {
    ok,
    selfClosed,
    classSynced,
    classesList,
    attachments,
    nativeAttributes,
    styleDeclarations
  };
}

// ts/script/file.ts
var CustomTagElements = Object.keys(ROOT.customElements);
var replacementTags = Object.entries(ROOT.customElements).reduce((A, [K, V]) => {
  A[`<!-- ${K} -->`] = V;
  A[`<${K} />`] = V;
  return A;
}, {});
function scanner2(fileData, classProps = [], action = 0 /* read */) {
  fileData.styleData.tagReplacements = [];
  const stylesList = [];
  const content = action === 0 /* read */ ? fileData.content : fileData.midway;
  const tagTrack = [];
  const classesList = [];
  const attachments = [];
  const fileCursor = new Cursor(content);
  let stream = "";
  do {
    const char = fileCursor.active.char;
    if (content[fileCursor.active.marker - 1] !== "\\" && char === "<" && /[!/\d\w-]/i.test(content[fileCursor.active.marker + 1])) {
      let subScribed = "";
      const tagStart = fileCursor.active.marker;
      const result = scanner(fileData, classProps, action, fileCursor);
      const fragment = content.slice(tagStart, result.styleDeclarations.endMarker);
      const hasDeclared = Object.keys(result.styleDeclarations.styles).length || result.styleDeclarations.symclasses.length;
      if (result.ok) {
        classesList.push(...result.classesList);
        attachments.push(...result.attachments);
        if (hasDeclared) {
          stylesList.push(result.styleDeclarations);
        } else if (replacementTags[fragment] && tagTrack.length === 0) {
          fileData.styleData.tagReplacements.push([replacementTags[fragment], stream.length]);
        }
        Object.entries(result.styleDeclarations.styles).forEach(([k, v]) => {
          result.styleDeclarations.styles[k] = v.slice(1, -1);
        });
        if (action === 0 /* read */) {
          subScribed = !hasDeclared ? fragment : result.styleDeclarations.elid ? "" : "<" + [
            result.styleDeclarations.element + (result.styleDeclarations.elvalue.length ? `=${result.styleDeclarations.elvalue}` : ""),
            ...Object.entries(result.nativeAttributes).map(([A, V]) => V === "" ? A : `${A}=${V}`)
          ].join(" ") + ">";
        } else if (!replacementTags[fragment]) {
          subScribed = result.classSynced ? "<" + [
            result.styleDeclarations.element + (result.styleDeclarations.elvalue.length ? `=${result.styleDeclarations.elvalue}` : ""),
            ...Object.entries(result.nativeAttributes).map(([A, V]) => V === "" ? A : `${A}=${V}`)
          ].join(" ") + ">" : fragment;
        }
        fileCursor.increment();
      } else {
        subScribed += fragment;
      }
      let exitedNow = false;
      if (!result.selfClosed && result.ok) {
        if (result.styleDeclarations.element[0] === "/") {
          const element = result.styleDeclarations.element.slice(1);
          const watchTrack = tagTrack.pop();
          if (watchTrack !== void 0) {
            if (watchTrack.element === element) {
              watchTrack.attachstring = content.slice(watchTrack.endMarker, tagStart);
              exitedNow = true;
            } else {
              tagTrack.push(watchTrack);
            }
          }
        } else if (CustomTagElements.includes(result.styleDeclarations.element) && hasDeclared) {
          result.styleDeclarations.attributes = result.nativeAttributes;
          tagTrack.push(result.styleDeclarations);
        }
      }
      if (tagTrack.length === 0 && !exitedNow) {
        stream += subScribed;
      }
    } else {
      fileCursor.increment();
      if (tagTrack.length === 0) {
        stream += char;
      }
    }
  } while (fileCursor.active.marker < content.length);
  fileData.styleData.tagReplacements.push([0, 0]);
  return { stream, classesList, stylesList, attachments };
}

// ts/data/filing.ts
function resolveGroup(extension, hasCluster, fromArtifacts, fromLibraries) {
  if (fromArtifacts) {
    return extension === ROOT.extension ? "ARTIFACT" : "NULL";
  } else if (fromLibraries) {
    return hasCluster ? "CLUSTER" : "AXIOM";
  } else {
    return "TARGET";
  }
}
function FILING(fileGroup, filePath, content, target = "", source = "", label = "") {
  const isLibrary = fileGroup === "library";
  const isArtifact = fileGroup === "artifact";
  const fromXtylesFolder = fileGroup !== "target";
  const targetPath = fileman_default.path.join(target, filePath);
  const sourcePath = fileman_default.path.join(source, filePath);
  const [extension, artifactName, liblevel, cluster] = fileman_default.path.basename(filePath).split(".").reverse();
  const num = Number(liblevel);
  const idn = isNaN(num) || num < 0 || num > 2 ? 0 : Math.floor(num);
  const normalFileName = isArtifact ? main_default.string.normalize(artifactName) : STATIC.Archive.name;
  const group = resolveGroup(extension, Boolean(cluster), isArtifact, isLibrary);
  const normalCluster = main_default.string.normalize(cluster);
  const classFront = (isArtifact ? `/${normalFileName}/` : "") + (idn > 0 && extension === "css" && normalCluster !== "-" ? normalCluster : "") + (fromXtylesFolder && extension === "css" ? "$".repeat(idn) : "");
  const result = {
    liblevel: idn,
    label,
    artifact: fromXtylesFolder ? artifactName : STATIC.Archive.name,
    filePath,
    extension,
    sourcePath,
    targetPath,
    classFront,
    debugclassFront: `${fromXtylesFolder ? group : ""}\\|${main_default.string.normalize(targetPath, [], [], ["/", "."])}`,
    manifesting: {
      lookup: {
        id: isLibrary ? String(idn) : isArtifact ? filePath : targetPath,
        type: group
      },
      local: {},
      global: {},
      public: {},
      errors: [],
      diagnostics: []
    },
    styleData: {
      usedIndexes: [],
      globalClasses: {},
      localClasses: {},
      publicClasses: {},
      styleMap: {},
      classTracks: [],
      attachments: [],
      tagReplacements: []
    },
    content,
    midway: "",
    scratch: ""
  };
  return result;
}

// ts/script/class.ts
var C_Target = class {
  constructor({
    source,
    target,
    stylesheet,
    extensions,
    fileContents,
    stylesheetContent
  }, label) {
    this.source = "";
    this.target = "";
    this.stylesheet = "";
    this.sourceStylesheet = "";
    this.targetStylesheet = "";
    this.stylesheetContent = "";
    this.fileCache = {};
    extensions[ROOT.extension] = [];
    this.source = source;
    this.target = target;
    this.stylesheet = stylesheet;
    this.sourceStylesheet = fileman_default.path.join(source, stylesheet);
    this.targetStylesheet = fileman_default.path.join(target, stylesheet);
    this.label = label;
    this.extnsProps = extensions;
    this.extensions = Object.keys(extensions);
    this.stylesheetContent = stylesheetContent || "";
    Object.entries(fileContents || {}).forEach(([filePath, fileContent], index) => this.SaveFile(filePath, fileContent, index));
  }
  SaveFile(filePath, fileContent, fileIndex = Object.keys(this.fileCache).length) {
    if (this.fileCache[filePath]) {
      this.fileCache[filePath].styleData.usedIndexes.forEach((index) => DISPOSE(index));
      Object.keys(this.fileCache[filePath].styleData.globalClasses).forEach((key) => DISPOSE(Number(key)));
      delete this.fileCache[filePath];
    }
    const FILE = FILING(
      "target",
      filePath,
      fileContent,
      this.target,
      this.source,
      `${this.label}_${main_default.string.enCounter(fileIndex)}`
    );
    this.fileCache[FILE.filePath] = FILE;
    const ParseResponse = scanner2(FILE, this.extnsProps[FILE.extension]);
    if (FILE.extension !== ROOT.extension) {
      FILE.styleData.classTracks.push(...ParseResponse.classesList);
      FILE.styleData.attachments.push(...ParseResponse.attachments);
    }
    ParseResponse.stylesList.forEach((tagStyle) => {
      if (tagStyle.symclasses.length === 0) {
        const E = GenerateError("Symclass missing declaration scope.", [`${FILE.targetPath}:${tagStyle.rowIndex}:${tagStyle.colIndex}`]);
        FILE.manifesting.errors.push(E.error);
        FILE.manifesting.diagnostics.push(E.diagnostic);
      } else if (tagStyle.symclasses.length > 1) {
        const E = GenerateError("Multiple Symclasses declaration scope.", [`${FILE.targetPath}:${tagStyle.rowIndex}:${tagStyle.colIndex}`]);
        FILE.manifesting.errors.push(E.error);
        FILE.manifesting.diagnostics.push(E.diagnostic);
      } else {
        const IndexMap = tagStyle.scope === 2 /* GLOBAL */ ? FILE.styleData.globalClasses : tagStyle.scope === 1 /* LOCAL */ ? FILE.styleData.localClasses : tagStyle.scope === 3 /* PUBLIC */ ? FILE.styleData.publicClasses : {};
        const skeletonMap = tagStyle.scope === 1 /* LOCAL */ ? FILE.manifesting.local : tagStyle.scope === 2 /* GLOBAL */ ? FILE.manifesting.global : tagStyle.scope === 3 /* PUBLIC */ ? FILE.manifesting.global : {};
        const response = parse_default.TagStyleScanner(tagStyle, FILE, IndexMap);
        const classdata = FETCH2(response.index);
        if (classdata.declarations.length === 1) {
          skeletonMap[response.symclass] = classdata.metadata;
          FILE.styleData.usedIndexes.push(response.index);
        }
        FILE.manifesting.errors.push(...response.errors);
        FILE.manifesting.diagnostics.push(...response.diagnostics);
      }
    });
    Object.assign(FILE.manifesting.lookup, { group: "target", id: FILE.targetPath });
    FILE.midway = ParseResponse.stream;
  }
  Accumulator() {
    const Cumulates = {
      report: [],
      globalClasses: {},
      publicClasses: {},
      fileManifests: {}
    };
    Cumulates.fileManifests[this.targetStylesheet] = {
      lookup: {
        id: this.targetStylesheet,
        type: "STYLESHEET"
      },
      public: {},
      global: {},
      local: {},
      errors: [],
      diagnostics: []
    };
    Cumulates.report.push(main_default2.tag.H2(`PROXY : ${this.target} -> ${this.source}`, main_default2.preset.primary, main_default2.style.AS_Bold));
    Object.values(this.fileCache).forEach((file) => {
      Cumulates.fileManifests[file.manifesting.lookup.id] = file.manifesting;
      Object.assign(Cumulates.globalClasses, file.styleData.globalClasses);
      Object.assign(Cumulates.publicClasses, file.styleData.publicClasses);
      const localKeys = Object.keys(file.styleData.localClasses);
      const publicKeys = Object.keys(file.styleData.publicClasses);
      const globalKeys = Object.keys(file.styleData.globalClasses);
      if (localKeys.length + globalKeys.length + publicKeys.length) {
        Cumulates.report.push(
          main_default2.MAKE(
            main_default2.tag.H6(file.targetPath, main_default2.preset.tertiary),
            // [
            // 	...$.list.Catalog(localKeys, 0, $.preset.text),
            // 	...$.list.Catalog(globalKeys, 0, $.preset.primary),
            // 	...$.list.Catalog(publicKeys, 0, $.preset.primary, $.style.AS_Bold),
            // ],
            main_default2.list.Catalog([
              ...localKeys,
              ...globalKeys,
              ...publicKeys
            ], 0, main_default2.preset.primary, main_default2.style.AS_Bold)
          )
        );
      }
    });
    return Cumulates;
  }
  GetTracks(classTracks = [], attachments = []) {
    Object.values(this.fileCache).forEach((filedata) => {
      filedata.styleData.attachments.forEach((attchment) => {
        const found = FIND(attchment, filedata.styleData.localClasses);
        if (found.index) {
          attachments.push(found.index);
        }
      });
      filedata.styleData.classTracks.forEach((group) => {
        const indextraces = group.reduce((indexAcc, className) => {
          const found = FIND(className, filedata.styleData.localClasses);
          if (found.index) {
            indexAcc.push(found.index);
            attachments.push(found.index);
            FETCH2(found.index).attachments.forEach((attchment) => {
              const i = FIND(attchment, filedata.styleData.localClasses).index;
              if (i) {
                attachments.push(i);
              }
            });
          }
          return indexAcc;
        }, []);
        if (indextraces.length) {
          classTracks.push(indextraces);
        }
      });
    });
    return { classTracks, attachments };
  }
  GetExports() {
    const exports = {};
    Object.values(this.fileCache).forEach((filedata) => {
      Object.values(filedata.styleData.publicClasses).forEach((pubindex) => {
        const exporting = render_default.Artifact(pubindex);
        exports[exporting.symclass] = exporting;
        FETCH2(pubindex).attachments.forEach((attchment) => {
          const subindex = FIND(attchment, filedata.styleData.localClasses).index;
          if (subindex) {
            const subexporting = render_default.Artifact(subindex);
            exporting.attachments.push(subexporting.symclass);
            exports[subexporting.symclass] = subexporting;
          }
        });
      });
    });
    return exports;
  }
  SyncClassnames(action) {
    Object.values(this.fileCache).forEach((filedata) => {
      filedata.scratch = scanner2(
        filedata,
        this.extnsProps[filedata.extension],
        action
      ).stream;
    });
  }
  SummonFiles(SaveFiles = {}, stylesheet, styleBlock, summonBlock, stapleBlock) {
    SaveFiles[this.sourceStylesheet] = stylesheet;
    Object.values(this.fileCache).forEach((data) => {
      if (data.extension !== ROOT.extension) {
        let fromPos = 0;
        SaveFiles[data.sourcePath] = data.styleData.tagReplacements.reduce((A, [elid, pos]) => {
          switch (elid) {
            case ROOT.customElements.staple:
              A += data.scratch.slice(fromPos, pos) + stapleBlock;
              break;
            case ROOT.customElements.summon:
              A += data.scratch.slice(fromPos, pos) + summonBlock;
              break;
            case ROOT.customElements.style:
              A += data.scratch.slice(fromPos, pos) + styleBlock;
              break;
            default:
              A += data.scratch.slice(fromPos);
          }
          ;
          fromPos = pos;
          return A;
        }, "");
        data.scratch = "";
      }
    });
  }
  UpdateCache() {
    Object.entries(this.fileCache).forEach(([filepath, filedata], index) => {
      this.SaveFile(filepath, filedata.content, index);
    });
  }
  ClearFiles() {
    Object.entries(this.fileCache).forEach(([filePath, fileCache]) => {
      fileCache.styleData.usedIndexes.forEach((index) => DISPOSE(index));
      delete this.fileCache[filePath];
    });
  }
};

// ts/style/stash.ts
function _DeleteLibraryFile(filePath) {
  if (FILES.LIBRARIES[filePath]) {
    FILES.LIBRARIES[filePath].styleData.usedIndexes.forEach((i) => DISPOSE(i));
    delete FILES.LIBRARIES[filePath];
  }
}
function _DeleteArtifactFile(filePath) {
  if (FILES.ARTIFACTS[filePath]) {
    FILES.ARTIFACTS[filePath].styleData.usedIndexes.forEach((i) => DISPOSE(i));
    delete FILES.ARTIFACTS[filePath];
  }
}
function _ClearStash() {
  Object.entries(CLASS.Library__Index).forEach(([selector, index]) => {
    DISPOSE(index);
    delete CLASS.Library__Index[selector];
  });
  Object.entries(CLASS.Artifact_Index).forEach(([selector, index]) => {
    DISPOSE(index);
    delete CLASS.Artifact_Index[selector];
  });
  Object.keys(FILES.LIBRARIES).forEach((filePath) => _DeleteLibraryFile(filePath));
  Object.keys(FILES.ARTIFACTS).forEach((filePath) => _DeleteArtifactFile(filePath));
}
function _SaveLibraryFile(filePath, fileContent) {
  if (FILES.LIBRARIES[filePath]) {
    _DeleteLibraryFile(filePath);
  }
  const filed = FILING("library", filePath, fileContent);
  if (filed.liblevel < 3) {
    FILES.LIBRARIES[filePath] = filed;
  }
}
function _SaveArtifactFile(filePath, fileContent) {
  if (FILES.ARTIFACTS[filePath]) {
    _DeleteArtifactFile(filePath);
  }
  const filed = FILING("artifact", filePath, fileContent);
  if (filed.liblevel < 3) {
    FILES.ARTIFACTS[filePath] = filed;
  }
}
function _StackLibraryFiles() {
  let length = 0;
  const none = {}, axiomMap = {}, clusterMap = {}, librariesLookup = {};
  Object.entries(FILES.LIBRARIES).forEach(([path2, data]) => {
    const reference = data.manifesting.lookup;
    const collection = reference.type === "AXIOM" ? axiomMap : reference.type === "CLUSTER" ? clusterMap : none;
    librariesLookup[path2] = reference;
    if (!collection[reference.id]) {
      collection[reference.id] = [data];
    } else {
      collection[reference.id].push(data);
    }
    if (Number(reference.id) > length) {
      length = Number(reference.id);
    }
  });
  const axiomArray = main_default.array.fromNumberedObject(axiomMap, length);
  const clusterArray = main_default.array.fromNumberedObject(clusterMap, length);
  return { librariesLookup, axiomArray, clusterArray };
}
function _StackArtifactFiles() {
  const artifactArray = [], artifactsLookup = {};
  Object.entries(FILES.ARTIFACTS).forEach(([path2, data]) => {
    const reference = data.manifesting.lookup;
    artifactsLookup[path2] = reference;
    if (reference.type === "ARTIFACT") {
      artifactArray.push(data);
    }
  });
  return { artifactsLookup, artifactArray };
}
function ReRender() {
  _ClearStash();
  Object.entries(STATIC.Libraries_Saved).forEach(([filePath, fileContent]) => {
    _SaveLibraryFile(filePath, fileContent);
  });
  Object.entries(STATIC.Artifacts_Saved).forEach(([filePath, fileContent]) => {
    _SaveArtifactFile(filePath, fileContent);
  });
  const { artifactsLookup, artifactArray } = _StackArtifactFiles();
  const artifactChart = {};
  const ArtifactSkeletons = artifactArray.reduce((collection, fileData) => {
    const indexMetaCollection = collection[fileData.filePath] = {};
    scanner2(fileData).stylesList.forEach((tagStyle) => {
      if (tagStyle.symclasses.length === 0) {
        const E = GenerateError("Symclass missing declaration scope.", [`${fileData.filePath}:${tagStyle.rowIndex}:${tagStyle.colIndex}`]);
        fileData.manifesting.errors.push(E.error);
        fileData.manifesting.diagnostics.push(E.diagnostic);
      } else if (tagStyle.symclasses.length > 1) {
        const E = GenerateError("Multiple Symclasses declaration scope.", [`${fileData.filePath}:${tagStyle.rowIndex}:${tagStyle.colIndex}`]);
        fileData.manifesting.errors.push(E.error);
        fileData.manifesting.diagnostics.push(E.diagnostic);
      } else {
        const response = parse_default.TagStyleScanner(tagStyle, fileData, CLASS.Artifact_Index);
        const styleData = FETCH2(response.index);
        if (styleData?.declarations.length === 1) {
          fileData.styleData.usedIndexes.push(response.index);
          indexMetaCollection[response.symclass] = styleData.metadata;
        }
        fileData.manifesting.errors.push(...response.errors);
        fileData.manifesting.diagnostics.push(...response.diagnostics);
      }
    });
    const classNames = Object.keys(indexMetaCollection);
    if (classNames.length) {
      artifactChart[`Artifact [${fileData.filePath}]: ${classNames.length} Classes`] = classNames;
    }
    return collection;
  }, {});
  const ArtifactsErrors = [];
  const ArtifactsDiagnostics = [];
  const nameCollitions = Object.values(FILES.ARTIFACTS).reduce((A, F) => {
    if (STATIC.Archive.name === F.artifact) {
      A.push(F.filePath);
    }
    return A;
  }, []);
  if (nameCollitions.length) {
    const E = GenerateError(`Artifact Name collitions: ${STATIC.Archive.name}`, nameCollitions);
    ArtifactsErrors.push(E.error);
    ArtifactsDiagnostics.push(E.diagnostic);
  }
  Object.values(artifactArray).forEach((file) => {
    ArtifactsErrors.push(...file.manifesting.errors);
    ArtifactsDiagnostics.push(...file.manifesting.diagnostics);
  });
  const artifactReport = ClassChart(`Artifact: ${Object.values(ArtifactSkeletons).reduce((a, v) => a += Object.keys(v).length, 0)}`, artifactChart);
  const axiomChart = {};
  const clusterChart = {};
  const { librariesLookup, axiomArray, clusterArray } = _StackLibraryFiles();
  const AxiomSkeletons = axiomArray.reduce((collection, fileData, index) => {
    const result = parse_default.CSSBulkScanner(fileData);
    collection[index] = result.indexMetaCollection;
    if (result.selectorList.length) {
      axiomChart[`Level ${index}: ${result.selectorList.length} Classes`] = result.selectorList;
    }
    return collection;
  }, {});
  const ClusterSkeletons = clusterArray.reduce((collection, fileDatas, index) => {
    const result = parse_default.CSSBulkScanner(fileDatas);
    collection[index] = result.indexMetaCollection;
    if (result.selectorList.length) {
      clusterChart[`Level ${index}: ${result.selectorList.length} Classes`] = result.selectorList;
    }
    return collection;
  }, {});
  const LibrariesErrors = [];
  const LibrariesDiagnostics = [];
  Object.values(axiomArray).forEach((level) => {
    Object.values(level).forEach((file) => {
      LibrariesErrors.push(...file.manifesting.errors);
      LibrariesDiagnostics.push(...file.manifesting.diagnostics);
    });
  });
  Object.values(clusterArray).forEach((level) => {
    Object.values(level).forEach((file) => {
      LibrariesErrors.push(...file.manifesting.errors);
      LibrariesDiagnostics.push(...file.manifesting.diagnostics);
    });
  });
  const libraryReport = [
    ClassChart(`Axiom: ${Object.values(AxiomSkeletons).reduce((a, v) => a += Object.keys(v).length, 0)}`, axiomChart),
    ClassChart(`Cluster: ${Object.values(ClusterSkeletons).reduce((a, v) => a += Object.keys(v).length, 0)}`, clusterChart)
  ].join("");
  DELTA.Report.libraries = libraryReport;
  DELTA.Report.artifacts = artifactReport;
  DELTA.Errors.libraries = LibrariesErrors;
  DELTA.Errors.artifacts = ArtifactsErrors;
  DELTA.Diagnostics.libraries = LibrariesDiagnostics;
  DELTA.Diagnostics.artifacts = ArtifactsDiagnostics;
  DELTA.Manifest.AXIOM = AxiomSkeletons;
  DELTA.Manifest.CLUSTER = ClusterSkeletons;
  DELTA.Manifest.ARTIFACT = ArtifactSkeletons;
  DELTA.Lookup.libraries = librariesLookup;
  DELTA.Lookup.artifacts = artifactsLookup;
}
function ReDeclare() {
  Object.values(CLASS.Artifact_Index).forEach((val) => {
    const value = CLASS.Index_to_Data[val];
    value.metadata.declarations = [...value.declarations];
  });
  Object.values(CLASS.Library__Index).forEach((val) => {
    const value = CLASS.Index_to_Data[val];
    value.metadata.declarations = [...value.declarations];
  });
}
var stash_default = {
  ReRender,
  ReDeclare
};

// ts/assemble.ts
function UpdateXtylesFolder() {
  RESET();
  Object.values(CLASS).forEach((V) => {
    for (const v in V) {
      delete V[v];
    }
  });
  Object.values(FILES).forEach((V) => {
    for (const v in V) {
      delete V[v];
    }
  });
  stash_default.ReRender();
}
function SaveToTarget(action = "upload", targetFolder = "", filePath = "", fileContent = "", extension = "") {
  let reCache = true;
  switch (action) {
    case "add":
    case "change":
      if (FILES.TARGETDIR[targetFolder].stylesheet === filePath) {
        STATIC.Targetdir_Saved[targetFolder].stylesheetContent = fileContent;
        FILES.TARGETDIR[targetFolder].stylesheetContent = fileContent;
        reCache = false;
      } else if (FILES.TARGETDIR[targetFolder].extensions.includes(extension)) {
        STATIC.Targetdir_Saved[targetFolder].fileContents[filePath] = fileContent;
        DELTA.DeltaPath = fileman_default.path.join(FILES.TARGETDIR[targetFolder].source, filePath);
      } else {
        DELTA.DeltaPath = `${FILES.TARGETDIR[targetFolder].source}/${filePath}`;
        DELTA.DeltaContent = fileContent;
        reCache = false;
      }
      break;
    case "unlink":
      if (STATIC.Targetdir_Saved[targetFolder]) {
        delete STATIC.Targetdir_Saved[targetFolder].fileContents[filePath];
      }
      break;
    default:
      hashrule_default.UPLOAD();
  }
  if (reCache) {
    stash_default.ReDeclare();
    Object.entries(CLASS.Public___Index).forEach(([c, i]) => {
      DISPOSE(i);
      delete CLASS.Public___Index[c];
    });
    Object.entries(CLASS.Global___Index).forEach(([c, i]) => {
      DISPOSE(i);
      delete CLASS.Global___Index[c];
    });
    Object.entries(FILES.TARGETDIR).forEach(([key, cache]) => {
      cache.ClearFiles();
      delete FILES.TARGETDIR[key];
    });
    FILES.TARGETDIR = {};
    CLASS.Public___Index = {};
    CLASS.Global___Index = {};
    Object.entries(STATIC.Targetdir_Saved).forEach(([key, files], index) => {
      FILES.TARGETDIR[key] = new C_Target(files, main_default.string.enCounter(index));
    });
  }
}
async function Accumulate() {
  const CUMULATED = {
    report: [],
    globalClasses: {},
    publicClasses: {},
    fileManifests: {}
  };
  Object.values(FILES.TARGETDIR).forEach((cache) => {
    const C = cache.Accumulator();
    CUMULATED.report.push(...C.report);
    Object.assign(CUMULATED.globalClasses, C.globalClasses);
    Object.assign(CUMULATED.publicClasses, C.publicClasses);
    Object.assign(CUMULATED.fileManifests, C.fileManifests);
  });
  CLASS.Global___Index = CUMULATED.globalClasses;
  CLASS.Public___Index = CUMULATED.publicClasses;
  DELTA.Report.archives = main_default2.MAKE("", CUMULATED.report);
  DELTA.Manifest.LOCAL = {};
  DELTA.Manifest.GLOBAL = {};
  DELTA.Lookup.archives = {};
  DELTA.Errors.archives = [];
  DELTA.Diagnostics.archives = [];
  Object.entries(CUMULATED.fileManifests).forEach(([K, V]) => {
    DELTA.Manifest.LOCAL[K] = V.local;
    DELTA.Manifest.GLOBAL[K] = { ...V.public, ...V.global };
    DELTA.Lookup.archives[K] = V.lookup;
    DELTA.Errors.archives.push(...V.errors);
    DELTA.Diagnostics.archives.push(...V.diagnostics);
  });
  DELTA.Manifest.filelookup = {};
  Object.values(DELTA.Lookup).forEach((V) => Object.assign(DELTA.Manifest.filelookup, V));
  DELTA.Errors.multiples = [];
  DELTA.Diagnostics.multiples = [];
  Object.values(CLASS.Index_to_Data).forEach((data) => {
    if (data.metadata.declarations.length > 1) {
      const E = GenerateError(`Duplicate Declarations: ${data.symclass}`, data.metadata.declarations);
      DELTA.Errors.multiples.push(E.error);
      DELTA.Diagnostics.multiples.push(E.diagnostic);
    }
  });
  DELTA.Manifest.errors = [];
  Object.values(DELTA.Diagnostics).forEach((V) => DELTA.Manifest.errors.push(...V));
  DELTA.ErrorCount = DELTA.Manifest.errors.length;
  DELTA.Report.errors = main_default2.MAKE(
    main_default2.tag.H2(`${DELTA.ErrorCount} Errors`, DELTA.ErrorCount ? main_default2.preset.failed : main_default2.preset.success),
    Object.values(DELTA.Errors).reduce((A, I) => {
      A.push(...I);
      return A;
    }, [])
  );
}
function SaveClassRefs(stash) {
  CLASS.Sync_PublishIndexMap = stash.recompClasslist.reduce((acc, [index, classId]) => {
    const className = "_" + main_default.string.enCounter(classId);
    acc.push([`.${className}`, index]);
    return acc;
  }, []);
  Object.entries(stash.referenceMap).forEach(([jsonArray, iMap]) => {
    CLASS.Sync_ClassDictionary[jsonArray] = Object.entries(iMap).reduce((a, [ref, id2]) => {
      a[ref] = "_" + main_default.string.enCounter(id2);
      return a;
    }, {});
  });
}
async function Synthasize(OUTFILES = {}) {
  Accumulate();
  CLASS.Sync_ClassDictionary = {};
  CLASS.Sync_PublishIndexMap = [];
  const ATTACHMENTS = [];
  const CLASSESLIST = [];
  Object.values(FILES.TARGETDIR).forEach((cache) => cache.GetTracks(CLASSESLIST, ATTACHMENTS));
  if (STATIC.WATCH) {
    DELTA.FinalMessage = DELTA.ErrorCount + " Errors.";
  } else {
    if (STATIC.Command === "preview") {
      const response = await order(CLASSESLIST, STATIC.Command, STATIC.Argument);
      SaveClassRefs(response.result);
      if (DELTA.Manifest.errors.length) {
        DELTA.FinalMessage = DELTA.ErrorCount + " Unresolved Errors. Rectify them to proceed with 'publish' command.";
      } else {
        DELTA.FinalMessage = "Preview verified with no major errors. Procceed to 'publish' using your key.";
      }
    }
    if (STATIC.Command === "publish") {
      if (DELTA.Manifest.errors.length) {
        const response = await order(CLASSESLIST, "preview", STATIC.Argument);
        STATIC.Command = "preview";
        SaveClassRefs(response.result);
        DELTA.FinalMessage = "Errors in " + DELTA.ErrorCount + " Tags. Falling back to 'preview' command.";
      } else {
        const archive = artifact_default.ARCHIVE();
        const response = await order(CLASSESLIST, "publish", STATIC.Argument, archive);
        SaveClassRefs(response.result);
        if (response.status) {
          await artifact_default.DEPLOY(OUTFILES);
          DELTA.FinalMessage = "Build Success.";
        } else {
          DELTA.PublishError = response.message;
          DELTA.FinalMessage = "Build Atttempt Failed. Fallback with Preview.";
        }
      }
    }
  }
  return ATTACHMENTS;
}
async function GenFinalSheets(OUTFILES = {}) {
  const ATTACHMENTS = new Set(await Synthasize(OUTFILES));
  const RENDERFRAGS = {
    Root: "",
    Class: "",
    Attach: "",
    Appendix: ""
  };
  const indexScanned = parse_default.CSSFileScanner(main_default.code.uncomment.Css(STATIC.RootCSS), "INDEX ||");
  DELTA.Manifest.constants = Object.keys(indexScanned.variables);
  DELTA.Report.constants = ListCatalog("Root Constants", DELTA.Manifest.constants);
  indexScanned.attachments.forEach((attachment) => ATTACHMENTS.add(FIND(attachment).index));
  const WATCHINDEX = RENDERFRAGS.Root = render_default.Prefixed(indexScanned.styles);
  RENDERFRAGS.Appendix = render_default.Prefixed(
    Object.values(FILES.TARGETDIR).reduce((appendix, cache) => {
      const appendixScanned = parse_default.CSSFileScanner(cache.stylesheetContent, `APPENDIX : ${cache.targetStylesheet} ||`);
      appendix.push(...appendixScanned.styles);
      appendixScanned.attachments.forEach((i) => {
        const found = FIND(i).index;
        if (found) {
          ATTACHMENTS.add(FIND(i).index);
        }
      });
      return appendix;
    }, [])
  );
  const targetRenderAction = STATIC.Command === "debug" ? 3 /* monitor */ : STATIC.Command === "preview" && STATIC.Argument === "watch" ? 2 /* watch */ : 1 /* sync */;
  Object.values(FILES.TARGETDIR).forEach((cache) => cache.SyncClassnames(targetRenderAction));
  RENDERFRAGS.Class = render_default.Switched(CLASS.Sync_PublishIndexMap);
  const ATTACH_STAPLES = [];
  const ATTACH_STYLES = [];
  (STATIC.WATCH ? Object.keys(CLASS.Index_to_Data).map((i) => Number(i)) : Array.from(ATTACHMENTS)).forEach((attachment) => {
    const ClassData = FETCH2(attachment);
    const AttachedStyle = Object.entries(ClassData.snippet_style);
    if (AttachedStyle.length) {
      ATTACH_STYLES.push(...AttachedStyle);
    }
    if (ClassData.snippet_staple.length) {
      ATTACH_STAPLES.push(ClassData.snippet_staple);
    }
    return ClassData.snippet_style;
  });
  RENDERFRAGS.Attach = render_default.Prefixed(ATTACH_STYLES);
  const STAPLESHEET = main_default.string.minify(main_default.code.uncomment.Script(ATTACH_STAPLES.join(""), false, false, true));
  const STYLESHEET = Object.entries(RENDERFRAGS).map(([chapter, content]) => STATIC.DEBUG ? `

/* CHAPTER: ${chapter} */
${content}
` : content).join("");
  const WATCHCLASS = STATIC.WATCH ? main_default.string.minify(main_default.code.uncomment.Script(
    render_default.Switched(
      Object.entries(CLASS.Index_to_Data).reduce((A, [I, D]) => {
        A.push(["." + D.metadata.watchclass, Number(I)]);
        return A;
      }, [])
    ) + RENDERFRAGS.Attach
  )) : "";
  return { RENDERFRAGS, STYLESHEET, STAPLESHEET, WATCHINDEX, WATCHCLASS };
}
async function Generate() {
  const OUTFILES = {};
  if (DELTA.DeltaContent.length) {
    OUTFILES[DELTA.DeltaPath] = DELTA.DeltaContent;
  } else {
    const {
      RENDERFRAGS,
      STYLESHEET,
      STAPLESHEET,
      WATCHINDEX,
      WATCHCLASS
    } = await GenFinalSheets(OUTFILES);
    const STYLEBLOCK = `
<style>${STYLESHEET}</style>`;
    const SUMMONBLOCK = `
${STYLEBLOCK}
<div>${STYLESHEET}</div>`;
    Object.values(FILES.TARGETDIR).forEach((cache) => {
      cache.SummonFiles(OUTFILES, STYLESHEET, STYLEBLOCK, SUMMONBLOCK, STAPLESHEET);
    });
    if (STATIC.WATCH) {
      OUTFILES[PATH.autogen.manifest.path] = JSON.stringify(DELTA.Manifest);
      OUTFILES[PATH.autogen.index.path] = WATCHINDEX;
      OUTFILES[PATH.autogen.watch.path] = WATCHCLASS;
      OUTFILES[PATH.autogen.staple.path] = STAPLESHEET;
    } else {
      const memChart = Object.entries(RENDERFRAGS).reduce((A, [K, V]) => {
        A[K] = `${main_default.string.stringMem(V)} Kb`.padStart(9, " ");
        return A;
      }, {});
      memChart[`[***.css]`] = `${main_default.string.stringMem(STYLESHEET)} Kb`.padStart(9, " ");
      DELTA.Report.memChart = main_default2.MAKE(
        main_default2.tag.H2(DELTA.FinalMessage, DELTA.ErrorCount ? main_default2.preset.failed : main_default2.preset.success),
        ListProps(memChart, [...main_default2.preset.primary, main_default2.style.AS_Bold], [...main_default2.preset.tertiary, main_default2.style.AS_Bold])
      );
    }
  }
  DELTA.DeltaPath = "";
  DELTA.DeltaContent = "";
  return {
    SaveFiles: OUTFILES,
    ConsoleReport: main_default2.MAKE("", Object.values(DELTA.Report).filter((string) => string !== ""))
  };
}

// ts/data/verify.ts
import PATH2 from "path";
async function cssImport(filePathArray = []) {
  const resolvedFiles = new Set(filePathArray.map((filePath) => fileman_default.path.resolves(filePath)));
  async function inlineImports(filePath) {
    const baseDir = PATH2.dirname(filePath);
    let content = (await fileman_default.read.file(filePath)).data;
    const importRegex = /@import\s+(?:url\()?["']?(.*?)["']?\)?\s*;/g;
    for (const [fullMatch, importPath] of content.matchAll(importRegex)) {
      const absoluteImportPath = PATH2.resolve(baseDir, importPath);
      const replacement = resolvedFiles.has(absoluteImportPath) ? "" : await inlineImports(absoluteImportPath);
      content = content.replace(fullMatch, replacement);
      resolvedFiles.add(absoluteImportPath);
    }
    return content;
  }
  const inlined = [...resolvedFiles].map((i) => inlineImports(i));
  return inlined.join("");
}
async function proxyMapDependency(proxyMap = [], xtylesDirectory) {
  const warnings = [];
  const notifications = [];
  await Promise.all(
    proxyMap.map(async (map, index) => {
      if (!fileman_default.path.isIndependent(map.source, map.target)) {
        warnings.push(
          `[${index}]:source::"${map.source}" & [${index}]:target::"${map.target}" are not independent.`
        );
      }
      if (!fileman_default.path.isIndependent(map.source, xtylesDirectory)) {
        warnings.push(
          `[${index}]:source::"${map.source}" should not dependent on "${xtylesDirectory}".`
        );
      }
      if (!fileman_default.path.isIndependent(xtylesDirectory, map.target)) {
        warnings.push(
          `[${index}]:target::"${map.target}" should not be dependent on "${xtylesDirectory}".`
        );
      }
      if (fileman_default.path.ifFolder(map.source)) {
        const targetStat = fileman_default.path.available(map.target);
        if (targetStat.type === "file") {
          warnings.push(
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
            warnings.push(
              `[${index}]:stylesheet::"${map.stylesheet}" file not found in "${map.source}" folder.`
            );
          }
          if (!targetStylesheetExists) {
            warnings.push(
              `[${index}]:stylesheet::"${map.stylesheet}" file not found in "${map.target}" folder.`
            );
          }
        }
      } else {
        warnings.push(`[${index}]:"${map.source}" folder not found.`);
      }
    })
  );
  for (let i = 0; i < proxyMap.length; i++) {
    for (let j = i + 1; j < proxyMap.length; j++) {
      if (fileman_default.path.isIndependent(proxyMap[i].source, proxyMap[j].source) || fileman_default.path.isIndependent(proxyMap[j].target, proxyMap[i].target)) {
        warnings.push(
          `[${i}]:target::"${proxyMap[i].target}" & [${j}]:source::"${proxyMap[j].source}" are not independent.`
        );
      }
      if (fileman_default.path.isIndependent(proxyMap[i].source, proxyMap[j].target) || fileman_default.path.isIndependent(proxyMap[i].target, proxyMap[j].source)) {
        warnings.push(
          `[${i}]:source::"${proxyMap[i].source}" & [${j}]:target::"${proxyMap[j].target}" are not independent.`
        );
      }
    }
  }
  return { warnings, notifications };
}
async function proxyMapSync(proxyMaps = []) {
  const ProxyMapStatic = proxyMaps.reduce((acc, map) => {
    acc[map.target] = {
      ...map,
      fileContents: {},
      stylesheetContent: ""
    };
    return acc;
  }, {});
  await Promise.all(
    Object.values(ProxyMapStatic).map(async (map) => {
      map.extensions[ROOT.extension] = [];
      const syncResult = await fileman_default.sync.bulk(
        map.target,
        map.source,
        Object.keys(map.extensions),
        [ROOT.extension],
        [map.stylesheet]
      );
      if (syncResult.status) {
        map.fileContents = syncResult.fileContents;
        map.stylesheetContent = (await fileman_default.read.file(
          fileman_default.path.join(map.target, map.stylesheet)
        )).data;
      }
    })
  );
  return ProxyMapStatic;
}

// ts/data/action.ts
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
function setVendors() {
  ROOT.vendors = Array.from(collectTypeStringKeys(STATIC.Prefix));
}
function setTWEAKS(tweaks) {
  Object.assign(STATIC.Tweaks, ROOT.Tweaks);
  if (typeof tweaks === "object") {
    Object.keys(STATIC.Tweaks).forEach((key) => {
      if (typeof STATIC.Tweaks[key] === typeof tweaks[key]) {
        STATIC.Tweaks[key] = tweaks[key];
      }
    });
  }
  ;
}
function SetENV(rootPath2, workPath2, packageEssential) {
  STATIC.RootPath = rootPath2;
  STATIC.WorkPath = workPath2;
  ROOT.name = packageEssential.name || ROOT.name;
  ROOT.version = packageEssential.version || ROOT.version;
  ROOT.bin = packageEssential.bin;
  Object.entries(PATH).forEach(([groupName, groupPaths]) => {
    if (groupName === "blueprint") {
      Object.values(groupPaths).forEach((source) => {
        source.path = fileman_default.path.join(STATIC.RootPath, ...source.frags);
      });
    } else {
      Object.values(groupPaths).forEach((source) => {
        source.path = fileman_default.path.join(...source.frags);
      });
    }
  });
  Object.entries(SYNC).forEach(([_, groupPaths]) => {
    Object.values(groupPaths).forEach((source) => {
      source.path = fileman_default.path.join(STATIC.RootPath, ...source.frags);
    });
  });
  const CDN = ROOT.url.Cdn + "version/" + ROOT.version.split(".")[0] + "/";
  Object.values(SYNC).forEach((object) => {
    Object.values(object).forEach((entry) => {
      entry.url = CDN + entry.url;
      entry.path = fileman_default.path.join(STATIC.RootPath, ...entry.frags);
    });
  });
}
function GetCacheUsage() {
  const chart = {
    "Sync": main_default.string.stringMem(JSON.stringify(SYNC)),
    "Path": main_default.string.stringMem(JSON.stringify(PATH)),
    "Root": main_default.string.stringMem(JSON.stringify(ROOT)),
    "Delta": main_default.string.stringMem(JSON.stringify(DELTA)),
    "Class": main_default.string.stringMem(JSON.stringify(CLASS)),
    "Files": main_default.string.stringMem(JSON.stringify(FILES)),
    "Static": main_default.string.stringMem(JSON.stringify(STATIC)),
    "Proxy": Object.values(FILES.TARGETDIR).reduce((t, c) => {
      t += main_default.string.stringMem(JSON.stringify(c));
      return t;
    }, 0)
  };
  chart["Total"] = Object.values(chart).reduce((a, i) => a += i, 0);
  return Object.entries(chart).map(([k, v]) => `${k} : ${v.toFixed(2)} Kb`);
}

// ts/data/fetch.ts
async function FetchDocs() {
  await Promise.all(Object.values(SYNC).map((sync) => {
    Object.values(sync).map(async (s) => {
      if (s.url && s.path) {
        s.content = await fileman_default.sync.file(s.url, s.path);
      }
    });
  }));
}
async function Initialize() {
  try {
    main_default2.TASK("Initializing setup.", 0);
    main_default2.TASK("Cloning scaffold to Project");
    await fileman_default.clone.safe(PATH.blueprint.scaffold.path, PATH.folder.scaffold.path);
    await fileman_default.clone.safe(PATH.blueprint.libraries.path, PATH.folder.libraries.path);
    main_default2.POST(ListSteps(
      "Next Steps",
      [
        "Adjust " + main_default2.FMT(PATH.json.configure.path, main_default2.style.AS_Bold, ...main_default2.preset.primary) + " according to the requirements of your project.",
        "Execute " + main_default2.FMT('"init"', main_default2.style.AS_Bold, ...main_default2.preset.primary) + " again to generate the necessary configuration folders.",
        "During execution " + main_default2.FMT("{target}", main_default2.style.AS_Bold, ...main_default2.preset.primary) + " folder will be cloned from " + main_default2.FMT("{source}", main_default2.style.AS_Bold, ...main_default2.preset.primary) + " folder.",
        "This folder will act as proxy for " + ROOT.name + ".",
        "In the " + main_default2.FMT("{target}/{stylesheet}", main_default2.style.AS_Bold, ...main_default2.preset.primary) + ", content from " + main_default2.FMT("{target}/{stylesheet}", main_default2.style.AS_Bold, ...main_default2.preset.primary) + " will be appended."
      ]
    ));
    main_default2.POST(ListRecord("Available Commands", ROOT.commands));
    main_default2.POST(ListSteps(
      "Publish command instructions.",
      ROOT.version === "0" ? ["This command is not activated."] : [
        "Create a new project and use its access key. For action visit " + main_default2.FMT(ROOT.url.Console, main_default2.style.AS_Bold, ...main_default2.preset.primary),
        "If using in CI/CD workflow, it is suggested to use " + main_default2.FMT("{bin} publish {key}", main_default2.style.AS_Bold, ...main_default2.preset.primary)
      ]
    ));
    await FetchDocs();
    return main_default2.tag.H4("Initialized directory", main_default2.preset.success, main_default2.style.AS_Bold);
  } catch (err) {
    return main_default2.MAKE(
      main_default2.tag.H4("Initialization failed.", main_default2.preset.failed, main_default2.style.AS_Bold),
      err instanceof Error ? [err.message] : [],
      [main_default2.list.Bullets, 0, main_default2.preset.failed]
    );
  }
}
async function VerifySetupStruct() {
  const result = { started: false, proceed: false, report: "" };
  if (fileman_default.path.ifFolder(PATH.folder.scaffold.path)) {
    const errors = {};
    await fileman_default.write.file(PATH.md.reference.path, SYNC.MARKDOWN.readme.content);
    await fileman_default.write.file(PATH.md.guildelines.path, SYNC.MARKDOWN.guildelines.content);
    await fileman_default.clone.safe(PATH.blueprint.scaffold.path, PATH.folder.scaffold.path);
    main_default2.TASK("Verifying directory status", 0);
    Object.entries(PATH).forEach(([K, V]) => Object.entries(V).forEach(([_, v]) => {
      if (v.essential && (K === "folder" ? !fileman_default.path.ifFolder(v.path) : !fileman_default.path.ifFile(v.path)) && K !== "blueprint") {
        main_default2.STEP("Path : " + v.path);
        errors[v.path] = "Path not found.";
      }
    }));
    main_default2.TASK("Verification finished");
    result.started = true;
    result.proceed = Object.keys(errors).length === 0;
    result.report = Object.keys(errors).length === 0 ? main_default2.MAKE(main_default2.tag.H4("Setup Healthy", main_default2.preset.success, main_default2.style.AS_Bold)) : main_default2.MAKE(main_default2.tag.H4("Error Paths", main_default2.preset.failed), ListProps(errors), [main_default2.list.Bullets, 0, main_default2.preset.failed]);
  } else {
    result.report = main_default2.MAKE(
      main_default2.tag.H4("Setup not initialized in directory.", main_default2.preset.warning, main_default2.style.AS_Bold),
      [`Use "init" command to initialize.`],
      [main_default2.list.Bullets, 0, main_default2.preset.warning]
    );
  }
  return result;
}
async function FetchStatics(vendorSource) {
  main_default2.TASK("Loading vendor-prefixes");
  const PrefixObtained = await async function() {
    const result1 = await fileman_default.read.json(vendorSource, true);
    if (result1.status) {
      return result1.data;
    }
    ;
    const result2 = await fileman_default.read.json(ROOT.url.Prefixes + vendorSource, true);
    if (result2.status) {
      return result2.data;
    }
    ;
    const result3 = await fileman_default.read.json(PATH.blueprint.prefixes.path, false);
    if (result3.status) {
      return result3.data;
    }
    ;
    return {};
  }();
  await fileman_default.write.json(PATH.blueprint.prefixes.path, PrefixObtained);
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
  STATIC.Prefix.pseudos = { ...PrefixRead.classes, ...PrefixRead.elements, ...PrefixRead.pseudos };
  STATIC.Prefix.attributes = { ...PrefixRead.attributes };
  STATIC.Prefix.atrules = { ...PrefixRead.atrules };
  STATIC.Prefix.values = { ...PrefixRead.values };
  setVendors();
}
function fixPath(string) {
  return fileman_default.path.join(...string.replace(/\\/, "/").split("/"));
}
async function VerifyConfigs(loadStatics) {
  main_default2.TASK("Initializing configs", 0);
  const errors = [];
  main_default2.STEP("PATH : " + PATH.json.configure.path);
  const config = await fileman_default.read.json(PATH.json.configure.path);
  if (config.status) {
    const CONFIG = config.data;
    if (loadStatics) {
      await FetchStatics(CONFIG.vendors);
    }
    setTWEAKS(CONFIG.tweaks);
    STATIC.ProxyMap = Array.isArray(CONFIG.proxymap) ? CONFIG.proxymap.reduce((A, I) => {
      if (typeof I === "object" && typeof I.source === "string" && typeof I.target === "string" && typeof I.stylesheet === "string" && typeof I.extensions === "object" && I.source !== "" && I.target !== "" && I.stylesheet !== "" && Object.keys(I.extensions).length !== 0) {
        Object.entries(I.extensions).forEach(([K, V]) => {
          if (Array.isArray(V)) {
            I.extensions[K] = V.filter((e) => typeof e === "string");
          } else {
            I.extensions[K] = [];
          }
        });
        I.source = fixPath(I.source);
        I.target = fixPath(I.target);
        I.stylesheet = fixPath(I.stylesheet);
        A.push(I);
      }
      return A;
    }, []) : [];
    if (STATIC.ProxyMap.length === 0) {
      errors.push(main_default2.tag.Li(PATH.json.configure.path + ": Workable proxies unavailable."));
    }
    Object.assign(STATIC.Archive, config.data);
    STATIC.Archive.name = STATIC.Archive.name = CONFIG.name || STATIC.ProjectName;
    STATIC.Archive.version = STATIC.Archive.version = CONFIG.version || STATIC.ProjectVersion;
    STATIC.Archive.readme = (await fileman_default.read.file(PATH.md.readme.path)).data;
    STATIC.Archive.licence = (await fileman_default.read.file(PATH.md.licence.path)).data;
    STATIC.Artifacts_Saved = Object.entries(typeof CONFIG.artifacts === "object" ? CONFIG.artifacts : {}).reduce((a, [k, v]) => {
      if (typeof v === "string" && v !== "-") {
        a[k] = v;
      }
      return a;
    }, {});
    const results = await proxyMapDependency(STATIC.ProxyMap, PATH.folder.scaffold.path);
    errors.push(...results.warnings);
  } else {
    errors.push(`${PATH.json.configure.path} : Bad json file.`);
  }
  main_default2.TASK("Initialization finished");
  return {
    status: Object.keys(errors).length === 0,
    report: main_default2.MAKE(
      Object.keys(errors).length === 0 ? main_default2.tag.H4("Configs Healthy", main_default2.preset.success, main_default2.style.AS_Bold) : main_default2.tag.H4("Error Paths: " + PATH.json.configure.path, main_default2.preset.failed, main_default2.style.AS_Bold),
      errors,
      [main_default2.list.Bullets, 0, main_default2.preset.warning]
    )
  };
}
async function SaveRootCss() {
  main_default2.TASK("Updating Index");
  STATIC.RootCSS = await cssImport(Object.values(PATH.css).map((css) => css.path));
}
async function SaveLibraries() {
  main_default2.TASK("Updating Library");
  STATIC.Libraries_Saved = await fileman_default.read.bulk(PATH.folder.libraries.path, ["css"]);
}
async function SaveExternals() {
  main_default2.TASK("Updating External Artifacts");
  STATIC.Artifacts_Saved = await fileman_default.read.bulk(PATH.folder.artifacts.path, [ROOT.extension, "css", "md"]);
}
async function SaveTargets() {
  main_default2.TASK("Syncing proxy folders", 0);
  Object.keys(STATIC.Targetdir_Saved).forEach((key) => delete STATIC.Targetdir_Saved[key]);
  STATIC.Targetdir_Saved = await proxyMapSync(STATIC.ProxyMap);
}
async function SaveHashrule() {
  main_default2.TASK("Updating Hashrule", 0);
  const errors = {};
  main_default2.STEP("PATH : " + PATH.json.hashrule.path);
  const hashrule = await fileman_default.read.json(PATH.json.hashrule.path);
  Object.keys(STATIC.Hashrule).forEach((key) => delete STATIC.Hashrule[key]);
  if (hashrule.status) {
    Object.entries(hashrule.data).forEach(([key, value]) => {
      if (typeof value === "string") {
        STATIC.Hashrule[key] = value;
      } else {
        errors[key] = `Value of type "STRING".`;
      }
    });
  } else {
    errors["ERROR"] = `Bad json file.`;
  }
  main_default2.TASK("Analysis complete");
  return {
    status: Object.keys(errors).length === 0,
    report: main_default2.MAKE(
      main_default2.tag.H4("Hashrule error: " + PATH.json.hashrule.path, main_default2.preset.failed),
      ListProps(errors, main_default2.preset.primary, main_default2.preset.text),
      [main_default2.list.Blocks, 0, main_default2.preset.text, main_default2.style.AS_Bold],
      [main_default2.list.Bullets, 0, main_default2.preset.failed, main_default2.style.AS_Bold]
    )
  };
}

// ts/data/watch.ts
import PATH3 from "path";
var import_chokidar = __toESM(require_chokidar(), 1);
var queue = [];
function add(event) {
  queue.push(event);
}
function pull() {
  return queue.length > 0 ? queue.shift() : null;
}
function Init(folders = [], ignores = []) {
  const folderMaps = folders.reduce((acc, folder) => {
    acc[PATH3.resolve(folder)] = folder;
    return acc;
  }, {});
  const resolvedFolders = Object.keys(folderMaps);
  const resolvedIgnores = ignores.map((p) => PATH3.resolve(p));
  const handleEventInternal = async (action, filePath) => {
    const event = {
      timeStamp: "",
      action: "",
      folder: "",
      filePath: "",
      fileContent: "",
      extension: PATH3.extname(filePath)?.slice(1)
    };
    const t = /* @__PURE__ */ new Date();
    event.timeStamp = t.getHours().toString().padStart(2, "0") + `:` + t.getMinutes().toString().padStart(2, "0") + `:` + t.getSeconds().toString().padStart(2, "0");
    event.action = action;
    event.folder = folderMaps[resolvedFolders.find((folder) => filePath.startsWith(folder)) || ""];
    event.filePath = PATH3.relative(event.folder, filePath);
    if (action === "add" || action === "change") {
      const content = await fileman_default.read.file(filePath);
      if (content.status) {
        event.fileContent = content.data;
      }
    }
    add(event);
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

// ts/commander.ts
function reporter(heading, targets, report) {
  main_default2.render.write(
    main_default2.MAKE("", [
      main_default2.MAKE(
        main_default2.tag.H1(heading, main_default2.preset.primary),
        targets.map((i) => `Watching : ${i}`),
        [main_default2.list.Bullets, 0, main_default2.preset.tertiary]
      ),
      report,
      main_default2.MAKE(
        main_default2.tag.H4("Press Ctrl+C to stop watching.", main_default2.preset.failed),
        STATIC.Tweaks.CacheUsage ? GetCacheUsage() : [],
        [main_default2.list.Catalog, 0, main_default2.preset.tertiary]
      )
    ])
  );
}
async function execute(chapter) {
  let stopWatcher = null;
  let OutFiles = {};
  let SaveAction = null;
  let report = "", targets = [], reportNext = false, step2 = "Initialize", staticsFetched = false, heading = "Initial Build";
  do {
    switch (step2) {
      case "Initialize":
        main_default2.POST(main_default2.MAKE(main_default2.tag.H1(chapter)));
      case "VerifySetupStruct": {
        const verifyStructResult = await VerifySetupStruct();
        if (!verifyStructResult.proceed) {
          report = verifyStructResult.report;
          step2 = "WatchFolders";
          break;
        } else {
          report = "";
        }
      }
      case "ReadRootCss": {
        await SaveRootCss();
      }
      case "ReadLibraries": {
        await SaveLibraries();
      }
      case "VerifyConfigs": {
        const verifyConfigsResult = await VerifyConfigs(!staticsFetched);
        if (!verifyConfigsResult.status) {
          report = verifyConfigsResult.report;
          step2 = "WatchFolders";
          break;
        } else {
          staticsFetched = true;
          report = "";
        }
      }
      case "ReadPackages": {
        await SaveExternals();
      }
      case "ReadTargets": {
        await SaveTargets();
      }
      case "ReadHashrule": {
        const hashruleAnalysis = await SaveHashrule();
        if (!hashruleAnalysis.status) {
          report = hashruleAnalysis.report;
          step2 = "WatchFolders";
          break;
        } else {
          report = "";
        }
      }
      case "ProcessXtylesFolder": {
        UpdateXtylesFolder();
      }
      case "ProcessProxyFolders": {
        SaveToTarget();
      }
      case "GenerateFinals": {
        const response = await Generate();
        OutFiles = response.SaveFiles;
        report = response.ConsoleReport;
      }
      case "Publish": {
        if (Object.keys(OutFiles).length) {
          if (SaveAction) {
            await SaveAction;
          }
          SaveAction = fileman_default.write.bulk(OutFiles);
        }
        if (reportNext) {
          reporter(heading, targets, report);
          reportNext = false;
        }
        ;
      }
      case "WatchFolders": {
        if (STATIC.WATCH) {
          step2 = "WatchFolders";
        } else {
          if (stopWatcher) {
            stopWatcher();
            stopWatcher = null;
          }
          break;
        }
        if (!stopWatcher) {
          targets = Object.keys(FILES.TARGETDIR);
          const targetFolders = [...targets, PATH.folder.scaffold.path];
          const ignoreFolders = [
            PATH.folder.autogen.path,
            PATH.folder.archive.path
          ];
          process.on("SIGINT", () => {
            if (stopWatcher) {
              stopWatcher();
              stopWatcher = null;
              main_default2.render.write("\n", 2);
            }
            process.exit();
          });
          stopWatcher = Init(targetFolders, ignoreFolders);
          reporter(heading, targets, report);
        }
        if (queue.length > 8) {
          step2 = "Initialize";
          queue.length = 0;
        } else if (queue.length) {
          const event = pull();
          if (!event) {
            break;
          }
          const pathFromWork = `${event.folder}/${event.filePath}`;
          if (event.folder === PATH.folder.scaffold.path) {
            if (event.action === "add" || event.action === "change") {
              switch (pathFromWork) {
                case PATH.json.configure.path:
                  stopWatcher();
                  stopWatcher = null;
                  step2 = "VerifyConfigs";
                  break;
                case PATH.css.atrules.path:
                case PATH.css.constants.path:
                case PATH.css.elements.path:
                case PATH.css.extends.path:
                  await SaveRootCss();
                  step2 = "GenerateFinals";
                  break;
                case PATH.json.hashrule.path:
                  step2 = "ReadHashrule";
                  break;
                default:
                  if (pathFromWork.startsWith(PATH.folder.libraries.path) && event.extension === "css") {
                    STATIC.Libraries_Saved[pathFromWork] = event.fileContent;
                  } else if (pathFromWork.startsWith(PATH.folder.artifacts.path) && [ROOT.extension, "css", "md"].includes(event.extension)) {
                    STATIC.Artifacts_Saved[pathFromWork] = event.fileContent;
                  }
                  step2 = "ProcessXtylesFolder";
              }
            } else {
              step2 = "VerifySetupStruct";
            }
          } else if (event.action === "add" || event.action === "change" || event.action === "unlink") {
            SaveToTarget(event.action, event.folder, event.filePath, event.fileContent, event.extension);
            step2 = "GenerateFinals";
          } else {
            step2 = "VerifyConfigs";
          }
          heading = `[${event.timeStamp}] | ${event.filePath} | [${event.action}]`;
          reportNext = true;
        }
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    }
  } while (STATIC.WATCH);
  if (stopWatcher) {
    stopWatcher();
    stopWatcher = null;
  } else {
    main_default2.POST(report);
  }
}
async function commander({
  command,
  argument,
  rootPath: rootPath2,
  workPath: workPath2,
  projectName: projectName2,
  projectVersion: projectVersion2,
  rootPackageEssential: originPackageEssential
}) {
  STATIC.Command = command;
  STATIC.Argument = argument;
  STATIC.DEBUG = command === "debug";
  STATIC.WATCH = (command === "debug" || command === "preview") && argument === "watch";
  STATIC.ProjectName = main_default.string.normalize(projectName2);
  STATIC.ProjectVersion = projectVersion2;
  SetENV(rootPath2, workPath2, originPackageEssential);
  main_default2.init(!STATIC.WATCH);
  const APP_VERSION = `${ROOT.name} @ ${ROOT.version}`;
  switch (STATIC.Command) {
    case "init": {
      const title = main_default2.PLAY.Title(`${APP_VERSION} : Initialize`, 500);
      await FetchDocs();
      await title;
      const setupInit = await VerifySetupStruct();
      if (!setupInit.started) {
        main_default2.POST(await Initialize());
      } else if (setupInit.proceed) {
        main_default2.POST((await VerifyConfigs(true)).report);
      } else {
        main_default2.POST(setupInit.report);
      }
      break;
    }
    case "debug": {
      await execute(`${APP_VERSION} : Debug ${STATIC.WATCH ? "Watch" : "Build"}`);
      break;
    }
    case "preview": {
      await execute(`${APP_VERSION} : Preview ${STATIC.WATCH ? "Watch" : "Build"}`);
      break;
    }
    case "publish": {
      await execute(`${APP_VERSION} : Publishing for Production`);
      break;
    }
    case "install": {
      main_default2.init(false);
      main_default2.POST(main_default2.tag.H3("Installing Artifacts", main_default2.preset.primary, main_default2.style.AS_Bold));
      const verifyStructResult = await VerifySetupStruct();
      if (!verifyStructResult.proceed) {
        main_default2.POST(verifyStructResult.report);
        break;
      }
      const verifyConfigsResult = await VerifyConfigs(true);
      if (!verifyConfigsResult.status) {
        main_default2.POST(verifyConfigsResult.report);
        break;
      }
      const fetched = await artifact_default.FETCH();
      main_default2.POST(fetched.message);
      if (fetched.status) {
        await fileman_default.write.bulk(fetched.outs);
        main_default2.POST(main_default2.tag.H4("Artifacts Updated", main_default2.preset.success, main_default2.style.AS_Bold));
      } else {
        main_default2.POST(main_default2.tag.H4("Artifacts not updated due to pending errors", main_default2.preset.failed, main_default2.style.AS_Bold));
      }
      break;
    }
    default: {
      await FetchDocs();
      main_default2.POST(
        main_default2.MAKE(
          main_default2.tag.H1(APP_VERSION),
          [
            SYNC.MARKDOWN.alerts.content,
            ListRecord("Available Commands", ROOT.commands),
            ListRecord("Agreements", Object.fromEntries(Object.values(SYNC.AGREEMENT).map((i) => [i.title, i.path]))),
            ListRecord("References", Object.fromEntries(Object.values(SYNC.MARKDOWN).map((i) => [i.title, i.path]))),
            main_default2.tag.H4("For more information visit : " + ROOT.url.Site, main_default2.preset.tertiary)
          ]
        )
      );
    }
  }
}
var commander_default = commander;

// ts/main.ts
var fallback_project_name = "-";
var fallback_project_version = "0.0.0";
var ExposedCommands = Object.keys(ROOT.commands);
var cmd = ExposedCommands.includes(process.argv[2]) ? process.argv[2] : "";
var arg = ExposedCommands.includes(process.argv[2]) ? process.argv[3] : "";
var workPath = ".";
var rootPath = fileman_default.path.fromOrigin(".");
var projectPackagePath = "package.json";
var originPackagePath = fileman_default.path.fromOrigin("package.json");
var [
  originPackageJson,
  projectPackageJson
] = await Promise.all([
  await fileman_default.read.json(originPackagePath),
  await fileman_default.read.json(projectPackagePath)
]);
if (!originPackageJson.status || typeof originPackageJson !== "object") {
  console.error("Bad root package.json file.");
  process.exit(1);
}
var projectName = typeof projectPackageJson.data.name === "string" ? projectPackageJson.data.name : fallback_project_name;
var projectVersion = typeof projectPackageJson.data.version === "string" ? projectPackageJson.data.version : fallback_project_version;
var rootPackageEssential = {
  bin: typeof originPackageJson.data.bin === "object" ? Object.keys(originPackageJson.data.bin)[0] : "",
  name: typeof originPackageJson.data.name === "string" ? originPackageJson.data.name : ROOT.name,
  version: typeof originPackageJson.data.version === "string" ? originPackageJson.data.version : ROOT.version
};
if (projectPackageJson.status && typeof projectPackageJson.data.scripts === "object" && ExposedCommands.includes(cmd)) {
  let addedCommands = 0;
  const scripts = projectPackageJson.data.scripts;
  for (const cmd2 in ROOT.scripts) {
    if (!scripts[cmd2]) {
      addedCommands++;
      scripts[`${ROOT.name}:${cmd2}`] = `${rootPackageEssential.bin} ${ROOT.scripts[cmd2]}`;
    }
  }
  if (addedCommands) {
    fileman_default.write.json(projectPackagePath, projectPackageJson.data);
  }
}
await commander_default({
  command: cmd,
  argument: arg,
  rootPath,
  workPath,
  projectName,
  projectVersion,
  rootPackageEssential
});
