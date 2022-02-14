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
    users.forEach(user => {
        if(user.username.length>max){
            max = user.username.length;
        }
    });
    let espaco = '                                                      '
    let aux = espaco.substring(0, max/2);
    let texto = `${aux} Nome ${aux}| Sorteado | Fez \n`;
    for (let i in userDados) {
        const userD = userDados[i];
        const user = users.find((user) => {
            return user.id == userD.id;
        });
        aux = espaco.substring(0,(max+4)-user.username.length);
        
        texto += `${aux} ${user.username} ${aux} | ${userD.sorteado} | ${userD.vezes}\n`
    }
    return texto;
}

async function sendEmbed(message, users, usersDados) {
    let author = (message.author || message.user);
    
    let embed = new Discord.MessageEmbed()
        .setTimestamp()
        .setTitle('Info')
        .setAuthor(author.tag)
        .setColor('#000000')
        .setDescription(_montarTabela(users,usersDados))
        .setFooter('info');
    message.reply({ embeds: [embed], });
}