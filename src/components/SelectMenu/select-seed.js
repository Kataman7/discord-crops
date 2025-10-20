const { StringSelectMenuInteraction } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const UIManager = require("../../game/UIManager");

module.exports = new Component({
    customId: 'select_seed',
    type: 'select',
    /**
     * 
     * @param {DiscordBot} client 
     * @param {StringSelectMenuInteraction} interaction 
     */
    run: async (client, interaction) => {
        const seedType = interaction.values[0];
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const player = await client.gameManager.getPlayer(userId, guildId);
        const farm = await client.gameManager.getFarm(userId, guildId, player.farmSize);
        
        if (farm && typeof farm.updateStates === 'function') {
            farm.updateStates(client.gameManager.seeds);
        }

        if (!player.hasInInventory(seedType, 1)) {
            const reply = await interaction.reply({ content: '❌ Vous n\'avez pas cette graine en stock.', fetchReply: true });
            setTimeout(() => reply.delete().catch(() => {}), 5000);
            return;
        }

        if (!farm.plant(seedType, client.gameManager.seeds)) {
            const reply = await interaction.reply({ content: '❌ Aucune tile vide disponible.', fetchReply: true });
            setTimeout(() => reply.delete().catch(() => {}), 5000);
            return;
        }

        player.removeFromInventory(seedType, 1);
        await client.gameManager.savePlayer(player);
        await client.gameManager.saveInventory(player);
        await client.gameManager.saveFarm(farm);

        const seedName = client.gameManager.seeds[seedType].name;
        await UIManager.updateFarmMessage(interaction, player, farm, client.gameManager.seeds, `🌱 ${seedName} plantée avec succès !`);
    }
}).toJSON();