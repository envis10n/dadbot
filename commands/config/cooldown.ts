import type { ICommandDef } from "../../commands";
import { CommandInteraction, PermissionFlagsBits } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import { getState, saveState } from "../../state";

export default {
    data: new SlashCommandBuilder()
        .setName("cooldown")
        .setDescription("Change the cooldown for the dad jokes.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption((opt) =>
            opt
                .setName("cooldown")
                .setDescription("The new cooldown in milliseconds.")
                .setRequired(true)
        ),
    async execute(interaction: CommandInteraction) {
        const guild = interaction.guildId;
        if (guild == null) {
            interaction.reply({
                content: "Sorry, I can only set cooldowns in a guild.",
            });
            return;
        }
        const raw = interaction.options.get("cooldown", true).value;
        if (typeof raw != "number") return;
        const state = getState(guild);
        state.cooldown = raw;
        await saveState();
        interaction.reply({
            content: `Cooldown set to ${raw} ms.`,
            ephemeral: true,
        });
    },
} as ICommandDef;
