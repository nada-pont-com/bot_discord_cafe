const { MessageEmbed, MessageSelectMenu, MessageActionRow } = require("discord.js");
const banco = require("./../data_base.js");


exports.default = {
    category: 'Grupo',
    description: 'Gerenciamento de Grupo',

    testOnly: true,
    slash: 'both',

    minArgs: 1,
    expectedArgs: '<funcao> <info>',
    syntaxError: 'Uso incorreto! Por favor usar "{PREFIX} adicionar {ARGUMENTS}. Use grupo help"',

    callback: async ({ message, interaction, user, guild, args }) => {
        if (interaction == null) {
            interaction.reply({ content: 'Utilize o comando interno. /grupo' });
            return;
        }
        if (args[0] == null || args[0] == '') {
            interaction.reply({ content: '.' });
            return;
        }
        banco.usersCafe();
        let sevidor = interaction.guild.id;
        let data = Date.now();
        switch (args[0]) {
            case 'help':



                let embed = MessageEmbed()
                    .setTitle('Ajuda')
                    .setDescription('Teste')
                    .setColor('#000000')
                    .addField('criar <nome>', 'Cria um novo grupo.')
                    .addField('add', 'Adiciona um usuario ao grupo.')
                    .addField('remover', 'Remove um usuario do grupo');
                interaction.reply({ content: 'teste', embeds: [embed] });


                break;
            case 'criar':
                if (args[1] == null || args[1] == '') {
                    return 'Passe um nome.';
                }
                await banco.cria_grupo(args[1], sevidor);
                break;
            case 'add':
                let grupos = await banco.get_grupo(sevidor);


                let list_grupo = MessageSelectMenu({
                    customId: 'grupos_' + sevidor + '-' + data,
                    max_values: 1,
                    min_values: 1,
                    placeholder: 'Grupos'
                });

                for (let i in grupos) {
                    const grupo = grupos[i];
                    list.addOptions([{ label: grupo.nome, value: grupo.id, }]);
                }

                let usuarios = await banco.getUsers(interaction.guild.id);

                let list_user = MessageSelectMenu({
                    customId: 'usuarios_' + sevidor + '-' + data,
                    max_values: usuarios.length,
                    min_values: 1,
                    placeholder: 'Usuarios'
                });

                for (let i in usuarios) {
                    const user = usuarios[i];
                    list.addOptions([{ label: user.nome, value: user.id, }]);
                }

                let btn = new Discord.MessageButton()
                    .setCustomId('btn_' + sevidor + '-' + data)
                    .setLabel('Confirmar');

                let row = MessageActionRow().addComponents([list_grupo, list_user, btn]);
                interaction.channel.send({ content: 'Grupo Add', components: [row] });

                const filter_s = i => {
                    i.deferUpdate();
                    return i.customId == (('grupos_' + sevidor + '-' + data) || 'usuarios_' + sevidor + '-' + data) && i.user.id === interaction.user.id
                }
                const collector_select = interaction.channel.createMessageComponentCollector({ filter_s, componentType: 'SELECT_MENU', time: 15000 * 2 });

                const filter = i => {
                    i.deferUpdate();
                    return i.customId == 'btn_' + sevidor + '-' + data && i.user.id === interaction.user.id
                };
                const collector_btn = interaction.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 15000 * 2 });

                collector_select.on('collect', async i => {
                    i.deferReply();
                });

                collector_btn.on('collect', async i => {
                    if (i.customId === 'btn_' + sevidor + '-' + data) {
                        let aux = await banco.grupo_add(args[1], i.values[0]);
                        await i.update({ content: 'A button was clicked!' + aux, components: [] });
                    }
                });

                collector.on('end', collected => { });
                break;
            case 'remove':
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