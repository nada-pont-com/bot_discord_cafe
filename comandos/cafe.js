const Discord = require("discord.js");
const banco = require("./../data_base.js");

let isMessage = false;
let _client;
exports.default = {
    category: 'Comando para Sortear para cafe',
    description: 'Comando para Sortear para cafe',

    slash: 'both',

    // minArgs: 0,
    // expectedArgs: '<tag>',

    callback: async ({ message, interaction, args, guild, client }) => {
        _client = client;
        let msg = (message || interaction);

        isMessage = !!message;
        await _reply(msg);
        if (isMessage) {
            message.delete();
        }
        start(msg, args, msg);
    },
};
let reply;
async function _reply(msg) {
    reply = await msg.reply({ content: 'cafe' });
}

function editReply(msg = 'cafe') {
    reply.edit({ content: msg });
}

async function start(message, args, original, repeat = []) {
    let users = await getUsers(message);
    let usersValidos = await getUsersValidos(users, message, clone(repeat));
    console.log(message.guild.id);
    if (usersValidos.length == 0) {
        msgNotUserFind(original);
        return;
    }
    let valor = getRandowUser(usersValidos);
    let user = await getUser(users, valor.id);

    if (user == undefined) {
        msgNotUserFind(original);
        return;
    }
    let msg = await sendEmbed(original, user, repeat);
    reaction(msg, valor, user, original, args, repeat);
}
function msgNotUserFind(original) {
    if (!isMessage) {
        original.editReply({ content: "Aparentemente nenhum usuario pode fazer café." });
    } else {
        editReply("Aparentemente nenhum usuario pode fazer café.");
    }
}

function reaction(msg, valor, user, original, args = [], repeat = []) {
    let emojis = ['✅', '❎', '❌'];
    // console.log(msg);
    for (const key in emojis) {
        msg.react(emojis[key]);
    }

    const filter = (reaction, _user) => {
        return ((reaction.emoji.name === '❎' || reaction.emoji.name === '❌') && !_user.bot)
            || (reaction.emoji.name === '✅' && _user.tag == user.tag);
    };
    const colector = msg.createReactionCollector({ filter: filter, max: 1, time: 1000 * 60 * 15 });

    colector.on('collect', (reaction) => {
        if (reaction.emoji.name === '❎') {
            banco.updateUser(valor.id, msg.guild.id, parseInt(valor.vezes), parseInt(valor.sorteado) + 1);
            msg.delete();
            repeat.push(user);
            start(msg, args, original, repeat);
        } else if (reaction.emoji.name === '✅') {
            banco.updateUser(valor.id, msg.guild.id, parseInt(valor.vezes) + 1, parseInt(valor.sorteado) + 1);
            // msg.deleteReply();
            // if (args[0] != undefined) {
            //     let aux = args[0];
            // }
        } else {
            msg.delete();
            if (!isMessage) {
                original.editReply({ content: "Cancelado o sorteio do café." });
            } else {
                editReply("Cancelado o sorteio do café.");
            }
        }
        colector.stop();
    });
    colector.on('end', (collect, reason) => {
        if (collect.size == 0) {
            // msg.delete();
            banco.updateUser(valor.id, msg.guild.id, parseInt(valor.vezes) + 1, parseInt(valor.sorteado) + 1);
        }
    });
}

async function getUsers(message) {
    let members = await message.guild.members.list({ limit: 99 });
    members = members.filter((element) => {
        return !element.user.bot;
    });
    return members.map((value) => {
        return value.user;
    });
}

async function getUsersValidos(users, message, repeat = []) {
    let listUsers = await banco.usersCafe(users, message.guild.id);

    listUsers = listUsers.filter((element) => {
        let valida = true;
        for (const key in repeat) {
            if (element.id == repeat[key].id) {
                valida = false;
                repeat.splice(key, 1);
                break;
            };
        }
        return valida;
    });
    return listUsers;
}

function getRandowUser(listUsers) {
    let list = [];
    let min = 0;
    listUsers.forEach((element) => {
        let num = (100 / validaValor(element.vezes + 1)) + min;
        list.push({ min: min, max: num, id: element.id, vezes: element.vezes, sorteado: element.sorteado });
        min = num;
    });
    let num = Math.floor(Math.random() * min);
    let valor = list.find((element) => {
        return num >= element.min && num <= element.max;
    });
    return valor;
}

function validaValor(valor = 1) {
    if (valor >= 100) {
        valor = valor / 100;
        let aux = parseInt(valor);
        valor = Math.max(1, (valor - aux) * 100);
    }
    return valor;
}

async function getUser(users, id) {

    let user = users.find((user) => {
        return user.id == id;
    });
    return user;
}

async function sendEmbed(message, user, repeat = []) {
    let author = (message.author || message.user);
    // let avatar = author.displayAvatarURL({ format: 'png', dynamic: true });
    // console.log(user);
    let embed = new Discord.MessageEmbed()
        .setTimestamp()
        .setTitle('teste')
        .setAuthor(author.tag)
        .setColor('#000000')
        .setDescription(`${user} foi sorteado para fazer cafe.`)
        .setImage(user.displayAvatarURL({ format: 'png', dynamic: true }))
        .setTitle('Cafe')
        .setFooter('cafe');
    if (repeat.length != 0) {
        embed.addField("Lista", "" + (repeat.map((i) => { return i.tag; }).join(',')));
    }
    return await message.channel.send({ embeds: [embed], });
}

function clone(list = []) {
    let aux = [];
    list.forEach((vl) => {
        aux.push(vl);
    })
    return aux;
}