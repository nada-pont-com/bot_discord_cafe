const Discord = require("discord.js");
const banco = require("./../data_base.js");
exports.default = {
    category: 'Comando para info em tabela',
    description: 'Comando para info em tabela',

    slash: 'both',

    callback: async ({ message, interaction, user, guild, args }) => {
        let msg  = message || interaction;
        let users = await getUsers(msg);
        let usersDados = await banco.usersCafe(users, msg.guild.id);
        sendEmbed(msg, users, usersDados);
    }
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

function _montarTabela(users = [],userDados = []){
    let max = 0;
    let list = [];
    let min = 0;
    userDados.forEach((element) => {
        let num = (100 / validaValor(element.vezes + 1)) + min;
        list.push({ min: min, max: num, id: element.id, vezes: element.vezes, sorteado: element.sorteado });
        min = num;
    });
    users.forEach(user => {
        if(user.username.length>max){
            max = user.username.length;
        }
    });
    // ----------------------------------------
    let espaco = '                                     '
    let aux = espaco.substring(0, max/2);
    let texto = `${aux} Nome ${aux}| Sorteado | Fez | % \n`;
    for (let i in list) {
        const userD = list[i];
        const user = users.find((user) => {
            return user.id == userD.id;
        });
        aux = espaco.substring(0,((max+4)-user.username.length)/2);
        
        texto += `${aux} ${user.username} ${aux} | ${userD.sorteado} | ${userD.vezes} | ${(((userD.max-userD.min)/min).toPrecision(2)*100).toFixed(2)}%\n`
    }
    return texto;
}

function validaValor(valor = 1) {
    if (valor >= 100) {
        valor = valor / 100;
        let aux = parseInt(valor);
        valor = Math.max(1, (valor - aux) * 100);
    }
    return valor;
}

async function sendEmbed(message, users, usersDados) {
    let author = (message.author || message.user);
    
    let embed = new Discord.MessageEmbed()
        .setTimestamp()
        .setTitle('Info')
        .setColor('#000000')
        .setDescription(_montarTabela(users,usersDados));
    message.reply({ embeds: [embed], });
}