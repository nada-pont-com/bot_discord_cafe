const { MessageEmbed, MessageSelectMenu, MessageActionRow, MessageButton } = require("discord.js");
const { cria_grupo, get_grupo, add_grupo, usersCafe, get_users } = require("./../data_base.js");

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
        usersCafe();
        let sevidor = interaction.guild.id;
        let data = Date.now();
        switch (args[0]) {
            case 'help':



                let embed = new MessageEmbed()
                    .setTitle('Ajuda')
                    .setDescription('Teste')
                    .setColor('#000000')
                    .addField('criar <nome>', 'Cria um novo grupo.')
                    .addField('add', 'Adiciona um usuario ao grupo.')
                    .addField('list', 'Bem, uma lista de grupos.')
                    .addField('remover', 'Remove um usuario do grupo.');
                interaction.reply({ content: 'teste', embeds: [embed] });


                break;
            case 'criar':
                if (args[1] == null || args[1] == '') {
                    return 'Passe um nome.';
                }
                if (await cria_grupo(args[1], sevidor)) {
                    return `Criado com sucesso, o grupo: ${args[1]}`;
                } else return `algo deu Errado, ao criar: ${args[1]}`;

                break;
            case 'add':
                let grupos = await get_grupo(sevidor);

                if (grupos.length == 0) return 'Nenhum grupo cadastrado';

                let list_grupo = new MessageSelectMenu({
                    customId: 'grupos_' + sevidor + '-' + data,
                    placeholder: 'Grupos'
                });

                for (let i in grupos) {
                    const grupo = grupos[i];
                    list_grupo.addOptions([{ label: grupo.nome, value: `${grupo.id}`, }]);
                }
                let users = await getUsers(interaction)
                let usuarios = await get_users(interaction.guild.id);

                let list_user = new MessageSelectMenu({
                    customId: 'usuarios_' + sevidor + '-' + data,
                    max_values: users.length,
                    min_values: 1,
                    placeholder: 'Usuarios'
                });


                for (let i in usuarios) {
                    const user = usuarios[i];
                    const {
                        username
                    } = users.find((item) => {
                        return item.id == user.usuario;
                    }) ?? {};
                    if (username == undefined) {
                        continue;
                    }

                    list_user.addOptions([{ label: `@${username}`, value: `${user.u}` }]);
                }

                let btn = new MessageButton()
                    .setCustomId('btn_' + sevidor + '-' + data)
                    .setStyle('PRIMARY')
                    .setLabel('Confirmar');

                let row = new MessageActionRow().addComponents([list_grupo]);
                let row2 = new MessageActionRow().addComponents([list_user]);
                let row3 = new MessageActionRow().addComponents([btn]);
                let msg = await interaction.channel.send({ content: 'Grupo Add', components: [row, row2, row3] });

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

                let usersV = [];
                let gruposV = [];

                collector_select.on('collect', async i => {
                    // i.deferReply();
                    i.deferUpdate();
                    if (i.customId == 'grupos_' + sevidor + '-' + data) {
                        gruposV = i.values;
                    } else if (i.customId == 'usuarios_' + sevidor + '-' + data) {
                        usersV = i.values;
                    }
                });

                collector_btn.on('collect', async i => {
                    if (i.customId === 'btn_' + sevidor + '-' + data) {
                        if (usersV.length > 0 && gruposV.length > 0) {
                            let aux = await add_grupo(usersV, gruposV[0]);
                            await msg.edit({ content: aux.length + ' usuario adicionados no grupo!', components: [] });
                        }
                    }
                });

                collector_btn.on('end', collected => { });
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

async function getUsers(interaction) {
    let members = await interaction.guild.members.list({ limit: 99 });
    return members.filter((element) => {
        return !element.user.bot;
    }).map((value) => {
        return value.user;
    });
}


// module.exports.run = async (client, message, args) => {
//     message.channel.send(`ping. latencia de ${Date.now() - message.createdTimestamp}ms.`);
// }