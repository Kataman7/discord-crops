const { Message } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const MessageCommand = require("../../structure/MessageCommand");
const config = require("../../config");

module.exports = new MessageCommand({
    command: {
        name: 'setprefix',
        description: 'Set prefix for this guild.',
        aliases: []
    },
    options: {
        cooldown: 5000
    },
    /**
     * 
     * @param {DiscordBot} client 
     * @param {Message} message 
     * @param {string[]} args
     */
    run: async (client, message, args) => {
        if (!args[0]) {
            await message.reply({
                content: 'You must provide the prefix!'
            });

            return;
        }

        if (args[0].length > 5) {
            await message.reply({
                content: 'The prefix is too long! (' + args[0].length + ' > 5)'
            });

            return;
        }

        if (args[0] === config.commands.prefix) {
            await client.database.query('DELETE FROM guild_prefixes WHERE guild_id = $1', [message.guild.id]);
        } else {
            await client.database.query('INSERT INTO guild_prefixes (guild_id, prefix) VALUES ($1, $2) ON CONFLICT (guild_id) DO UPDATE SET prefix = EXCLUDED.prefix', [message.guild.id, args[0]]);
        }

        await message.reply({
            content: 'Successfully updated the prefix to \`' + args[0] + '\`.'
        });
    }
}).toJSON();