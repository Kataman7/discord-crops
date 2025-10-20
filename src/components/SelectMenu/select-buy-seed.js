const { StringSelectMenuInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");

module.exports = new Component({
    customId: 'select_buy_seed',
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
        const seed = client.gameManager.seeds[seedType];

        const quantities = [1, 4, 8, 16];
        const quantityOptions = quantities.map(qty => {
            const totalCost = seed.buyPrice * qty;
            const canAfford = player.money >= totalCost;
            return {
                label: `${qty} graine${qty > 1 ? 's' : ''} - ${totalCost}$`,
                value: `${seedType}_${qty}`,
                description: canAfford ? `Coût total: ${totalCost}$` : `❌ Pas assez d'argent (${totalCost - player.money}$ manquant)`,
                disabled: !canAfford
            };
        });

        const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle(`🛒 Acheter ${seed.name} 🛒`)
            .setDescription('Choisissez la quantité à acheter')
            .addFields(
                { name: '💰 Votre argent', value: `${player.money}$`, inline: false },
                { name: '💵 Prix unitaire', value: `${seed.buyPrice}$`, inline: false }
            )
            .setFooter({ text: 'Sélectionnez une quantité ou retournez au shop' })
            .setTimestamp();

        await interaction.update({
            embeds: [embed],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 3,
                            custom_id: 'select_buy_quantity',
                            options: quantityOptions,
                            placeholder: 'Choisissez la quantité...'
                        }
                    ]
                },
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