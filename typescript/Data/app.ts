const data = (packageJson) => {
    return {
        name: packageJson.name,
        version: packageJson.version,
        website: packageJson.homepage,
        command: Object.keys(packageJson.bin),
        console: "https://console.xpktr.com/",
        content: "https://xcdn.xpktr.com/xcss/version/" + packageJson.version.split(".")[0],
        commandList: {
            init: 'Initiate or Update & Verify setup.',
            dev: 'Live build for dev environment',
            preview: 'Fast build, preserves class names.',
            build: 'Build minified.'
        },
    };
};

export default data;

// Import the necessary AssemblyScript types.  Since AssemblyScript
// has static typing, we need to define the structure of our data.
export class PackageJson {  // It's good practice to use 'export' for reusable types.
    name: string;
    version: string;
    homepage: string;
    bin: Map<string, string>; //  AssemblyScript doesn't have Object.keys directly,
    //  and the closest equivalent for arbitrary keys is Map.
    // In a real package.json 'bin' is often an object like { cmdName: "path/to/script" },
    // so a Map<string, string> is more accurate than string[].  If you know
    // it will *always* be a simple array of strings, you *could* use string[],
    // but a Map is safer and more general.
}

export class OutputData {
    name: string;
    version: string;
    website: string;
    command: string[];
    console: string;
    content: string;
    commandList: Map<string, string>;
}

// Function to process the package.json data.
export function processPackageJson(packageJson: PackageJson): OutputData {
    // AssemblyScript doesn't allow arbitrary property access like
    // JavaScript (e.g., packageJson.name).  We define a class
    // (PackageJson) and access properties directly.

    // Handle the 'bin' property.  In AS, we need to convert the Map
    // keys to an array of strings.
    let commandKeys: string[] = [];
    if (packageJson.bin) { // Check if packageJson.bin exists
        const keys = packageJson.bin.keys();
        for (let i = 0; i < packageJson.bin.size; i++) {
            commandKeys.push(keys.next());
        }
    }

    // Handle the version string split.  AssemblyScript's string.split
    // returns an array.  We access the first element (if it exists)
    // and convert it to a string.  Added a null check.
    let versionParts = packageJson.version.split(".");
    let firstVersionPart: string = versionParts.length > 0 ? versionParts[0] : "";
    // Create the output object.
    const result = new OutputData();
    result.name = packageJson.name;
    result.version = packageJson.version;
    result.website = packageJson.homepage;
    result.command = commandKeys;
    result.console = "https://console.xpktr.com/";
    result.content = "https://xcdn.xpktr.com/xcss/version/" + firstVersionPart;

    // Create the commandList Map.  AssemblyScript uses Map for key-value pairs.
    const commandList = new Map<string, string>();
    commandList.set("init", "Initiate or Update & Verify setup.");
    commandList.set("dev", "Live build for dev environment");
    commandList.set("preview", "Fast build, preserves class names.");
    commandList.set("build", "Build minified.");
    result.commandList = commandList;

    return result;
}
