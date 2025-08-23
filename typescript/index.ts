#!/usr/bin/env node

import fileman from "./fileman.js";
import commander from "./command.js";
import { T_PackageEssential } from "./types.js";
import { ORIGIN } from "./Data/cache.js";

const fallback_project_name = "-";
const fallback_project_version = "0.0.0";
const fallback_origin_name = "xcss";
const fallback_origin_version = "0.0.0";
const fallback_origin_website = ORIGIN.URL.Site;



async function main() {
    const command = ORIGIN.exposedCommands.includes(process.argv[2]) ? process.argv[2] : "";
    const argument = ORIGIN.exposedCommands.includes(process.argv[3]) ? process.argv[2] : "";

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

    const originPackageEssential: T_PackageEssential = {
        name: typeof originPackageJson.data.name === "string" ? originPackageJson.data.name : fallback_origin_name,
        version: typeof originPackageJson.data.version === "string" ? originPackageJson.data.version : fallback_origin_version,
        website: typeof originPackageJson.data.homepage === "string" ? originPackageJson.data.homepage : fallback_origin_website,
        bins: Object.keys(originPackageJson.data.bin ?? {}),
        scripts: typeof originPackageJson.data.scripts === "object"
            ? Object.entries(originPackageJson.data.scripts as Record<string, unknown>).reduce((A, [K, V]) => {
                if (typeof V === "string") { A[K] = V; }
                return A;
            }, {} as Record<string, string>) : {},
    };

    if (projectPackageJson.status
        && (typeof projectPackageJson.data.scripts === "object")
        && (ORIGIN.exposedCommands as string[]).includes(command)
    ) {
        let addedCommands = 0;
        const scripts = projectPackageJson.data.scripts as Record<string, string>;
        for (const cmd of ORIGIN.exposedCommands) {
            if (originPackageEssential.scripts[cmd] && !scripts[cmd]) {
                addedCommands++;
                scripts[`${originPackageEssential.bins[0]}:${cmd}`] = originPackageEssential.scripts[cmd];
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
        command,
        argument,
        rootPath,
        workPath,
        projectName,
        projectVersion,
        originPackageEssential,
    });
}

main();