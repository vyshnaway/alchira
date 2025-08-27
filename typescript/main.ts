#!/usr/bin/env node

import fileman from "./fileman.js";
import commander from "./command.js";

import * as CACHE from "./data/cache.js";
import * as TYPE from "./types.js";

const fallback_project_name = "-";
const fallback_project_version = "0.0.0";
const fallback_root_name = CACHE._ROOT.name;
const fallback_root_version = CACHE._ROOT.version;
const fallback_root_website = CACHE._ROOT.URL.Site;

const user_scripts = {
    "debug": "xcss debug watch",
    "install": "xcss install",
    "preview": "xcss preview",
    "publish": "xcss publish",
    "archive": "xcss archive",
};

const bin = process.argv[1];
const cmd = CACHE._ROOT.exposedCommands.includes(process.argv[2]) ? process.argv[2] : "";
const arg = CACHE._ROOT.exposedCommands.includes(process.argv[2]) ? process.argv[3] : "";

const workPath = fileman.path.resolves(".");
const rootPath = fileman.path.fromOrigin(".");
const originPackagePath = fileman.path.fromOrigin("package.json");
const projectPackagePath = "package.json";

const [
    originPackageJson,
    projectPackageJson,
] = await Promise.all([
    await fileman.read.json<Record<string, unknown>>(originPackagePath),
    await fileman.read.json<Record<string, unknown>>(projectPackagePath),
]);

if (!originPackageJson.status && typeof originPackageJson === "object") {
    console.error("Bad Origin package.json file.");
    process.exit(1);
}

const rootPackageEssential: TYPE.PackageEssential = {
    bin,
    name: typeof originPackageJson.data.name === "string" ? originPackageJson.data.name : fallback_root_name,
    version: typeof originPackageJson.data.version === "string" ? originPackageJson.data.version : fallback_root_version,
    website: typeof originPackageJson.data.homepage === "string" ? originPackageJson.data.homepage : fallback_root_website,
};


const rootScripts = user_scripts as Record<string, string>;

if (projectPackageJson.status
    && (typeof projectPackageJson.data.scripts === "object")
    && (CACHE._ROOT.exposedCommands as string[]).includes(cmd)
) {
    let addedCommands = 0;
    const scripts = projectPackageJson.data.scripts as Record<string, string>;
    for (const cmd of CACHE._ROOT.exposedCommands) {
        if (rootScripts[cmd] && !scripts[cmd]) {
            addedCommands++;
            scripts[`${bin}:${cmd}`] = rootScripts[cmd];
        }

    }

    if (addedCommands) {
        fileman.write.json(projectPackagePath, projectPackageJson.data);
    }
}

const projectName = typeof projectPackageJson.data.name === "string"
    ? projectPackageJson.data.name
    : fallback_project_name;
const projectVersion = typeof projectPackageJson.data.version === "string"
    ? projectPackageJson.data.version
    : fallback_project_version;

await commander({
    command: cmd,
    argument: arg,
    rootPath,
    workPath,
    projectName,
    projectVersion,
    rootPackageEssential,
});