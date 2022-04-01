const Discord = require("discord.js");
const banco = require("./../data_base.js");


exports.default = {
    category: 'Comando para info',
    description: 'Comando para info',

    slash: 'both',

    minArgs: 0,
    expectedArgs: '<target>',
    syntaxError: 'Uso incorreto! Por favor usar "{PREFIX} adicionar {ARGUMENTS}"',

    callback: async ({ message, interaction, user, guild, args }) => {
        let userBusca = args[0] || user;

        if (typeof userBusca == 'string') {
            if (userBusca.indexOf("<@!") != -1) {
                userBusca = userBusca.slice('3', userBusca.length - 1);
                userBusca = (await getUsers((message || interaction))).find((item) => {
                    return item.id == userBusca;
                });
            } else {
                (message || interaction).reply({
                    content: "Parametro invalido.",
                    ephemeral: true,
                });
                return;
            }
        }
        let list = await banco.getUsers(guild.id);
        let userDados = list.find((item) => {
            return item.id == userBusca.usuario;
        });

        sendEmbed((message || interaction), userBusca, userDados);
    },
};

async function getUsers(message) {
    let members = await message.guild.members.list({ limit: 99 });
    members = members.filter((element) => {
        return !element.user.bot;
    });
    return members.map((value) => {
        return value.user;
    });
}


async function sendEmbed(message, user, userDados) {
    let author = (message.author || message.user);
    let embed = new Discord.MessageEmbed()
        .setTimestamp()
        .setTitle('Info')
        .setColor('#000000')
        .setDescription(`informações do ${user}.`)
        .addField("Sorteado", "Vl: " + (userDados.sorteado || "0"))
        .addField("Vezes que fez cafe", "Vl: " + (userDados.cafe || "0"))
        .setImage(user.displayAvatarURL({ format: 'png', dynamic: true }))
        .setTitle('Info');
    message.reply({ embeds: [embed], });

}