import type { ICommandDef } from "../../commands";
import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import { get_cooldown, set_cooldown, get_lastCall, set_lastCall } from "../../state";

export default {
    data: new SlashCommandBuilder()
    .setName("cooldown")
    .setDescription("Change the cooldown for the dad jokes.")
    .addIntegerOption(opt => opt.setName("cooldown").setDescription("The new cooldown in milliseconds.").setRequired(true)),
    async execute(interaction: CommandInteraction) {
        const raw = interaction.options.get("cooldown", true).value;
        if (typeof(raw) != "number") return;
        await set_cooldown(raw);
        interaction.reply({ content: `Cooldown set to ${get_cooldown()} ms.`});
    }
} as ICommandDef