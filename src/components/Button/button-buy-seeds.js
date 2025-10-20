const { ButtonInteraction } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");

module.exports = new Component({
    customId: 'buy_seeds',
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

        const options = availableSeeds.map(type => {
            const seed = client.gameManager.seeds[type];
            return {
                label: `${seed.name} - ${seed.buyPrice} pièces`,
                value: type,
                description: `Niveau requis: ${seed.requiredLevel}`
            };
        });

        await interaction.reply({
            content: 'Choisissez une graine à acheter :',
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 3,
                            custom_id: 'select_buy_seed',
                            options: options
                        }
                    ]
                }
            ],
            ephemeral: true
        });
    }
}).toJSON();