const Discord = require("discord.js");

exports.default = {
    category: 'Teste',
    description: 'teste',

    testOnly: true,
    slash: 'both',

    minArgs: 1,
    expectedArgs: '<num>',
    syntaxError: 'Uso incorreto! Por favor usar "{PREFIX} adicionar {ARGUMENTS}"',

    callback: async ({ message, interaction, args }) => {
        let msg = (message || interaction);
        if (!msg.member.permissions.has("MANAGE_MESSAGES")) {
            msg.reply(
                "você é fraco, lhe falta permissão de `Gerenciar Mensagens` para usar esse comando"
            );
            return;
        }

        const deleteCount = parseInt(args[0], 10);
        if (!deleteCount || deleteCount < 1 || deleteCount > 99) {
            msg.reply(
                "forneça um número de até **99 mensagens** a serem excluídas"
            );
            return;
        }

        const fetched = await msg.channel.messages.fetch({
            limit: deleteCount + 1
        });
        await msg.channel.bulkDelete(fetched);
        if (message) {
            msg.channel.send({ content: `**${args[0]} mensagens limpas nesse chat!**` });
        } else {
            msg.reply({ content: `**${args[0]} mensagens limpas nesse chat!**` });
        }
    }
};

