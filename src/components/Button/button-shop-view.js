const { ButtonInteraction } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const UIManager = require("../../game/UIManager");

module.exports = new Component({
    customId: 'shop_view',
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

        await UIManager.updateShopMessage(interaction, player, farm, client.gameManager.seeds);
    }
}).toJSON();
