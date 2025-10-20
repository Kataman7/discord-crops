const { ButtonInteraction } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const UIManager = require("../../game/UIManager");

module.exports = new Component({
    customId: 'harvest',
    type: 'button',
    /**
     * 
     * @param {DiscordBot} client 
     * @param {ButtonInteraction} interaction 
     */
    run: async (client, interaction) => {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const player = await client.gameManager.getPlayer(userId, guildId);
        const farm = await client.gameManager.getFarm(userId, guildId, player.farmSize);
        farm.updateStates(client.gameManager.seeds);

        const moneyEarned = farm.harvestAll(client.gameManager.seeds);
        player.earn(moneyEarned);

        await client.gameManager.savePlayer(player);
        await client.gameManager.saveFarm(farm);

        await UIManager.updateFarmMessage(interaction, player, farm, client.gameManager.seeds, `✅ Récolte terminée ! Vous avez gagné ${moneyEarned}$ !`);
    }
}).toJSON();