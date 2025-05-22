#!/usr/bin/env node

import fs from 'fs';
import fileman from '../interface/fileman.js';
import commander from "../javascript/package.js"

const rootPath = fileman.path.fromRoot(".");
const packagePath = 'package.json';
const rootPackagePath = fileman.path.fromRoot(packagePath);

const command = process.argv[2];
const argument = process.argv[3];
const consoleWidth = process.stdout.columns;
const packageEssential = {};

const commandList = ["init", "watch", "preview", "build"];

const rootPackageJson = await fileman.read.json(rootPackagePath);
if (!rootPackageJson.status) throw new Error("Bad root json file.")

packageEssential.name = rootPackageJson.data.name;
packageEssential.version = rootPackageJson.data.version;
packageEssential.scripts = rootPackageJson.data.scripts;
packageEssential.website = rootPackageJson.data.homepage;
packageEssential.command = Object.keys(rootPackageJson.data.bin);

const projectPackageJson = await fileman.read.json("./package.json");

if (projectPackageJson.status && commandList.includes(command)) {
    let addedCommands = 0;
    for (const cmd of commandList) {
        if (rootPackageJson.data.scripts[cmd] && !projectPackageJson.data.scripts[cmd]) {
            addedCommands++;
            projectPackageJson.data.scripts[`${rootPackageJson.data.name}:${cmd}`] = rootPackageJson.data.scripts[cmd];
        };
    }
    if (addedCommands) {
        fs.writeFileSync(packagePath, JSON.stringify(projectPackageJson.data, null, 2), 'utf8')
    }
}

await commander(command, argument, rootPath, consoleWidth, packageEssential);
