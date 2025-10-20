const { ChatInputCommandInteraction } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'shop',
        description: 'Accédez au magasin pour acheter ou vendre.',
    },
    options: {},
    /**
     * 
     * @param {DiscordBot} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        await interaction.reply({
            content: 'Bienvenue au magasin !',
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 1, // Primary
                            label: 'Acheter',
                            custom_id: 'shop_buy'
                        },
                        {
                            type: 2,
                            style: 2, // Secondary
                            label: 'Vendre',
                            custom_id: 'shop_sell'
                        }
                    ]
                }
            ],
            ephemeral: true
        });
    }
}).toJSON();