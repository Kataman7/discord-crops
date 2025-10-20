const { StringSelectMenuInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");

module.exports = new Component({
    customId: 'select_buy_quantity',
    type: 'select',
    /**
     *
     * @param {DiscordBot} client
     * @param {StringSelectMenuInteraction} interaction
     */
    run: async (client, interaction) => {
        const [seedType, quantityStr] = interaction.values[0].split('_');
        const quantity = parseInt(quantityStr);
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const player = await client.gameManager.getPlayer(userId, guildId);
        const seed = client.gameManager.seeds[seedType];
        const totalCost = seed.buyPrice * quantity;

        if (player.money < totalCost) {
            const reply = await interaction.reply({ content: `❌ Vous n'avez pas assez d'argent ! (Il vous faut ${totalCost - player.money}$ de plus)`, fetchReply: true });
            setTimeout(() => reply.delete().catch(() => {}), 5000);
            return;
        }

        player.money -= totalCost;
        player.addToInventory(seedType, quantity);

        await client.gameManager.savePlayer(player);
        await client.gameManager.saveInventory(player);

        const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('🛒 Acheter des graines 🛒')
            .setDescription(`✅ ${quantity} ${seed.name}${quantity > 1 ? 's' : ''} achetée${quantity > 1 ? 's' : ''} avec succès !`)
            .addFields(
                { name: '💰 Votre argent', value: `${player.money}$`, inline: false },
                { name: '📦 Quantité en stock', value: `${player.inventory[seedType]}`, inline: false },
                { name: '💵 Coût total', value: `${totalCost}$`, inline: false }
            )
            .setFooter({ text: 'Continuez vos achats ou retournez au shop' })
            .setTimestamp();

        await interaction.update({
            embeds: [embed],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 4, // Danger
                            label: '← Retour au shop',
                            custom_id: 'shop_return'
                        }
                    ]
                }
            ]
        });
    }
}).toJSON();