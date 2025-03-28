import { runCommand } from "../src.as";

console.log(runCommand("start", null));
console.log(runCommand("dev", null));
console.log(runCommand("build", "my-token"));
console.log(runCommand("help", null));
