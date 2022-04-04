const { Client, Intents, Message, MessageSelectMenu } = require("discord.js");
const WOKCommands = require("wokcommands");
const path = require("path");
const config = require("./config.json");
// require("./data_base.js").start();

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_INTEGRATIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        // Intents.FLAGS.GUILD_,
    ]
});

client.on('ready', async (cliente) => {
    new WOKCommands(client, {
        commandDir: path.join(__dirname, 'comandos'),
        testServers: ['923927113424318485'],
    });
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
        return;
    }

    let a = await interaction.channel.createMessageComponentCollector({ componentType: 'BUTTON' });
    a.on('collect', async (a) => {

    })

    // let teste = MessageSelectMenu({ label: 'Teste', value: '10' });

    // interaction.channel.send({ components: teste });
});

client.login(config.BOT_TOKEN);