import { Client, GatewayIntentBits, Events } from "discord.js";
import { commands } from "./commands";
import { DadState, joinGuild, leaveGuild } from "./state";

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
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once(Events.ClientReady, async (client) => {
    console.log("Client connected. [", client.user.tag, "]");
    console.log("Begin loading commands...");
    const cmds = await commands();
    console.log("Commands loaded.");
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

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || message.guildId == null) return; // Ignore bots and DMs.
    const msg = message.content.trim(); // Ignore mudae command lol
    if (msg.startsWith("$")) return;
    if (msg == "") return; // Ignore empty messages.
    const DAD_REG = /\b(?:i am|i'm|im|imma|ima)\b(?<reply>[^.]*)(?:[.?!]|\n)?/i;
    const res = DAD_REG.exec(msg);
    if (res == null || res.groups == undefined) return; // Ignore non-matching or malformed matches.
    const reply = res.groups["reply"].trim();
    if (reply.length > 25) return; // Ignore long joke replies.
    const state = await DadState.get(message.guildId);
    if (state == null) return;
    if (state.lastCall + state.cooldown >= Date.now()) return; // Cooldown not reached yet.
    if (Math.random() >= state.random) return; // Randomized chance for allowing the call.
    await message.reply(`Hi ${reply}, I'm dad.`);
    state.lastCall = Date.now();
    await state.update();
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
