const Discord = require("discord.js");
const banco = require("./../data_base.js");


exports.default = {
    category: 'Grupo',
    description: 'Gerenciamento de Grupo',

    testOnly: true,
    slash: 'both',

    minArgs: 1,
    expectedArgs: '<funcao> <info>',
    syntaxError: 'Uso incorreto! Por favor usar "{PREFIX} adicionar {ARGUMENTS}. Use grupo help"',

    callback: ({ message, interaction, user, guild, args }) => {
        if (interaction == null) return 'Utilize o comando interno. /grupo';
        if (args[0] == null || args[0] == '') {
            return '.';
        }

        switch (args[0]) {
            case 'help':

                // let aux = new Discord.MessageSelectMenu({ customId: 'tese', max_values: 1, min_values: 1, placeholder: '10' }).addOptions([{ label: 'teste', value: '10', }]);
                // let aux = new Discord.MessageButton()
                //     .setCustomId('tese')
                //     .setLabel('Primary')
                //     .setStyle('PRIMARY');

                // let teste = new Discord.MessageActionRow().addComponents([aux]);
                new Discord.text
                let embed = new Discord.MessageEmbed()
                    .setTitle('Ajuda')
                    .setDescription('Teste')
                    .setColor('#000000')
                    .addField('criar <nome>', 'Cria um novo grupo.')
                    .addField('add <user>', 'Adiciona um usuario ao grupo.')
                    .addField('remover <user>', 'Remove um usuario do grupo');
                interaction.reply({ content: 'teste', embeds: [embed] });
                // interaction.channel.send({ content: 'teste', components: [teste] });

                // const filter = i => i.customId == 'tese';

                // const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

                // collector.on('collect', async i => {
                //     if (i.customId === 'tese') {
                //         await i.update({ content: 'A button was clicked!', components: [] });
                //     }
                // });

                // collector.on('end', collected => console.log(`Collected ${collected.size} items`));

                break;
            case 'criar':

                break;

            default:
                interaction.reply({ content: 'Utilize /grupo help' });
                break;
        }
    },
};
// as ICommand;

// module.exports.run = async (client, message, args) => {
//     message.channel.send(`ping. latencia de ${Date.now() - message.createdTimestamp}ms.`);
// }