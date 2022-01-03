const { Client, Intents, Message } = require("discord.js");
const WOKCommands = require("wokcommands");
const path = require("path");
const config = require("./config.json");
require("./data_base.js").start();

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ]
});

client.on('ready', async (cliente) => {
    new WOKCommands(client, {
        commandDir: path.join(__dirname, 'comandos'),
        testServers: ['923927113424318485'],
    });
});

client.login(config.BOT_TOKEN);