import type { ICommandDef } from "../../commands";
import { CommandInteraction, PermissionFlagsBits } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import { getState, saveState } from "../../state";

export default {
    data: new SlashCommandBuilder()
        .setName("random")
        .setDescription(
            "Change the random factor used to determine when to reply with dad jokes."
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addNumberOption((opt) =>
            opt
                .setName("factor")
                .setMinValue(0)
                .setMaxValue(1)
                .setDescription("The new random factor.")
                .setRequired(true)
        ),
    async execute(interaction: CommandInteraction) {
        const guild = interaction.guildId;
        if (guild == null) {
            interaction.reply({
                content: "Sorry, I can only set config values in a guild.",
            });
            return;
        }
        const raw = interaction.options.get("factor", true).value;
        if (typeof raw != "number") return;
        const state = getState(guild);
        state.random = raw;
        await saveState();
        interaction.reply({
            content: `Random factor set to ${raw}.`,
            ephemeral: true,
        });
    },
} as ICommandDef;
