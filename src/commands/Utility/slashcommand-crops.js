const { ChatInputCommandInteraction } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const UIManager = require("../../game/UIManager");

module.exports = new ApplicationCommand({
    command: {
        name: 'crops',
        description: 'Affiche votre ferme et permet de planter ou récolter.',
    },
    options: {},
    /**
     * 
     * @param {DiscordBot} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const player = await client.gameManager.getPlayer(userId, guildId);
        const farm = await client.gameManager.getFarm(userId, guildId, player.farmSize);
        
        if (farm && typeof farm.updateStates === 'function') {
            farm.updateStates(client.gameManager.seeds);
        }

        const ui = await UIManager.generateFarmUI(player, farm, client.gameManager.seeds);

        await interaction.reply(ui);
    }
}).toJSON();