import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import readline from "readline";

const cdn = "https://xcdn.xpktr.com/";
const packageFolder = ".xcss/";

fs.readdirSync(packageFolder).forEach((file) => {
  if (!file.startsWith(".git")) {
    const filePath = path.join(packageFolder, file);
    if (fs.lstatSync(filePath).isDirectory()) {
      fs.rmSync(filePath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(filePath);
    }
  }
});

const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
packageJson.devDependencies = undefined;
packageJson.bin["xcss-dev"] = undefined;
Object.keys(packageJson.scripts).forEach(
  (command) =>
    (packageJson.scripts[command] = [
      "start",
      "dev",
      "preview",
      "build",
      "help",
    ].includes(command)
      ? packageJson.scripts[command]
      : undefined),
);

const destinationPath = packageFolder + "package.json";
const destinationDir = path.dirname(destinationPath);

fs.mkdirSync(destinationDir, { recursive: true });
fs.writeFileSync(destinationPath, JSON.stringify(packageJson, null, 2));

fs.copyFileSync(".npmignore", path.join(packageFolder, ".npmignore"));

fs.mkdirSync(path.join(packageFolder, "bin"), { recursive: true });
fs.copyFileSync("bin/xcss.wasm", path.join(packageFolder, "bin/xcss.wasm"));

fs.mkdirSync(path.join(packageFolder, "template"), { recursive: true });

fs.readdirSync("template").forEach((file) => {
  const sourcePath = path.join("templates", file);
  const destinationPath = path.join(packageFolder, "templates", file);

  if (fs.lstatSync(sourcePath).isDirectory()) {
    fs.cpSync(sourcePath, destinationPath, { recursive: true });
  } else {
    fs.copyFileSync(sourcePath, destinationPath);
  }
});

async function publishDoc(fileName, source, folder = "") {
  const response = await fetch(source);
  const data = await response.text();
  const ext = path.extname(fileName);
  const name = path.basename(fileName, ext).toUpperCase();
  const folderPath = path.join(packageFolder, folder);

  // Ensure the folder exists
  fs.mkdirSync(folderPath, { recursive: true });

  fs.writeFileSync(path.join(folderPath, name + ext), data);
}

fetch(cdn + "xcss/agreements-txt/index.json")
  .then((response) => response.json())
  .then((data) => {
    data.files.forEach((file) =>
      publishDoc(file.name, cdn + file.path, "AGREEMENTS"),
    );
  });

publishDoc("readme.md", cdn + "xcss/readme.md");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter commit message: ", (commitMessage) => {
  if (commitMessage.trim()) {
    try {
      // Commit and push changes in the packageFolder (submodule)
      execSync(`cd ${packageFolder} && git init`, { stdio: "inherit" });
      execSync("git add .", { cwd: packageFolder, stdio: "inherit" });
      execSync(`git commit -m "${commitMessage}"`, {
        cwd: packageFolder,
        stdio: "inherit",
      });
      execSync("git push", { cwd: packageFolder, stdio: "inherit" });

      // Switch back to the working directory (main repo)
      process.chdir(path.resolve("."));

      // Commit and push changes in the working directory (main repo)
      execSync("git add .", { stdio: "inherit" });
      execSync(`git commit -m "${commitMessage}"`, { stdio: "inherit" });
      execSync("git push", { stdio: "inherit" });

      console.log("Changes have been published to GitHub.");
    } catch (error) {
      console.error("Failed to publish changes:", error.message);
    }
  } else {
    console.log("No commit message provided. Aborting publish.");
  }
  rl.close();
});
