const sqlite = require('sqlite3').verbose();
let db = new sqlite.Database('banco.db');
module.exports.start = () => {
    db.serialize(() => {
        db.run("CREATE TABLE if not exists usuario (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,id_usuario TEXT NOT NULL)");
        db.run("CREATE TABLE if not exists servidor (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,id_servidor TEXT NOT NULL)");
        db.run(
            `CREATE TABLE if not exists usuario_servidor (
                id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                id_usuario INT NOT NULL,
                id_servidor INT NOT NULL,
                sorteado INT DEFAULT 0 NOT NULL,
                cafe INT DEFAULT 0 NOT NULL,
                CONSTRAINT usuario_servidor_FK_usuario_id FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                CONSTRAINT usuario_servidor_FK_servidor_id FOREIGN KEY (id_servidor) REFERENCES servidor(id) ON DELETE RESTRICT ON UPDATE RESTRICT
            );
            CREATE UNIQUE if not exists INDEX usuario_servidor_id_usuario_IDX ON usuario_servidor (id_usuario,id_servidor);`
        );
    });
}

module.exports.usersCafe = async (usuarios = [], servidor) => {
    // let promesa = new Promise((resolve, reject) => {
    // let list = [];
    let list = await select_bd(`SELECT s.id as s, 
            u.id as u, 
            _us.sorteado,
            _us.cafe,
            u.id_usuario as usuario,
            s.id_servidor as servidor
        FROM usuario_servidor _us 
            JOIN usuario u on u.id = _us.id_usuario 
            JOIN servidor s on s.id =  _us.id_servidor
        WHERE s.id_servidor='${servidor}'`, [],
        (row, list = []) => {
            let tam = usuarios.length;
            usuarios = usuarios.filter((element) => {
                return element.id != row.usuario;
            });
            if (tam != usuarios.length) {
                list.push(row);
            }
        }
    );
    if (typeof list == 'boolean') {
        return [];
    }

    for (const usuario of usuarios) {
        let aux = await insert(usuario.id, servidor);
        list.push({ usuario: usuario.id, servidor: servidor, cafe: 0, sorteado: 0 });
    }
    return list;
}

async function insert(servidor, usuario) {
    let usuario_w = select_bd(`SELECT u.id as usuario FROM usuario u where u.id_usuario =?`, [usuario]);
    let servidor_w = select_bd(`SELECT s.id as servidor FROM servidor s WHERE s.id_servidor=?`, [servidor]);
    let list = await Promise.all([usuario_w, servidor_w]);
    usuario_w = list[0];
    servidor_w = list[1];
    let id_usuario;
    let id_servidor;
    if (usuario_w.length == 0) {
        id_usuario = await insert_usuario(usuario);
    } else {
        id_usuario = usuario_w[0].usuario
    }

    if (usuario_w.length == 0) {
        id_servidor = await insert_servidor(servidor);
    } else {
        id_servidor = usuario_w[0].usuario
    }
    insert_servidor_usuario(id_servidor, id_usuario);
    return { 'u': id_usuario, 's': id_servidor };
}

async function insert_usuario(usuario) {
    await query_bd('insert into usuario (id_usuario) values (?)', [usuario]);
    return (await select_bd('SELECT u.id as usuario FROM usuario u where u.id_usuario =?', [usuario]))[0].usuario;
}

async function insert_servidor(servidor) {
    await query_bd('insert into servidor (id_servidor) values (?)', [servidor]);
    return (await select_bd('SELECT s.id as servidor FROM servidor s where s.id_servidor = ?', [servidor]))[0].servidor;
}

async function insert_servidor_usuario(servidor_id, usuario_id) {
    await query_bd('insert into servidor_usuario (cafe,sorteado,usuario_id,servidor_id) values (0,0,?,?)', [usuario_id, servidor_id]);
}


module.exports.getUsers = (servidor) => {
    let promesa = new Promise((resolve, reject) => {
        let list = [];
        db.each(`SELECT s.id as s, u.id as u, us.sorteado, us.cafe, u.id_usuario as usuario, s.id_servidor as servidor
            FROM usuario_servidor us 
                JOIN usuario u on u.id = us.id_usuario
                JOIN servidor s on s.id = us.id_servidor
            WHERE s.id_servidor='${servidor}'`,
            (erro, dados) => {
                list.push(dados);
            }, (erro) => {
                resolve(list);
            });
    });
    return promesa;
}


module.exports.updateUser = (user, servidor, vezes, sorteado) => {
    let promesa = new Promise(async (resolve, reject) => {
        let aux = await select_bd(`SELECT _us.id
            FROM usuario_servidor _us 
                JOIN usuario u on u.id = _us.id_usuario 
                JOIN servidor s on s.id =  _us.id_servidor
            WHERE s.id_servidor=? AND u.id_usuario=?`, [servidor, user]
        );
        db.run(`UPDATE usuario_servidor set cafe=?,sorteado=? WHERE id=?`, [vezes, sorteado, aux[0].id], function (erro) {
            if (erro) {
                console.error(erro.message);
            }
            // console.log(`Row(s) updated: ${this.changes}`);
            resolve(erro == null);
        });
    });
    return promesa;
}

module.exports.log_cafe = (user, servidor) => {
    let promesa = new Promise((resolve, reject) => {
        db.run(`INSERT into log_cafe (id_usuario, id_servidor, data) VALUES (?,?,?)`, [user, servidor, new Date().toDateString()], function (erro) {
            if (erro) {
                console.error(erro.message);
            }
            resolve(erro == null);
        });
    });
    return promesa;
}

module.exports.cria_grupo = async (nome, servidor) => {
    let id_s = (await select_bd('SELECT id from servidor WHERE id_servidor=?', [servidor]))[0];
    return await query_bd('INSERT into grupo (nome,servidor_id) values (?,?)', [nome, id_s['id']])
}

module.exports.grupo_add = async (users, grupo, type_user) => {
    let list = [];

    for (let i in users) {
        const user = users[i];
        list[list.length] = query_bd('INSERT into grupo_usuario (id_u,id_s) values (?,?)', [user, grupo]);
    }
    list = await Promise.all(list);
    let retorno = [];
    for (let i in list) {
        retorno[i] = users[i] + ':' + list[i];
    }
    return retorno.join(',');
}



function query_bd(sql = '', params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, (erro) => {
            resolve(erro == null);
        });
    });
}


function select_bd(sql = '', params = [], callback = undefined) {
    let list = [];
    return new Promise((resolve, reject) => {
        db.each(sql, params, (erro, row) => {
            if (erro == null) {
                if (typeof callback == 'function') callback(row, list);
                else list.push(row);
            }
        }, (erro) => {
            if (erro) resolve(erro == null);
            else resolve(list);
        });
    });
}


/* 
SELECT 
    u2.id as id_usuario,
    s.id as id_servidor,
    u.vezes as cafe,	
    u.sorteado 
FROM "user" u 
    left join usuario u2 on u2.id_usuario = u.id 
    left join servidor s on s.id_servidor = u.servidor 

*/