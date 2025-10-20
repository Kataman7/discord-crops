const { ButtonInteraction } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const UIManager = require("../../game/UIManager");

module.exports = new Component({
    customId: 'shop_expand',
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
        const cost = (player.farmSize + 1) * 100; // 300 pour passer de 2 à 3, 400 pour 3 à 4, etc.

        if (player.money < cost) {
            const reply = await interaction.reply({ content: `❌ Vous n'avez pas assez d'argent ! Il vous faut ${cost - player.money}$ de plus.\nCoût d'agrandissement: ${cost}$`, fetchReply: true });
            setTimeout(() => reply.delete().catch(() => {}), 5000);
            return;
        }

        player.money -= cost;
        player.farmSize++;

        // Charger la ferme existante et l'agrandir
        const existingFarm = await client.gameManager.getFarm(userId, guildId, player.farmSize - 1);
        
        // Créer une nouvelle ferme avec la nouvelle taille
        const newFarm = new (require('../../game/Farm'))(userId, guildId, player.farmSize);
        
        // Copier les tiles existantes vers la nouvelle ferme (pas les nouvelles tiles)
        const oldSize = player.farmSize - 1;
        for (let y = 0; y < oldSize; y++) {
            for (let x = 0; x < oldSize; x++) {
                const oldTile = existingFarm.getTile(x, y);
                const newTile = newFarm.getTile(x, y);
                if (oldTile && newTile) {
                    newTile.state = oldTile.state;
                    newTile.seedType = oldTile.seedType;
                    newTile.plantedAt = oldTile.plantedAt;
                }
            }
        }
        
        await client.gameManager.savePlayer(player);
        await client.gameManager.saveFarm(newFarm);

        await UIManager.updateShopMessage(interaction, player, newFarm, client.gameManager.seeds, `✅ Ferme agrandie à ${player.farmSize}x${player.farmSize} !`);
    }
}).toJSON();