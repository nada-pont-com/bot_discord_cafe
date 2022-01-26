const sqlite = require('sqlite3').verbose();
let db = new sqlite.Database('banco.db');
module.exports.start = () => {
    db.serialize(() => {
        db.run("CREATE TABLE if not exists user(id text not null, servidor text not null, vezes int not null, sorteado int not null)");
    });
}

module.exports.usersCafe = (usuarios = [], servidor) => {
    let promesa = new Promise((resolve, reject) => {
        let list = [];
        db.each(`SELECT * FROM user WHERE servidor='${servidor}'`, (erro, dados) => {
            let tam = usuarios.length;
            usuarios = usuarios.filter((element) => {
                return element.id != dados.id;
            })
            if (tam != usuarios.length) {
                list.push(dados);
            }
        }, (erro, count) => {
            if (erro) {
                console.error(erro.message);
            }
            usuarios.forEach(element => {
                db.run("INSERT INTO user(id,servidor,vezes,sorteado) VALUES (?,?,0,0)", [element.id, servidor]);
                list.push({ id: element.id, servidor: servidor, vezes: 0, sorteado: 0 });
            });
            resolve(list);
        });
    });
    return promesa;
}

module.exports.getUsers = (servidor) => {
    let promesa = new Promise((resolve, reject) => {
        let list = [];
        db.each(`SELECT * FROM user WHERE servidor='${servidor}'`, (erro, dados) => {
            list.push(dados);
        }, (erro) => {
            resolve(list);
        });
    });
    return promesa;
}


module.exports.updateUser = (user, servidor, vezes, sorteado) => {
    let promesa = new Promise((resolve, reject) => {
        let list = [];
        db.run(`UPDATE user set vezes=?,sorteado=? WHERE id=? AND servidor=?`, [vezes, sorteado, user, servidor], function (erro) {
            if (erro) {
                console.error(erro.message);
            }
            // console.log(`Row(s) updated: ${this.changes}`);
            resolve(list);
        });
    });
    return promesa;
}
