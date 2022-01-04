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

    if (usersValidos.length == 0) {
        if (!isMessage) {
            original.editReply({ content: "Aparentemente nenhum usuario pode fazer café." });
        } else {
            editReply("Aparentemente nenhum usuario pode fazer café.");
        }
        return;
    }
    let valor = getRandowUser(usersValidos);
    let user = await getUser(users, valor.id);
    let msg = await sendEmbed(message, user);
    reaction(msg, valor, user, original, args, repeat);
}

function reaction(msg, valor, user, original, args = [], repeat = []) {
    let emojis = ['✅', '❎'];
    // console.log(msg);
    for (const key in emojis) {
        msg.react(emojis[key]);
    }

    const filter = (reaction, user) => { return (reaction.emoji.name === '✅' || reaction.emoji.name === '❎') && !user.bot };
    const colector = msg.createReactionCollector({ filter: filter, max: 1, time: 1000 * 15 });

    colector.on('collect', (reaction) => {
        if (reaction.emoji.name == '❎') {
            banco.updateUser(valor.id, msg.guild.id, parseInt(valor.vezes), parseInt(valor.sorteado) + 1);
            msg.delete();
            repeat.push(user);
            start(msg, args, original, repeat);
        } else {
            banco.updateUser(valor.id, msg.guild.id, parseInt(valor.vezes) + 1, parseInt(valor.sorteado) + 1);
            // msg.deleteReply();
            if (args[0] != undefined) {
                let aux = args[0];
            }
        }
        colector.stop();
    });
    colector.on('end', (collect, reason) => {
        // console.log(collect);
        // if (collect.size() == 0) {
        //     console.log('\nteste\n');
        // }
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

async function sendEmbed(message, user) {
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
    return await message.channel.send({ embeds: [embed], });

}

function clone(list = []) {
    let aux = [];
    list.forEach((vl) => {
        aux.push(vl);
    })
    return aux;
}