#!/usr/bin/env node

import fs from "fs";
import fileman from "./fileman.js";
import commander from "./command.js";
import { T_PackageEssential, T_PackageJson } from "./types.js";

const commandList = [
    "init",
    "watch",
    "preview",
    "publish",
    "archive",
    "install"
];
const packagePath = "package.json";


async function main() {
    const command = process.argv[2];
    const argument = process.argv[3];
    if (!commandList.includes(command)) {
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }

    const workPath = fileman.path.resolves(".");
    const rootPath = fileman.path.fromOrigin(".");
    const originPackagePath = fileman.path.fromOrigin(packagePath);

    const [
        originPackageJson,
        projectPackageJson,
    ] = await Promise.all([
        await fileman.read.json<T_PackageJson>(originPackagePath),
        await fileman.read.json<T_PackageJson>("./package.json"),
    ]);

    if (!originPackageJson.status) {
        console.error("Bad root json file.");
        process.exit(1);
    }
    const originPackageEssential: T_PackageEssential = {
        bins: Object.keys(originPackageJson.data.bin ?? {}),
        name: originPackageJson.data.name ?? "xcss",
        version: originPackageJson.data.version ?? "0.0.0",
        website: originPackageJson.data.homepage ?? "xcss.io",
        scripts: originPackageJson.data.scripts ?? {},
    };

    if (projectPackageJson.status && commandList.includes(command)) {
        let addedCommands = 0;
        for (const cmd of commandList) {
            if (
                originPackageJson.data.scripts?.[cmd] &&
                projectPackageJson.data.scripts?.[cmd]
            ) {
                addedCommands++;
                projectPackageJson.data.scripts[`${originPackageEssential.name}:${cmd}`] =
                    originPackageJson.data.scripts[cmd];
            }

        }

        if (addedCommands) {
            fs.writeFileSync(
                packagePath,
                JSON.stringify(projectPackageJson.data, null, 2),
                "utf8"
            );
        }
    }

    await commander({
        command,
        argument,
        rootPath,
        workPath,
        originPackageEssential,
    });
}

main();