const { ButtonInteraction } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");

module.exports = new Component({
    customId: 'plant',
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
                label: `${seed.name} (${player.inventory[type] || 0} en stock)`,
                value: type,
                description: `Prix: ${seed.buyPrice}$, Temps: ${seed.growthTime / 3600000}h`
            };
        });

        await interaction.update({
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 3, // StringSelect
                            custom_id: 'select_seed',
                            placeholder: 'Choisissez une graine à planter...',
                            options: options
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 4, // Danger
                            label: '← Retour à la ferme',
                            custom_id: 'back_to_farm'
                        }
                    ]
                }
            ]
        });
    }
}).toJSON();