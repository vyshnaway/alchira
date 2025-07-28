#!/usr/bin/env node

import fs from "fs";
import fileman from "./fileman.js";
import commander from "./command.js";

const rootPath = fileman.path.fromRoot(".");
const workPath = fileman.path.resolves(".");
const packagePath = "package.json";
const rootPackagePath = fileman.path.fromRoot(packagePath);

const command = process.argv[2];
const argument = process.argv[3];
const consoleWidth = process.stdout.columns;
const rootPackageEssential = {};

const commandList = ["init", "watch", "preview", "publish", "split", "install"];

const rootPackageJson = await fileman.read.json(rootPackagePath);
if (!rootPackageJson.status) throw new Error("Bad root json file.");

rootPackageEssential.name = rootPackageJson.data.name;
rootPackageEssential.version = rootPackageJson.data.version;
rootPackageEssential.scripts = rootPackageJson.data.scripts;
rootPackageEssential.website = rootPackageJson.data.homepage;
rootPackageEssential.command = Object.keys(rootPackageJson.data.bin);

const projectPackageJson = await fileman.read.json("./package.json");

if (projectPackageJson.status && commandList.includes(command)) {
    let addedCommands = 0;
    for (const cmd of commandList) {
        if (
            rootPackageJson.data.scripts[cmd] &&
            !projectPackageJson.data.scripts[cmd]
        ) {
            addedCommands++;
            projectPackageJson.data.scripts[`${"xcss" || rootPackageJson.data.name}:${cmd}`] =
                rootPackageJson.data.scripts[cmd];
        }
    }
    if (addedCommands) {
        fs.writeFileSync(
            packagePath,
            JSON.stringify(projectPackageJson.data, null, 2),
            "utf8",
        );
    }
}

await commander(
    command,
    argument,
    rootPath,
    workPath,
    consoleWidth,
    rootPackageEssential,
    projectPackageJson.status ? projectPackageJson.data.name : "xtylesheet",
    projectPackageJson.status ? projectPackageJson.data.version : "0.0.0",
);