const { Message } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const MessageCommand = require("../../structure/MessageCommand");
const config = require("../../config");

module.exports = new MessageCommand({
    command: {
        name: 'help',
        description: 'Replies with a list of available message commands.',
        aliases: ['h']
    },
    options: {
        cooldown: 10000
    },
    /**
     * 
     * @param {DiscordBot} client 
     * @param {Message} message 
     * @param {string[]} args
     */
    run: async (client, message, args) => {
        const res = await client.database.query('SELECT prefix FROM guild_prefixes WHERE guild_id = $1', [message.guild.id]);
        const prefix = res.rows.length > 0 ? res.rows[0].prefix : config.commands.prefix;
        await message.reply({
            content: `${client.collection.message_commands.map((cmd) => '\`' + prefix + cmd.command.name + '\`').join(', ')}`
        });
    }
}).toJSON();