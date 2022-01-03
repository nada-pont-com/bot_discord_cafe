
exports.default = {
    category: 'Comando para ping',
    description: 'Comando para ping',

    slash: 'both',

    callback: ({ message, interaction }) => {
        return (`ping. latencia de ${Date.now() - (message || interaction).createdTimestamp}ms.`);
    },
};
// as ICommand;

// module.exports.run = async (client, message, args) => {
//     message.channel.send(`ping. latencia de ${Date.now() - message.createdTimestamp}ms.`);
// }