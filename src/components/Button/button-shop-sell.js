const { ButtonInteraction } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");

module.exports = new Component({
    customId: 'shop_sell',
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

        const options = Object.entries(player.inventory)
            .filter(([type, qty]) => qty > 0)
            .map(([type, qty]) => {
                const seed = client.gameManager.seeds[type];
                return {
                    label: `${seed.name} (${qty}) - ${seed.sellPrice}$ chacun`,
                    value: type,
                    description: `Vous avez: ${qty}`
                };
            });

        if (options.length === 0) {
            const reply = await interaction.reply({ content: '❌ Votre inventaire est vide.', fetchReply: true });
            setTimeout(() => reply.delete().catch(() => {}), 5000);
            return;
        }

        const embed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle('💵 Vendre des graines 💵')
            .setDescription('Sélectionnez une graine à vendre')
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
                            type: 3,
                            custom_id: 'select_sell_seed',
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