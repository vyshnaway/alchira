#!/usr/bin/env node
/* eslint-disable @typescript-eslint/naming-convention */

import fileman from "./fileman.js";
import commander from "./execute.js";

import * as CACHE from "./data/cache.js";
import * as _support from "./type/support.js";

const fallback_project_name = "-";
const fallback_project_version = "0.0.0";
const ExposedCommands = Object.keys(CACHE.ROOT.Commands);


// --- Initialize ---
const bin = process.argv[1];
const cmd = ExposedCommands.includes(process.argv[2]) ? process.argv[2] : "";
const arg = ExposedCommands.includes(process.argv[2]) ? process.argv[3] : "";

const workPath = ".";
// const workPath = fileman.path.resolves(".");
const rootPath = fileman.path.fromOrigin(".");
const projectPackagePath = "package.json";
const originPackagePath = fileman.path.fromOrigin("package.json");

const [
    originPackageJson,
    projectPackageJson,
] = await Promise.all([
    await fileman.read.json<Record<string, unknown>>(originPackagePath),
    await fileman.read.json<Record<string, unknown>>(projectPackagePath),
]);

if (!originPackageJson.status || typeof originPackageJson !== "object") {
    console.error("Bad root package.json file.");
    process.exit(1);
}

const projectName = typeof projectPackageJson.data.name === "string"
    ? projectPackageJson.data.name
    : fallback_project_name;
const projectVersion = typeof projectPackageJson.data.version === "string"
    ? projectPackageJson.data.version
    : fallback_project_version;

const rootPackageEssential: _support.PackageEssential = {
    bin,
    name: typeof originPackageJson.data.name === "string" ?
        originPackageJson.data.name : CACHE.ROOT.name,
    version: typeof originPackageJson.data.version === "string" ?
        originPackageJson.data.version : CACHE.ROOT.version,
    website: typeof originPackageJson.data.homepage === "string" ?
        originPackageJson.data.homepage : CACHE.ROOT.URL.Site,
};


// --- Script sync with Project ---

const syncscripts: Record<string, string> = {
    "init": "xcss init",
    // "debug": "xcss debug watch",
    "watch": "xcss preview watch",
    "preview": "xcss preview",
    "publish": "xcss publish",
    "artifact": "xcss artifact",
    "install": "xcss install",
};

if (
    projectPackageJson.status
    && (typeof projectPackageJson.data.scripts === "object")
    && (ExposedCommands as string[]).includes(cmd)
) {
    let addedCommands = 0;
    const scripts = projectPackageJson.data.scripts as Record<string, string>;
    for (const cmd in syncscripts) {
        if (!scripts[cmd]) {
            addedCommands++;
            scripts[`${bin}:${cmd}`] = syncscripts[cmd];
        }
    }

    if (addedCommands) {
        fileman.write.json(projectPackagePath, projectPackageJson.data);
    }
}


await commander({
    command: cmd,
    argument: arg,
    rootPath,
    workPath,
    projectName,
    projectVersion,
    rootPackageEssential,
});