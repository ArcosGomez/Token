const express = require('express');
const app = express();


const jwt = require('jsonwebtoken');
const keys = require('./settings/keys');


app.set('key', keys.key);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('hola mundo');
});

app.listen(3000, () => {
    console.log('servidor UP en http://localhost:3000');
});

// solo para probar que este funcionando en postman
app.post('/login', (req, res) => {
    if (req.body.usuario == 'admin' && req.body.pass == '12345') {
        const payload = {
            check: true
        };
        const token = jwt.sign(payload, app.get('key'), {
            expiresIn: '1d'
        });
        res.json({
            message: '!Autenticacion existosa¡',
            token: token
        });

    } else {
        res.json({
            message: 'Usuario y/o password incorrecto'
        })
    }

});

//para proteger las peticiones no deseadas
const verificacion = express.Router();

verificacion.use((req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    // console.log(token);
    if (!token) {
        res.status(401).send({
            error: 'es necesario un token de autenticacion'
        })
        return
    }
    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
        console.log(token);
    }
    if (token) {
        jwt.verify(token, app.get('key'), (error, decoded) => {
            if (error) {
                return res.json({
                    message: 'el token no es valido'
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    }
});

app.get('/info', verificacion, (req, res) => {
    res.json('INFORMACION IMPORTENTE ENTREGADA');
})

