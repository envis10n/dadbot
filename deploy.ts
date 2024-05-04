import {
    REST,
    Routes,
    Client,
    GatewayIntentBits,
    ApplicationCommand,
    Events,
    type Snowflake,
} from "discord.js";
import { commandList, commands, reloadCommands } from "./commands";
import { joinGuild, leaveGuild } from "./state";

const BOT_TOKEN: string | undefined = process.env["BOT_TOKEN"];
const BOT_ID: string | undefined = process.env["BOT_ID"];

if (BOT_TOKEN == undefined) {
    console.error("MISSING BOT_TOKEN ENV VARIABLE.");
    process.exit(1);
}

if (BOT_ID == undefined) {
    console.error("MISSING BOT CLIENT ID ENV VARIABLE.");
    process.exit(1);
}

console.log("Deploying slash commands...");

const cmdlist = await commandList();
const rest = new REST().setToken(BOT_TOKEN);
await rest.put(Routes.applicationCommands(BOT_ID), {
    body: cmdlist,
});

console.log("Deployed.");
