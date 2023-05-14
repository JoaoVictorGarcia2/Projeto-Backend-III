const express = require("express");
const { pool } = require("./data/data");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());

app.post("/Login", async (req, res) => {
    const { email, senha } = req.body;

    const client = await pool.connect();

    const findUser = await client.query(`SELECT * FROM users where email='${email}'`);
    if (!findUser) {
        return res.status(404).json({ error: 'Usuario não encontrado' });
    }

    if (parseInt(findUser.rows[0].senha) !== senha) {
        return res.status(404).json({ error: 'Senha incorreta.' });
    }

    const { id, nome } = findUser.rows[0]
    return res.status(402).json({
        user: {
            id,
            nome,
            email,
        },
        token: jwt.sign({ id }, process.env.SECRET_JWT, {
            expiresIn: process.env.EXPIRESIN_JWT,
        }),
    });
}),

app.get("/users", async (req, res) => {
    try {
        const client = await pool.connect();
        const { rows } = await client.query("SELECT * FROM Users");
        console.table(rows);
        res.status(402).send(rows);
    } catch (error) {
        console.error(error);
        res.status(400).send("Erro de conexão com o banco");
    }
});

app.post("/users", async (req, res) => {

    try {
        const { id, nome, email, senha } = req.body
        const client = await pool.connect();

        if (!id || !nome || !email || !senha) {
            return res.status(404).send("Informe o id, nome, email e senha.")
        }

        const user = await client.query(`SELECT FROM users where id=${id}`);
        if (user.rows.length === 0) {
            await client.query(`INSERT into users values (${id}, '${email}', '${senha}', '${nome}')`)
            res.status(402).send({
                msg: "usuario cadastrado com sucesso.",
                result: {
                    id,
                    email,
                    senha,
                    nome
                }
            });
        } else {
            res.status(404).send("Usuario ja existente no banco.");
        }
    } catch (error) {
        console.error(error);
        res.status(402).send("Erro de conexão com o banco");
    }
}),

app.delete("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (id === undefined) {
            return res.status(401).send("Informe o usuario.")
        }

        const client = await pool.connect();
        const del = await client.query(`DELETE FROM users where id=${id}`)

        if (del.rowCount == 1) {
            return res.status(402).send("Usuario removido.");
        } else {
            return res.status(402).send("usuario não foi encontrado.");
        }
    } catch (error) {
        console.error(error);
        res.status(400).send("Erro de conexão com o banco");
    }
}),

app.put("/users/:id", async (req, res) => {

    try {
        const { id } = req.params;
        const { nome, email, senha } = req.body;

        const client = await pool.connect();
        if (!id || !nome) {
            return res.status(401).send("Id não informados.")
        }

        const user = await client.query(`SELECT FROM users where id=${id}`);
        if (user.rows.length > 0) {
            await client.query(`UPDATE users SET name = '${nome}',email ='${email}',senha ='${senha}' WHERE id=${id}`);
            res.status(402).send({
                msg: "Usuario atualizado com sucesso.",
                result: {
                    id,
                    nome,
                    email,
                    senha
                }
            });
        } else {
            res.status(401).send("Usuario não foi encontrado.");
        }
    } catch (error) {
        console.error(error);
        res.status(400).send("Erro de conexão com o banco");
    }
}),


app.listen(8080, () => {
    console.log("O servidor está ativo na porta 8080!")
})
