const banco = require('./data_base.js');

module.exports.sincronizar = async (interaction) => {
    let users = await getUsers(interaction);
    await banco.usersCafe(users, interaction.guild.id);
    return true;
}


async function getUsers(interaction) {
    let members = await interaction.guild.members.list({ limit: 99 });
    members = members.filter((element) => {
        return !element.user.bot;
    });
    return members.map((value) => {
        return value.user;
    });
}