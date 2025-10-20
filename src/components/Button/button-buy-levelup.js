const { ButtonInteraction } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const UIManager = require("../../game/UIManager");

module.exports = new Component({
    customId: 'shop_levelup',
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
        const cost = (player.level + 1) * 250; // 500 pour level 1->2, 750 pour 2->3, etc.

        if (player.money < cost) {
            const reply = await interaction.reply({ content: `❌ Vous n'avez pas assez d'argent ! Il vous faut ${cost - player.money}$ de plus.\nCoût de montée de niveau: ${cost}$`, fetchReply: true });
            setTimeout(() => reply.delete().catch(() => {}), 5000);
            return;
        }

        player.money -= cost;
        player.levelUp();

        // Reset ferme à la nouvelle montée de niveau
        const newFarm = new (require('../../game/Farm'))(userId, guildId, player.farmSize);
        await client.gameManager.savePlayer(player);
        await client.gameManager.saveFarm(newFarm);

        await UIManager.updateShopMessage(interaction, player, newFarm, client.gameManager.seeds, `✅ Vous êtes passé au niveau ${player.level} ! Votre ferme a été réinitialisée.`);
    }
}).toJSON();