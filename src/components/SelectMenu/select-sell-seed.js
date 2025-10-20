const { StringSelectMenuInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");

module.exports = new Component({
    customId: 'select_sell_seed',
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

        if (!player.hasInInventory(seedType, 1)) {
            const reply = await interaction.reply({ content: '❌ Vous n\'avez pas cette graine.', fetchReply: true });
            setTimeout(() => reply.delete().catch(() => {}), 5000);
            return;
        }

        player.removeFromInventory(seedType, 1);
        player.money += seed.sellPrice;

        await client.gameManager.savePlayer(player);
        await client.gameManager.saveInventory(player);

        const embed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle('💵 Vendre des graines 💵')
            .setDescription(`✅ ${seed.name} vendue avec succès !`)
            .addFields(
                { name: '💰 Votre argent', value: `${player.money}$`, inline: false },
                { name: '💸 Montant reçu', value: `${seed.sellPrice}$`, inline: false }
            )
            .setFooter({ text: 'Continuez vos ventes ou retournez au shop' })
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