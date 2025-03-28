// AssemblyScript version

const helpstring = `
Usage: my-cli <command> [options]

Commands:
    start           Start the application
    dev             Run the application in development mode
    preview         Preview the application
    build <token>   Build the application with a token parameter
    help  
`

export function runCommand(command: string, param: string | null): string {
    const commands: Map<string, (param: string | null) => string> = new Map();

    commands.set("start", () => "Starting the application...");
    commands.set("dev", () => "Running in development mode...");
    commands.set("preview", () => "Previewing the application...");
    commands.set("build", (token: string | null) =>
        token ? `Building the application with token: ${token}` : "Error: Token is required for build."
    );
    commands.set("help", () => helpstring);

    if (commands.has(command)) {
        const fn = commands.get(command) as (param: string | null) => string;
        return fn(param);
    } else {
        return 'Unknown command. Use "help" to see the list of available commands.';
    }
}
