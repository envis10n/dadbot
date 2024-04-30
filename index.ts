import { REST, Routes, Client, GatewayIntentBits, ApplicationCommand, Events } from "discord.js";
import { commands, reloadCommands } from "./commands";

const BOT_TOKEN: string | undefined = process.env["BOT_TOKEN"];

if (BOT_TOKEN == undefined) {
    console.error("MISSING BOT_TOKEN ENV VARIABLE.");
    process.exit(1);
}

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]});

client.once(Events.ClientReady, async client => {
    console.log("Client connected. [", client.user.tag, "]");
    console.log("Begin loading commands...");
    const cmds = await commands();
    
});

console.log("Starting command loading...");
