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
import { joinGuild, leaveGuild, loadState } from "./state";

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

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once(Events.ClientReady, async (client) => {
    console.log("Client connected. [", client.user.tag, "]");
    console.log("Begin loading commands...");
    const cmds = await commands();
    console.log("Commands loaded.");
    console.log("Loading state...");
    await loadState();
    console.log("Done.");
    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        const command = cmds.get(interaction.commandName);
        if (command == undefined) {
            console.error(`Undefined command ${interaction.commandName}.`);
            return;
        }
        try {
            await command.execute(interaction);
        } catch (e) {
            console.error(e);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: "There was an error executing this command.",
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    content: "There was an error executing this command.",
                    ephemeral: true,
                });
            }
        }
    });
});

client.on(Events.GuildCreate, async (guild) => {
    console.log(`Joined guild: ${guild.name}`);
    await joinGuild(guild.id);
});

client.on(Events.GuildDelete, async (guild) => {
    console.log(`Left guild: ${guild.name}`);
    await leaveGuild(guild.id);
});

client.login(BOT_TOKEN);
