import { SlashCommandBuilder, CommandInteraction, Collection, Client } from "discord.js";
import * as fs from "fs/promises";
import * as path from "path";

export interface ICommandDef {
    data: SlashCommandBuilder;
    execute(interaction: CommandInteraction): Promise<void>;
}

let didLoad = false;
export const _COMMANDS: Collection<string, ICommandDef> = new Collection();

export async function reloadCommands(): Promise<Collection<string, ICommandDef>> {
    didLoad = false;
    return await commands();
}

export async function commands(): Promise<Collection<string, ICommandDef>> {
    if (didLoad) return _COMMANDS;
    didLoad = true;
    // Load commands
    const folderPath = path.join(__dirname, "commands");
    const commandPaths = (await fs.readdir(path.join("commands"), { recursive: true })).filter((f) => f.endsWith(".ts")).map((f) => path.join(folderPath, f));
    for (const commandPath of commandPaths) {
        console.log(`Found command at ${commandPath}...`);
        const command: ICommandDef = (await import(commandPath)).default;
        if ('data' in command && 'execute' in command) {
            _COMMANDS.set(command.data.name, command);
            console.log(`${commandPath} loaded.`);
        } else {
            console.log(`[WARNING] The command at ${commandPath} is missing a required "data" or "execute" property.`);
        }
    }
    return _COMMANDS;
}