const { ButtonInteraction } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");

module.exports = new Component({
    customId: 'shop_buy',
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
        const availableSeeds = player.getAvailableSeeds(client.gameManager.seeds);

        if (availableSeeds.length === 0) {
            const reply = await interaction.reply({ content: '❌ Aucune graine disponible pour votre niveau.', fetchReply: true });
            setTimeout(() => reply.delete().catch(() => {}), 5000);
            return;
        }

        const options = availableSeeds.map(type => {
            const seed = client.gameManager.seeds[type];
            return {
                label: `${seed.name} - ${seed.buyPrice}$`,
                value: type,
                description: `Temps de croissance: ${seed.growthTime / 3600000}h`
            };
        });

        const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('🛒 Acheter des graines 🛒')
            .setDescription('Sélectionnez une graine à acheter')
            .addFields(
                { name: '💰 Votre argent', value: `${player.money}$`, inline: false }
            )
            .setFooter({ text: 'Faites votre sélection ou retournez au shop' })
            .setTimestamp();

        await interaction.update({
            embeds: [embed],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 3, // StringSelect
                            custom_id: 'select_buy_seed',
                            options: options,
                            placeholder: 'Choisissez une graine...'
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