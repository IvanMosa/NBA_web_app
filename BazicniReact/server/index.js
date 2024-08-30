const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');
const bodyParser = require('body-parser');
const app = express();

const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var _ = require('lodash');

const dbConfig = require('./dbConfig');

app.use(cors());
app.use(bodyParser.json());

app.use(express.json());

app.use(function (err, req, res, next) {
    err.message;
    next(err);
});

async function init() {
    try {
        await oracledb.createPool({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString,
        });
        console.log('Connection pool started');
    } catch (err) {
        console.error('Error creating pool', err);
    }
}

init();

app.listen(4000, function () {
    console.log('listening to the port 4000');
});

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, dbConfig.jwtSecretKey, (err, result) => {
            if (err) {
                console.log(err);
                //return res.sendStatus(401);

                let msg =
                    'Istekla je korisnička sesija, molimo ponovite prijavu na uslugu';
                let error = 403;

                res.status(403).send({
                    message: msg,
                });
            } else {
                //console.log("Users seems ok - " + result);
                //console.log(result)
                req.user = result;
                next();
            }
        });
    } else {
        let msg = 'Molimo prijavite se na uslugu za pregled traženih resursa';
        let error = 401;

        res.status(401).send({
            message: msg,
        });
    }
};

//Login API
app.post('/login', async (req, res) => {
    let connection;

    try {
        connection = await oracledb.getConnection();
        const { userName, password } = req.body;

        const result = await connection.execute(
            `SELECT K.NAZIV, K.SIFRA AS SIFRA FROM KORISNICI K WHERE K.NAZIV = :userName`,
            { userName },
            {
                resultSet: true,
                outFormat: oracledb.OUT_FORMAT_OBJECT,
            }
        );

        if (result && result.resultSet) {
            const rs = result.resultSet;
            let row = await rs.getRow();

            if (row) {
                const HashedPassword = row.SIFRA;
                const userInputPassword = password;

                bcrypt.compare(
                    userInputPassword,
                    HashedPassword,
                    (err, result1) => {
                        if (err) {
                            console.error('Error comparing passwords:', err);
                            return;
                        }
                        if (result1) {
                            console.log('Passwords match! User authenticated.');

                            let payload = { name: userName };
                            let token = jwt.sign(
                                payload,
                                dbConfig.jwtSecretKey,
                                { expiresIn: dbConfig.jwtExpirationWeb }
                            );

                            let resultMsg = {
                                message: 'Login!!',
                                token: token,
                                user: { userName: userName },
                            };

                            res.status(200).json({ token: token });
                        } else {
                            console.log(
                                'Passwords do not match! Authentication failed.'
                            );
                            res.status(204).send({
                                message: 'password not found',
                            });
                        }
                    }
                );
            } else {
                console.log('Username doesnt exist');
                res.status(404).send({ message: 'username not found' });
            }

            await rs.close();
        } else {
            console.log('Query execution failed or no result set returned');
            res.status(500).send({ message: 'Query execution failed' });
        }
    } catch (err) {
        console.error(err);
        res.status(503).send({ message: 'there was an error' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

//Register API
app.post('/register', async (req, res) => {
    let connection;
    const saltRounds = 10;
    const { userName, password } = req.body;
    let hashedPass;

    bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
            console.log('Failed to generate salt');
            return;
        }
        bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
                console.log('Failed to hash the password');
                return;
            }
            hashedPass = hash;
            console.log('Hashed password:', hash);
        });
    });

    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            `INSERT INTO KORISNICI(NAZIV, SIFRA) VALUES(:userName, :hashedPass)`,
            {
                userName,
                hashedPass,
            },
            {
                autoCommit: true,
            }
        );

        console.log('Result:', result);
        if (result.rowsAffected === 1) {
            res.status(201).send({ message: 'User registered successfully' });
        } else {
            res.status(500).send({ message: 'User registration failed' });
        }
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).send({
            message: 'There was an error during registration',
            error: err,
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing the connection:', err);
            }
        }
    }
});

//Momčadi sortirane po izboru korisnika (Konferencija / Divizija) API
app.post('/ShowMomcadi', async (req, res) => {
    let connection;
    let imeSezone = req.body.imeSezone.trim();
    let Konf_Div = req.body.konf_div.trim();
    const params = [];
    let hasImeSezone = imeSezone && imeSezone.trim().length > 0;

    let sql_SELECT =
        "SELECT M.NAZIV AS NAZIV, VML.BROJ_POBJEDA, VML.BROJ_PORAZA, VML.KONACNI_PLASMAN AS KONACNI_PLASMAN, L.NAZIV || ' ' || L.SEZONA AS SEZONA";
    let sql_FROM = ' FROM VEZE_MOMCAD_LIGE VML, LIGE L, MOMCAD M';
    let sql_WHERE =
        ' WHERE VML.MOMCAD_ID = M.MOMCAD_ID AND VML.LIGA_ID = L.LIGA_ID';

    if (hasImeSezone) {
        sql_WHERE += ' AND L.SEZONA = :imeSezone';
        params.push(imeSezone);
    }

    if (Konf_Div === 'Konferencija') {
        sql_SELECT += ', KON.NAZIV';
        sql_FROM += ', KONFERENCIJE KON';
        sql_WHERE +=
            ' AND VML.KONFERENCIJA_ID = KON.KONFERENCIJA_ID ORDER BY KONACNI_PLASMAN';
    } else if (Konf_Div === 'Divizija') {
        sql_SELECT += ', DIV.NAZIV';
        sql_FROM += ', DIVIZIJE DIV';
        sql_WHERE +=
            ' AND VML.DIVIZIJA_ID = DIV.DIVIZIJA_ID ORDER BY KONACNI_PLASMAN';
    }
    try {
        connection = await oracledb.getConnection();
        const sql = sql_SELECT + sql_FROM + sql_WHERE;
        const result = await connection.execute(sql, params);
        console.log('Konferencija 22/23: ', result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(503).send({ message: 'there was an error' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

//Nazivi svih momčadi, liga, konferencija, divizija API
app.get('/getMomcadi', async (req, res) => {
    let connection;

    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(`SELECT M.NAZIV FROM MOMCAD M`);
        const result1 = await connection.execute(
            `SELECT L.SEZONA FROM LIGE L ORDER BY SEZONA DESC`
        );
        const result2 = await connection.execute(
            `SELECT K.NAZIV FROM KONFERENCIJE K`
        );
        const result3 = await connection.execute(
            `SELECT D.NAZIV FROM DIVIZIJE D`
        );
        const result4 = await connection.execute('SELECT S.NAZIV FROM SUDCI S');
        res.json({
            momcad: result.rows,
            sezona: result1.rows,
            konf: result2.rows,
            div: result3.rows,
            sudci: result4.rows,
        });
    } catch (err) {
        console.error(err);
        res.status(503).send({ message: 'there was an error' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

//Naziv, visina, državljanstvo, pozicija, datum potpisa igrača odabrane momčadi API
app.post('/showRoster', async (req, res) => {
    let connection;

    const status = req.body.status;
    const imeMomcad = req.body.imeMomcad;
    let hasImeMomcad = imeMomcad ? imeMomcad.trim().length > 0 : false;

    let sql2 = 'SELECT D.NAZIV FROM DRZAVE D ORDER BY D.NAZIV';
    let sql1 = 'SELECT P.NAZIV FROM POZICIJE P ORDER BY P.NAZIV';
    let sql =
        "SELECT I.NAZIV, NVL(I.VISINA, ' '), NVL(D.NAZIV,' '), NVL(P.NAZIV,' '), SUBSTR(VMI.DATUM_OD,1, 10), I.BROJ_DRESA, M.MOMCAD_ID, I.IGRAC_ID, SUBSTR(I.DATUM_ROD,1, 10), I.DRAFT, I.TEZINA FROM VEZE_MOMCAD_IGRACI VMI, MOMCAD M, IGRACI I, POZICIJE P, DRZAVE D WHERE VMI.MOMCAD_ID = M.MOMCAD_ID AND VMI.IGRAC_ID = I.IGRAC_ID AND I.POZICIJA_ID = P.POZICIJA_ID(+) AND I.DRZAVA_ID = D.DRZAVA_ID(+) AND VMI.STATUS_ID = 1";
    if (hasImeMomcad) {
        sql += ' AND M.NAZIV = :imeMomcad';
    }
    try {
        connection = await oracledb.getConnection();
        if (status !== 0) {
            const result1 = await connection.execute(sql, {
                imeMomcad: imeMomcad,
            });
            const result2 = await connection.execute(sql1);
            const result3 = await connection.execute(sql2);
            console.log(result1.rows);
            return res.json({
                igraci: result1.rows,
                pozicije: result2.rows,
                drzave: result3.rows,
            });
        } else {
            const result1 = await connection.execute(
                sql,
                {
                    imeMomcad: imeMomcad,
                },
                { outFormat: oracledb.OBJECT }
            );
            return res.json({
                igraci: result1.rows,
            });
        }
    } catch (err) {
        console.log(err);
        res.status(503).send({ message: 'there was an error' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.log(err);
            }
        }
    }
});

//Nazivi svih igrača za odabranu momčad jedne i druge momčadi označene u komponenti /trade API
app.post('/showRosterTrade', async (req, res) => {
    let connection;

    let imeMomcad = req.body.imeMomcad;
    let hasImeMomcad = imeMomcad ? imeMomcad.trim().length > 0 : false;

    let imeMomcad1 = req.body.imeMomcad1;
    let hasImeMomcad1 = imeMomcad1 ? imeMomcad1.trim().length > 0 : false;

    let sql2 =
        'SELECT I.NAZIV FROM VEZE_MOMCAD_IGRACI VMI, IGRACI I, MOMCAD M WHERE VMI.MOMCAD_ID = M.MOMCAD_ID AND VMI.IGRAC_ID = I.IGRAC_ID AND VMI.STATUS_ID = 1';
    let sql =
        'SELECT I.NAZIV FROM VEZE_MOMCAD_IGRACI VMI, MOMCAD M, IGRACI I WHERE VMI.MOMCAD_ID = M.MOMCAD_ID AND VMI.IGRAC_ID = I.IGRAC_ID AND VMI.STATUS_ID = 1';

    try {
        connection = await oracledb.getConnection();
        if (hasImeMomcad && hasImeMomcad1) {
            sql += ' AND M.NAZIV = :imeMomcad';
            const result1 = await connection.execute(sql, {
                imeMomcad: imeMomcad,
            });

            sql2 += ' AND M.NAZIV = :imeMomcad1';
            let result2 = await connection.execute(sql2, {
                imeMomcad1: imeMomcad1,
            });

            res.json({
                igraci_1: result1.rows,
                igraci_2: result2.rows,
            });
        } else if (hasImeMomcad) {
            sql += ' AND M.NAZIV = :imeMomcad';

            const result = await connection.execute(sql, {
                imeMomcad: imeMomcad,
            });
            res.json({ igraci_1: result.rows });
        } else if (hasImeMomcad1) {
            sql2 += ' AND M.NAZIV = :imeMomcad1';
            let result2 = await connection.execute(sql2, {
                imeMomcad1: imeMomcad1,
            });

            res.json({
                igraci_2: result2.rows,
            });
        }
    } catch (err) {
        console.log(err);
        res.status(503).send({ message: 'there was an error' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.log(err);
            }
        }
    }
});

//Unos trade-a u bazu podataka API
app.post('/insertTrade', async (req, res) => {
    let connection;
    let params = [];

    let momcad1 = req.body.momcad1;
    let hasMomcad1 = momcad1.trim().length > 0;

    let momcad2 = req.body.momcad2;
    let hasMomcad2 = momcad2.trim().length > 0;

    let igrac1 = req.body.igrac1 != 'Odaberi igraca' ? req.body.igrac1 : '';
    let hasIgrac1 = igrac1.trim().length > 0;

    let igrac2 = req.body.igrac2 != 'Odaberi igraca' ? req.body.igrac2 : '';
    let hasIgrac2 = igrac2.trim().length > 0;

    let dDatum_Igrac = req.body.datum_igrac.trim();
    let hasDatum_Igrac = dDatum_Igrac.trim().length > 0;

    let unesenDatum_1 =
        "UPDATE VEZE_MOMCAD_IGRACI SET DATUM_DO = TO_DATE(:dDatum_Igrac,'YYYY-MM-DD') WHERE IGRAC_ID = :nIgrac1_id AND STATUS_ID = 1";
    let neUnesenDatum_1 =
        'UPDATE VEZE_MOMCAD_IGRACI SET DATUM_DO = sysdate WHERE IGRAC_ID = :nIgrac1_id AND STATUS_ID = 1';
    let ugasiStatus_1 =
        'UPDATE VEZE_MOMCAD_IGRACI SET STATUS_ID = 0 WHERE IGRAC_ID = :nIgrac1_id AND STATUS_ID = 1';

    let unesenDatum_2 =
        "UPDATE VEZE_MOMCAD_IGRACI SET DATUM_DO = TO_DATE(:dDatum_Igrac,'YYYY-MM-DD')  WHERE IGRAC_ID = :nIgrac2_id AND STATUS_ID = 1";
    let neUnesenDatum_2 =
        'UPDATE VEZE_MOMCAD_IGRACI SET DATUM_DO = sysdate WHERE IGRAC_ID = :nIgrac2_id AND STATUS_ID = 1';
    let ugasiStatus_2 =
        'UPDATE VEZE_MOMCAD_IGRACI SET STATUS_ID = 0 WHERE IGRAC_ID = :nIgrac2_id AND STATUS_ID = 1';

    let insertJedan_datum =
        "INSERT INTO VEZE_MOMCAD_IGRACI (MOMCAD_ID, IGRAC_ID, DATUM_OD, STATUS_ID) VALUES (:nMomcad2_id, :nIgrac1_id, TO_DATE(:dDatum_Igrac,'YYYY-MM-DD'), 1)";
    let insertDva_datum =
        "INSERT INTO VEZE_MOMCAD_IGRACI (MOMCAD_ID, IGRAC_ID, DATUM_OD, STATUS_ID) VALUES (:nMomcad1_id, :nIgrac2_id, TO_DATE(:dDatum_Igrac,'YYYY-MM-DD'), 1)";
    let insertJedan =
        'INSERT INTO VEZE_MOMCAD_IGRACI (MOMCAD_ID, IGRAC_ID, DATUM_OD, STATUS_ID) VALUES (:nMomcad2_id, :nIgrac1_id, sysdate, 1)';
    let insertDva =
        'INSERT INTO VEZE_MOMCAD_IGRACI (MOMCAD_ID, IGRAC_ID, DATUM_OD, STATUS_ID) VALUES (:nMomcad1_id, :nIgrac2_id, sysdate, 1)';

    let sql = '';
    let nMomcad1_id;
    let nMomcad2_id;
    let nIgrac1_id;
    let nIgrac2_id;

    try {
        connection = await oracledb.getConnection();
        if (hasMomcad1 && hasMomcad2 && hasIgrac1) {
            let sql1 =
                'SELECT M1.MOMCAD_ID AS MOMCAD1, M2.MOMCAD_ID AS MOMCAD2 FROM  MOMCAD M1, MOMCAD M2 WHERE M1.NAZIV = :momcad1 AND M2.NAZIV = :momcad2';
            const result = await connection.execute(
                sql1,
                {
                    momcad1: momcad1,
                    momcad2: momcad2,
                },
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT,
                }
            );
            nMomcad1_id = result.rows[0].MOMCAD1;
            nMomcad2_id = result.rows[0].MOMCAD2;

            let sql2 =
                'SELECT I.IGRAC_ID FROM  IGRACI I WHERE I.NAZIV = :igrac1';
            const result1 = await connection.execute(
                sql2,
                {
                    igrac1,
                },
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT,
                }
            );
            nIgrac1_id = result1.rows[0].IGRAC_ID;

            if (hasDatum_Igrac) {
                await connection.execute(unesenDatum_1, {
                    dDatum_Igrac,
                    nIgrac1_id,
                });
                await connection.execute(ugasiStatus_1, { nIgrac1_id });
                await connection.execute(insertJedan_datum, {
                    nMomcad2_id,
                    nIgrac1_id,
                    dDatum_Igrac,
                });
            } else {
                await connection.execute(neUnesenDatum_1, { nIgrac1_id });
                await connection.execute(ugasiStatus_1, { nIgrac1_id });
                await connection.execute(insertJedan, {
                    nMomcad2_id,
                    nIgrac1_id,
                });
            }

            if (hasIgrac2) {
                let sql3 =
                    'SELECT I.IGRAC_ID FROM IGRACI I WHERE I.NAZIV = :igrac2';
                const result = await connection.execute(
                    sql3,
                    { igrac2 },
                    { outFormat: oracledb.OUT_FORMAT_OBJECT }
                );
                nIgrac2_id = result.rows[0].IGRAC_ID;
                if (hasDatum_Igrac) {
                    await connection.execute(unesenDatum_2, {
                        dDatum_Igrac,
                        nIgrac2_id,
                    });
                    await connection.execute(ugasiStatus_2, { nIgrac2_id });
                    await connection.execute(insertDva_datum, {
                        nMomcad1_id,
                        nIgrac2_id,
                        dDatum_Igrac,
                    });
                } else {
                    await connection.execute(neUnesenDatum_2, { nIgrac2_id });
                    await connection.execute(ugasiStatus_2, { nIgrac2_id });
                    await connection.execute(insertDva, {
                        nMomcad1_id,
                        nIgrac2_id,
                    });
                }
            }

            await connection.execute('COMMIT');

            console.log('All commands executed successfully.');
            res.send({ message: 'Uspješna transakcija' });
        }
    } catch (err) {
        console.log(err);
        res.status(503).send({ message: 'there was an error' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.log(err);
            }
        }
    }
});

//Unos promjena za igrače određene momčadi API
app.post('/promjeneMomcad', async (req, res) => {
    let connection;
    let promjeneAPI = req.body;
    let message = 'Successfuly updated info!';

    if (!Array.isArray(promjeneAPI) || promjeneAPI.length < 1) {
        return res.send({ message: 'No updates entered!' });
    }
    try {
        connection = await oracledb.getConnection();

        for (let i = 0; i < promjeneAPI.length; i++) {
            if (promjeneAPI[i]) {
                console.log('Promjene za : ', promjeneAPI[i].ime);
                let ime = promjeneAPI[i].ime.trim();

                for (let j = 0; j < 5; j++) {
                    console.log('Promjena', j, ':', promjeneAPI[i].promjene[j]);
                    let params = [];
                    let sql = '';

                    if (promjeneAPI[i].promjene[j]) {
                        let podatak;
                        if (j == 0) {
                            podatak = promjeneAPI[i].promjene[j];
                            if (!(podatak === undefined)) {
                                console.log(podatak);
                                sql +=
                                    'UPDATE IGRACI SET NAZIV = :podatak WHERE IGRACI.NAZIV = :ime';
                                params.push(podatak, ime);
                            }
                        }
                        if (j == 1) {
                            podatak = promjeneAPI[i].promjene[j];
                            if (!(podatak === undefined)) {
                                sql +=
                                    'UPDATE IGRACI SET VISINA = :podatak WHERE IGRACI.NAZIV = :ime';
                                params.push(podatak, ime);
                            }
                        }
                        if (j == 2) {
                            let podatak1 = promjeneAPI[i].promjene[j];
                            if (!(podatak1 === undefined)) {
                                sql +=
                                    'SELECT D.DRZAVA_ID FROM DRZAVE D WHERE D.NAZIV = :podatak1';
                                const result = await connection.execute(
                                    sql,
                                    {
                                        podatak1,
                                    },
                                    {
                                        outFormat: oracledb.OUT_FORMAT_OBJECT,
                                    }
                                );
                                sql = '';
                                podatak = result.rows[0].DRZAVA_ID;
                                sql +=
                                    'UPDATE IGRACI SET DRZAVA_ID = :podatak WHERE IGRACI.NAZIV = :ime';
                                params.push(podatak, ime);
                            }
                        }
                        if (j == 3) {
                            let podatak1 = promjeneAPI[i].promjene[j];
                            if (!(podatak1 === undefined)) {
                                console.log(podatak1);
                                sql +=
                                    'SELECT P.POZICIJA_ID FROM POZICIJE P WHERE P.NAZIV = :podatak1';
                                const result = await connection.execute(
                                    sql,
                                    {
                                        podatak1,
                                    },
                                    {
                                        outFormat: oracledb.OUT_FORMAT_OBJECT,
                                    }
                                );
                                sql = '';
                                podatak = result.rows[0].POZICIJA_ID;
                                sql +=
                                    'UPDATE IGRACI SET POZICIJA_ID = :podatak WHERE IGRACI.NAZIV = :ime';
                                params.push(podatak, ime);
                            }
                        }
                        if (j == 4) {
                            let podatak = promjeneAPI[i].promjene[j];
                            sql +=
                                'SELECT I.IGRAC_ID FROM IGRACI I WHERE I.NAZIV = :ime';
                            const result = await connection.execute(
                                sql,
                                { ime: ime },
                                {
                                    outFormat: oracledb.OUT_FORMAT_OBJECT,
                                }
                            );
                            sql = '';
                            let nIgrac = result.rows[0].IGRAC_ID;
                            sql +=
                                "UPDATE VEZE_MOMCAD_IGRACI SET DATUM_OD = TO_DATE(:podatak, 'MM/DD/YYYY') WHERE IGRAC_ID = :nIgrac AND STATUS_ID = 1";
                            params.push(podatak, nIgrac);
                        }
                        const result = await connection.execute(sql, params, {
                            autoCommit: true,
                        });
                    }
                }
            }
        }
        return res.send({
            message: message,
        });
    } catch (err) {
        console.log(err);
        return res.send({ message: err });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.log(err);
            }
        }
    }
});

//Unos igrača i spoj na određenu momčad API
app.post('/unosIgrac', async (req, res) => {
    let connection;
    let params = [];
    let message = 'Successfuly added a player! Edit team to update info!';

    let imeIgrac = req.body.imeIgrac.trim();
    let hasImeIgrac = imeIgrac ? imeIgrac.trim().length > 0 : false;

    if (!hasImeIgrac) {
        console.log('Pogreška s imenom igrača');
        return res.send({ message: 'Unesite obavezno polje: Ime igrača' });
    }

    let imeMomcad = req.body.imeMomcad.trim();

    let visina = req.body.visina.trim();
    let hasVisina = visina ? visina.trim().length > 0 : false;

    let drzava = req.body.drzava.trim();
    let hasDrzava = drzava ? drzava.trim().length > 0 : false;

    let pozicija = req.body.pozicija.trim();
    let hasPozicija = pozicija ? pozicija.trim().length > 0 : false;

    let datum_od = req.body.datum_od.trim();
    console.log('datum_od: ', datum_od);
    let hasDatum = datum_od ? datum_od.trim().length > 0 : false;

    try {
        connection = await oracledb.getConnection();

        let sql_pronadi =
            'SELECT COUNT(I.NAZIV) BROJ FROM IGRACI I WHERE I.NAZIV = :imeIgrac';
        const result_pronadi = await connection.execute(
            sql_pronadi,
            {
                imeIgrac: imeIgrac,
            },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT,
            }
        );
        if (result_pronadi.rows[0].BROJ > 0) {
            console.log('Igrač već postoji');
            return res.status(503).send({
                message:
                    "Found a player with the same name. Please enter a player that doesn't exist or make a trade for this player!",
            });
        }
        let sql = 'INSERT INTO IGRACI(NAZIV) VALUES(:imeIgrac)';
        const result = await connection.execute(
            sql,
            { imeIgrac: imeIgrac },
            {
                autoCommit: true,
            }
        );

        if (result.rowsAffected !== 1) {
            console.log('Neuspješno kreiranje igrača');
            res.status(503).send({
                message: 'Failed to create player!',
            });
        }

        let sql_igracID =
            'SELECT I.IGRAC_ID FROM IGRACI I WHERE I.NAZIV = :imeIgrac';
        const result_igrac = await connection.execute(
            sql_igracID,
            {
                imeIgrac: imeIgrac,
            },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT,
            }
        );
        let nIgrac_id = result_igrac.rows[0].IGRAC_ID;

        let sql_momcadID =
            'SELECT M.MOMCAD_ID FROM MOMCAD M WHERE M.NAZIV = :imeMomcad';
        const result_momcad = await connection.execute(
            sql_momcadID,
            {
                imeMomcad: imeMomcad,
            },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT,
            }
        );
        let momcad_id = result_momcad.rows[0].MOMCAD_ID;

        if (hasVisina) {
            let sql_update =
                'UPDATE IGRACI SET VISINA = :visina WHERE NAZIV = :imeIgrac';
            const update = await connection.execute(
                sql_update,
                { visina: visina, imeIgrac: imeIgrac },
                {
                    autoCommit: true,
                }
            );
        } else
            message = 'Successfuly added a player! Edit team to add more info!';

        if (hasDrzava) {
            console.log(drzava);
            let sql_drzava =
                'SELECT D.DRZAVA_ID FROM DRZAVE D WHERE D.NAZIV = :drzava';
            const result_drzava = await connection.execute(
                sql_drzava,
                {
                    drzava: drzava,
                },
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT,
                }
            );
            console.log(result_drzava.rows[0]);
            let drzava_id = result_drzava.rows[0].DRZAVA_ID;

            let sql_update_drzava =
                'UPDATE IGRACI SET DRZAVA_ID = :drzava_id WHERE NAZIV = :imeIgrac';
            const update = await connection.execute(
                sql_update_drzava,
                { drzava_id: drzava_id, imeIgrac: imeIgrac },
                {
                    autoCommit: true,
                }
            );
        } else
            message = 'Successfuly added a player! Edit team to add more info!';

        if (hasPozicija) {
            let sql_pozicija =
                'SELECT P.POZICIJA_ID FROM POZICIJE P WHERE P.NAZIV = :pozicija';
            const result_pozicija = await connection.execute(
                sql_pozicija,
                {
                    pozicija: pozicija,
                },
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT,
                }
            );
            let pozicija_id = result_pozicija.rows[0].POZICIJA_ID;

            let sql_update =
                'UPDATE IGRACI SET POZICIJA_ID = :pozicija_id WHERE NAZIV = :imeIgrac';
            const update = await connection.execute(
                sql_update,
                { pozicija_id: pozicija_id, imeIgrac: imeIgrac },
                {
                    autoCommit: true,
                }
            );
        } else
            message = 'Successfuly added a player! Edit team to add more info!';

        if (hasDatum) {
            console.log('ima datum');
            let sql_update =
                "UPDATE VEZE_MOMCAD_IGRACI SET DATUM_DO = TO_DATE(:datum_od,'YYYY-MM-DD') WHERE IGRAC_ID = :nIgrac_id AND STATUS_ID = 1";
            const update = await connection.execute(
                sql_update,
                { datum_od: datum_od, nIgrac_id: nIgrac_id },
                {
                    autoCommit: true,
                }
            );

            let sql_VMI =
                "INSERT INTO VEZE_MOMCAD_IGRACI (MOMCAD_ID, IGRAC_ID, DATUM_OD, STATUS_ID) VALUES (:momcad_id, :nIgrac_id, TO_DATE(:datum_od,'YYYY-MM-DD'), 1)";
            const insert_VMI = await connection.execute(
                sql_VMI,
                {
                    momcad_id: momcad_id,
                    nIgrac_id: nIgrac_id,
                    datum_od: datum_od,
                },
                { autoCommit: true }
            );
        } else {
            let sql_update =
                'UPDATE VEZE_MOMCAD_IGRACI SET DATUM_DO = sysdate WHERE IGRAC_ID = :nIgrac_id AND STATUS_ID = 1';
            const update = await connection.execute(
                sql_update,
                { nIgrac_id: nIgrac_id },
                {
                    autoCommit: true,
                }
            );

            let sql_VMI =
                'INSERT INTO VEZE_MOMCAD_IGRACI (MOMCAD_ID, IGRAC_ID, DATUM_OD, STATUS_ID) VALUES (:momcad_id, :nIgrac_id, sysdate, 1)';
            const insert_VMI = await connection.execute(
                sql_VMI,
                {
                    momcad_id: momcad_id,
                    nIgrac_id: nIgrac_id,
                },
                { autoCommit: true }
            );
        }

        res.send({ message: message });
    } catch (err) {
        console.error(err);
        res.status(503).send({ message: 'there was an error' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

app.post('/izbrisiIgraca', async (req, res) => {
    let connection;
    let message = 'Successfuly deleted player: ';

    let imeIgrac = req.body.imeIgrac.trim();
    let hasImeIgrac = imeIgrac ? imeIgrac.trim().length > 0 : false;

    if (!hasImeIgrac) {
        console.log('Pogreška s imenom igrača');
        return res.send({ message: 'Pogreška pri brisanju' });
    }

    let nIgrac_id;

    try {
        connection = await oracledb.getConnection();
        let sql_igracID =
            'SELECT I.IGRAC_ID FROM IGRACI I WHERE I.NAZIV = :imeIgrac';
        const result = await connection.execute(
            sql_igracID,
            { imeIgrac: imeIgrac },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        nIgrac_id = result.rows[0].IGRAC_ID;

        if (!nIgrac_id) {
            console.log('Pogreška s traženjem ID-a igrača');
            return res.send({ message: 'Pogreška pri brisanju' });
        }

        let sql_VMI =
            'DELETE FROM VEZE_MOMCAD_IGRACI WHERE STATUS_ID = 1 AND IGRAC_ID = :nIgrac_id';
        const delete_vmi = await connection.execute(
            sql_VMI,
            { nIgrac_id: nIgrac_id },
            { autoCommit: true }
        );
        if (delete_vmi.rowsAffected !== 1) {
            console.log('Pogreška s brisanjem retka iz tablice VMI');
            return res.send({ message: 'Pogreška pri brisanju' });
        }

        let sql_IGRACI = 'DELETE FROM IGRACI WHERE IGRAC_ID = :nIgrac_id';
        const delete_igraci = await connection.execute(
            sql_IGRACI,
            { nIgrac_id: nIgrac_id },
            { autoCommit: true }
        );
        if (delete_igraci.rowsAffected !== 1) {
            console.log('Pogreška s brisanjem retka iz tablice IGRACI');
            return res.send({ message: 'Pogreška pri brisanju' });
        }
        res.send({ message: message + imeIgrac });
    } catch (err) {
        console.error(err);
        res.status(503).send({ message: 'there was an error' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

app.post('/getStatistikaIgraci', async (req, res) => {
    let connection;

    const imeIgrac = req.body.imeIgrac ? req.body.imeIgrac : null;

    try {
        connection = await oracledb.getConnection();
        let sql_SELECT = `SELECT Igrac, IgracMomcadKratica, IgracMomcad, Domaci, Gosti,  TO_CHAR(DATUM_VRIJEME , 'MM/DD/YYYY') AS DATUM_UTAKMICE ,NBA.RACUNAJ_MINUTE(igrac_id, utakmica_id) as Minute,  "Slobodna Bacanja Pogodena" + "Šut za 2 Pogoden"*2 + "Šut za 3 Pogoden"*3 as Poeni, "Šut za 3 Pogoden" + "Šut za 2 Pogoden" as Pogodci_iz_Polja, "Šut za 3 Pogoden" + "Šut za 3 Promasen" + "Šut za 2 Promasen" + "Šut za 2 Pogoden"  as Pokusaji_iz_Polja, null  as PP ,"Šut za 3 Pogoden" as Sut_za_3_pogoden, "Šut za 3 Promasen" as Sut_za_3_promasen ,null  as TRI_P, "Slobodna Bacanja Pogodena" AS Slobodna_Bacanja_pogodena, "Slobodna Bacanja Promasena" as Slobodna_bacanja_promasena, NULL AS SB,"Napadacki Skok" as Napadacki_skok,"Obrambeni Skok" as Obrambeni_skok,  "Obrambeni Skok" + "Napadacki Skok" as Skokovi,"Asistencije" as Asistencije, "Ukradene Lopte" as Ukradene_lopte,"Blokovi" as Blokovi, Sezona, DOMACI_IME, GOSTI_IME `;

        let sql_FROM = ` FROM (select utk.utakmica_id as Utakmica_id, m.NAZIV AS IgracMomcad, m.kratica AS IgracMomcadKratica, m1.kratica AS Domaci, m1.naziv as DOMACI_IME, m2.kratica AS Gosti , m2.NAZIV AS GOSTI_IME, i.igrac_id AS Igrac_id, i.naziv AS Igrac, sp.naziv || '_' ||s.naziv AS Podatak, s.naziv AS Status, UTK.DATUM_VRIJEME, l.sezona as Sezona FROM statistika stat,igraci i,utakmice utk,stat_podatak sp, momcad m, momcad m1,momcad m2,statusi s, lige l, veze_momcad_igraci vmi where vmi.IGRAC_ID = i.IGRAC_ID AND VMI.STATUS_ID = 1 AND VMI.MOMCAD_ID = M.MOMCAD_ID AND STAT.IGRAC_ID = i.igrac_id and stat.sp_id = sp.sp_id and STAT.STATUS_ID = s.status_id and stat.utakmica_id = utk.utakmica_id and UTK.DOMACI_ID = m1.momcad_id and utk.gosti_id = m2.momcad_id and s.tablica = 'STATISTIKA' and utk.liga_id = l.liga_id ORDER BY DATUM_VRIJEME)`;

        let sql_pivot = ` PIVOT ( COUNT(Status) FOR Podatak IN('Slobodno bacanje_Pogođen' AS "Slobodna Bacanja Pogodena",'Slobodno bacanje_Promašen' AS "Slobodna Bacanja Promasena",'Šut za 3_Pogođen' AS "Šut za 3 Pogoden", 'Šut za 3_Promašen' AS "Šut za 3 Promasen",'Šut za 2_Pogođen' AS "Šut za 2 Pogoden", 'Šut za 2_Promašen' AS "Šut za 2 Promasen",'Ulaz/Izlaz_Završen' AS "Ulaz/Izlaz",'Obrambeni skok_Završen' AS "Obrambeni Skok",'Napadački skok_Završen' AS "Napadacki Skok",'Asistencija_Završen' AS "Asistencije",'Izgubljena lopta_Završen' AS "Izgubljene Lopte",'Ukradena lopta_Završen' AS "Ukradene Lopte",'Blokada_Završen' AS "Blokovi")) ORDER BY DATUM_UTAKMICE DESC`;

        const result = await connection.execute(
            sql_SELECT + sql_FROM + sql_pivot,
            [],
            { outFormat: oracledb.OBJECT }
        );

        let karijeraUpit;

        if (imeIgrac !== null || imeIgrac == 'Svi') {
            const sql_SELECT_KARIJERA = `SELECT Igrac, count(*) as BrojUtakmica, SUM(TO_NUMBER(SUBSTR(NBA.RACUNAJ_MINUTE(igrac_id, utakmica_id), 1, 2))*60 + TO_NUMBER(SUBSTR(NBA.RACUNAJ_MINUTE(igrac_id, utakmica_id), 4, 2))) as minute, SUM("Slobodna Bacanja Pogodena" + "Šut za 2 Pogoden"*2 + "Šut za 3 Pogoden"*3)/COUNT(*) as Poeni, SUM("Šut za 3 Pogoden" + "Šut za 2 Pogoden")/COUNT(*) as Pogodci_iz_Polja, SUM("Šut za 3 Pogoden" + "Šut za 3 Promasen" + "Šut za 2 Promasen" + "Šut za 2 Pogoden")/COUNT(*)  as Pokusaji_iz_Polja, CASE WHEN SUM("Šut za 3 Pogoden" + "Šut za 3 Promasen" + "Šut za 2 Promasen" + "Šut za 2 Pogoden") = 0 THEN 0 ELSE SUM("Šut za 3 Pogoden" + "Šut za 2 Pogoden") / SUM("Šut za 3 Pogoden" + "Šut za 3 Promasen" + "Šut za 2 Promasen" + "Šut za 2 Pogoden") END as PP ,SUM("Šut za 3 Pogoden")/COUNT(*) as Sut_za_3_pogoden, SUM("Šut za 3 Promasen")/COUNT(*) as Sut_za_3_promasen ,  CASE WHEN SUM("Šut za 3 Pogoden" + "Šut za 3 Promasen") = 0 THEN 0 ELSE SUM("Šut za 3 Pogoden")/SUM("Šut za 3 Pogoden" + "Šut za 3 Promasen") END   as TRI_P, SUM("Slobodna Bacanja Pogodena")/COUNT(*) AS Slobodna_Bacanja_pogodena, SUM("Slobodna Bacanja Promasena")/COUNT(*) as Slobodna_bacanja_promasena,  CASE WHEN SUM("Slobodna Bacanja Pogodena"+"Slobodna Bacanja Promasena") = 0 THEN 0 ELSE SUM("Slobodna Bacanja Pogodena")/SUM("Slobodna Bacanja Pogodena"+"Slobodna Bacanja Promasena")  END  AS SB,SUM("Napadacki Skok")/COUNT(*) as Napadacki_skok,SUM("Obrambeni Skok")/COUNT(*) as Obrambeni_skok,  SUM("Obrambeni Skok" + "Napadacki Skok")/COUNT(*) as Skokovi, SUM("Asistencije")/COUNT(*) as Asistencije, SUM("Ukradene Lopte")/COUNT(*) as Ukradene_lopte,SUM("Blokovi")/COUNT(*) as Blokovi, IgracMomcad, IgracMomcadKratica, Sezona, plasman`;

            let sql_FROM_KARIJERA = ` FROM (select utk.utakmica_id as Utakmica_id, vml.konacni_plasman as plasman, m.NAZIV AS IgracMomcad, m.kratica AS IgracMomcadKratica, m1.kratica AS Domaci, m1.naziv as DOMACI_IME, m2.kratica AS Gosti , m2.NAZIV AS GOSTI_IME, i.igrac_id AS Igrac_id, i.naziv AS Igrac, sp.naziv || '_' ||s.naziv AS Podatak, s.naziv AS Status, UTK.DATUM_VRIJEME, l.sezona as Sezona FROM statistika stat,igraci i,utakmice utk,stat_podatak sp, momcad m, momcad m1,momcad m2,statusi s, lige l, veze_momcad_igraci vmi, veze_momcad_lige vml where vml.momcad_id = m.momcad_id and vml.liga_id = l.liga_id and vmi.IGRAC_ID = i.IGRAC_ID AND VMI.STATUS_ID = 1 AND VMI.MOMCAD_ID = M.MOMCAD_ID AND STAT.IGRAC_ID = i.igrac_id and stat.sp_id = sp.sp_id and STAT.STATUS_ID = s.status_id and stat.utakmica_id = utk.utakmica_id and UTK.DOMACI_ID = m1.momcad_id and utk.gosti_id = m2.momcad_id and s.tablica = 'STATISTIKA' and utk.liga_id = l.liga_id `;

            const sql_PIVOT_KARIJERA = `PIVOT ( COUNT(Status) FOR Podatak IN('Slobodno bacanje_Pogođen' AS "Slobodna Bacanja Pogodena",'Slobodno bacanje_Promašen' AS "Slobodna Bacanja Promasena",'Šut za 3_Pogođen' AS "Šut za 3 Pogoden", 'Šut za 3_Promašen' AS "Šut za 3 Promasen",'Šut za 2_Pogođen' AS "Šut za 2 Pogoden", 'Šut za 2_Promašen' AS "Šut za 2 Promasen",'Ulaz/Izlaz_Završen' AS "Ulaz/Izlaz",'Obrambeni skok_Završen' AS "Obrambeni Skok",'Napadački skok_Završen' AS "Napadacki Skok",'Asistencija_Završen' AS "Asistencije",'Izgubljena lopta_Završen' AS "Izgubljene Lopte",'Ukradena lopta_Završen' AS "Ukradene Lopte",'Blokada_Završen' AS "Blokovi")) GROUP BY IGRAC , IGRACMOMCAD,  IGRACMOMCADKRATICA, sezona, plasman ORDER BY Poeni DESC `;

            if (imeIgrac == 'Svi') {
                sql_FROM_KARIJERA += ') ';
                karijeraUpit = await connection.execute(
                    sql_SELECT_KARIJERA +
                        sql_FROM_KARIJERA +
                        sql_PIVOT_KARIJERA,
                    [],
                    { outFormat: oracledb.OBJECT }
                );
            } else {
                sql_FROM_KARIJERA += 'and i.naziv = :imeIgrac )';
                karijeraUpit = await connection.execute(
                    sql_SELECT_KARIJERA +
                        sql_FROM_KARIJERA +
                        sql_PIVOT_KARIJERA,
                    { imeIgrac: imeIgrac ? imeIgrac : null },
                    { outFormat: oracledb.OBJECT }
                );
            }
        }
        for (let i = 0; i < result.rows.length; i++) {
            if (result.rows[i].POKUSAJI_IZ_POLJA > 0) {
                if (result.rows[i].POGODCI_IZ_POLJA === '0.0') {
                    result.rows[i].SB = '0.0';
                }
                result.rows[i].PP = (
                    100 *
                    (result.rows[i].POGODCI_IZ_POLJA /
                        (result.rows[i].POGODCI_IZ_POLJA +
                            result.rows[i].POKUSAJI_IZ_POLJA))
                ).toFixed(1);
            } else result.rows[i].PP = '-';

            if (
                result.rows[i].SUT_ZA_3_POGODEN +
                    result.rows[i].SUT_ZA_3_PROMASEN >
                0
            ) {
                if (result.rows[i].SUT_ZA_3_POGODEN === 0) {
                    result.rows[i].SB = '0.0';
                }
                result.rows[i].TRI_P = (
                    100 *
                    (result.rows[i].SUT_ZA_3_POGODEN /
                        (result.rows[i].SUT_ZA_3_POGODEN +
                            result.rows[i].SUT_ZA_3_PROMASEN))
                ).toFixed(1);
            } else result.rows[i].TRI_P = '-';

            if (
                result.rows[i].SLOBODNA_BACANJA_POGODENA +
                    result.rows[i].SLOBODNA_BACANJA_PROMASENA >
                0
            ) {
                if (result.rows[i].SLOBODNA_BACANJA_POGODENA === 0) {
                    result.rows[i].SB = '0.0';
                }
                result.rows[i].SB = (
                    100 *
                    (result.rows[i].SLOBODNA_BACANJA_POGODENA /
                        (result.rows[i].SLOBODNA_BACANJA_POGODENA +
                            result.rows[i].SLOBODNA_BACANJA_PROMASENA))
                ).toFixed(1);
            } else result.rows[i].SB = '-';
        }

        const result1 = await connection.execute(
            `SELECT L.SEZONA FROM LIGE L ORDER BY SEZONA DESC`
        );

        res.send({
            igraci: result.rows,
            sezone: result1.rows,
            karijera: karijeraUpit ? karijeraUpit.rows : null,
        });
    } catch (err) {
        console.log(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.log(err);
            }
        }
    }
});

app.post('/getStatistikaMomcadi', async (req, res) => {
    let connection;

    let imeMomcad = req.body.imeMomcad;
    let hasImeMomcad = imeMomcad ? imeMomcad.trim().length > 0 : false;

    let imeMomcad1 = req.body.imeMomcad1;
    let hasImeMomcad1 = imeMomcad1 ? imeMomcad1.trim().length > 0 : false;

    let datum = req.body.datum;
    let hasDatum = datum ? datum.trim().length > 0 : false;

    let sql_SELECT =
        "SELECT m1.kratica AS DOMACI, UTK.POENI_DOMACI as POENI_DOMACI, M2.kratica AS GOSTI, SUD.NAZIV AS SUDAC, L.SEZONA, TO_CHAR(DATUM_VRIJEME , 'MM/DD/YYYY') AS DATUM_UTAKMICE, null as W_L, m1.naziv AS DOMACI_NAZIV, m2.naziv AS GOSTI_NAZIV,  UTK.POENI_GOSTI AS POENI_GOSTI, STATUS_ID, UTK.UTAKMICA_ID AS UTAKMICA_ID";
    let sql_FROM =
        ' FROM MOMCAD m1, MOMCAD m2, UTAKMICE utk, SUDCI sud, LIGE l';
    let sql_WHERE =
        ' where m1.momcad_id = UTK.DOMACI_ID and m2.momcad_id = UTK.GOSTI_ID and utk.sudac_id = sud.sudac_id and utk.liga_id = l.liga_id and (m1.naziv = :imeMomcad OR m2.naziv = :imeMomcad)';
    try {
        connection = await oracledb.getConnection();
        if (hasImeMomcad && hasImeMomcad1 && hasDatum) {
            sql_WHERE =
                " where m1.momcad_id = UTK.DOMACI_ID and m2.momcad_id = UTK.GOSTI_ID and utk.sudac_id = sud.sudac_id and utk.liga_id = l.liga_id and m1.naziv = :imeMomcad AND m2.naziv = :imeMomcad1 AND DATUM_VRIJEME = TO_DATE(:datum, 'YYYY-MM-DD HH24:MI:SS')";
            const result = await connection.execute(
                sql_SELECT + sql_FROM + sql_WHERE,
                { imeMomcad: imeMomcad, imeMomcad1: imeMomcad1, datum: datum },
                { outFormat: oracledb.OBJECT }
            );
            res.send({ utakmica: result.rows[0] });
        } else if (hasImeMomcad) {
            const result = await connection.execute(
                sql_SELECT + sql_FROM + sql_WHERE,
                { imeMomcad: imeMomcad, imeMomcad: imeMomcad },
                { outFormat: oracledb.OBJECT }
            );
            for (let i = 0; i < result.rows.length; i++) {
                if (
                    result.rows[i].DOMACI_NAZIV === imeMomcad &&
                    result.rows[i].POENI_DOMACI > result.rows[i].POENI_GOSTI
                ) {
                    result.rows[i].W_L = 'W';
                }
                if (
                    result.rows[i].DOMACI_NAZIV === imeMomcad &&
                    result.rows[i].POENI_DOMACI < result.rows[i].POENI_GOSTI
                ) {
                    result.rows[i].W_L = 'L';
                }
                if (
                    result.rows[i].GOSTI_NAZIV === imeMomcad &&
                    result.rows[i].POENI_DOMACI > result.rows[i].POENI_GOSTI
                ) {
                    result.rows[i].W_L = 'L';
                }
                if (
                    result.rows[i].GOSTI_NAZIV === imeMomcad &&
                    result.rows[i].POENI_DOMACI < result.rows[i].POENI_GOSTI
                ) {
                    result.rows[i].W_L = 'W';
                }
                if (
                    result.rows[i].POENI_DOMACI ===
                        result.rows[i].POENI_GOSTI &&
                    result.rows[i].POENI_DOMACI !== null
                ) {
                    result.rows[i].W_L = 'D';
                }
                if (result.rows[i].STATUS_ID === 0) {
                    result.rows[i].W_L = 'U TIJEKU';
                }
            }
            const result1 = await connection.execute(
                `SELECT L.SEZONA FROM LIGE L ORDER BY SEZONA DESC`
            );
            res.send({ utakmice: result.rows, sezone: result1.rows });
        } else {
            sql_WHERE =
                ' where m1.momcad_id = UTK.DOMACI_ID and m2.momcad_id = UTK.GOSTI_ID and utk.sudac_id = sud.sudac_id and utk.liga_id = l.liga_id ORDER BY DATUM_UTAKMICE DESC';
            const result = await connection.execute(
                sql_SELECT + sql_FROM + sql_WHERE,
                [],
                { outFormat: oracledb.OBJECT }
            );

            res.send({ utakmice: result.rows });
        }
    } catch (err) {
        console.log(err);
    } finally {
        try {
            if (connection) {
                await connection.close();
            }
        } catch (err) {
            console.log(err);
        }
    }
});

app.post('/kreirajUtakmicu', async (req, res) => {
    let connection;

    let domaci = req.body.domaci;
    let hasDomaci = domaci ? domaci.trim().length > 0 : false;

    let gosti = req.body.gosti;
    let hasGosti = gosti ? gosti.trim().length > 0 : false;

    if (domaci === gosti) {
        return res.send({
            message: 'Domaćin i gosti trebaju biti različite ekipe!',
        });
    }
    let datum = req.body.datum;
    let hasDatum = datum ? datum.trim().length > 0 : false;

    let sezona = req.body.sezona;
    let hasSezona = sezona ? sezona.trim().length > 0 : false;

    let sudac = req.body.sudac;
    let hasSudac = sudac ? sudac.trim().length > 0 : false;
    try {
        connection = await oracledb.getConnection();
        let sql_INSERT =
            "INSERT INTO UTAKMICE (DOMACI_ID, POENI_DOMACI, GOSTI_ID, POENI_GOSTI, SUDAC_ID, STATUS_ID, DATUM_VRIJEME, LIGA_ID) VALUES (:domaci_id, 0, :gosti_id, 0, :sudac_id, 0, TO_DATE(:datum, 'YYYY-MM-DD HH24:MI:SS'), :liga_id)";
        if (hasDomaci && hasGosti && hasDatum && hasSezona && hasSudac) {
            const res1 = await connection.execute(
                'SELECT M.MOMCAD_ID FROM MOMCAD M WHERE M.NAZIV = :domaci',
                {
                    domaci: domaci,
                },
                { outFormat: oracledb.OBJECT }
            );
            let domaci_id = res1.rows[0].MOMCAD_ID;

            const res2 = await connection.execute(
                'SELECT M.MOMCAD_ID FROM MOMCAD M WHERE M.NAZIV = :gosti',
                {
                    gosti: gosti,
                },
                { outFormat: oracledb.OBJECT }
            );
            let gosti_id = res2.rows[0].MOMCAD_ID;

            const res3 = await connection.execute(
                'SELECT L.LIGA_ID FROM LIGE L WHERE L.SEZONA = :sezona',
                {
                    sezona: sezona,
                },
                { outFormat: oracledb.OBJECT }
            );
            let liga_id = res3.rows[0].LIGA_ID;

            const res4 = await connection.execute(
                'SELECT S.SUDAC_ID FROM SUDCI S WHERE S.NAZIV = :sudac',
                {
                    sudac: sudac,
                },
                { outFormat: oracledb.OBJECT }
            );
            let sudac_id = res4.rows[0].SUDAC_ID;

            const check = await connection.execute(
                "SELECT U.UTAKMICA_ID AS UTAKMICA_ID FROM UTAKMICE U WHERE U.DOMACI_ID = :domaci_id AND U.GOSTI_ID = :gosti_id AND DATUM_VRIJEME = TO_DATE(:datum, 'YYYY-MM-DD HH24:MI:SS')",
                {
                    domaci_id: domaci_id,
                    gosti_id: gosti_id,
                    datum: datum,
                },
                {
                    outFormat: oracledb.OBJECT,
                }
            );
            if (check.rows[0] !== undefined)
                return res.send({
                    message:
                        'Utakmica već postoji! Unesite novu utakmicu ili izađite na početak da bi ste označili ovu!',
                });
            const result = await connection.execute(
                sql_INSERT,
                {
                    domaci_id: domaci_id,
                    gosti_id: gosti_id,
                    sudac_id: sudac_id,
                    datum: datum,
                    liga_id: liga_id,
                },
                {
                    autoCommit: true,
                }
            );

            const res5 = await connection.execute(
                "SELECT U.UTAKMICA_ID FROM UTAKMICE U WHERE U.DOMACI_ID = :domaci_id AND U.GOSTI_ID = :gosti_id AND DATUM_VRIJEME = TO_DATE(:datum, 'YYYY-MM-DD HH24:MI:SS')",
                {
                    domaci_id: domaci_id,
                    gosti_id: gosti_id,
                    datum: datum,
                },
                { outFormat: oracledb.OBJECT }
            );
            let utakmica_id = res5.rows[0].UTAKMICA_ID;
            if (result.rowsAffected === 1)
                res.send({
                    message: 'Insert was completed successfully!',
                    utakmica_id: utakmica_id,
                });
        }
    } catch (err) {
        console.log(err);
    } finally {
        try {
            if (connection) {
                await connection.close();
            }
        } catch (err) {
            console.log(err);
        }
    }
});

app.post('/prikaziStatistikuUtakmice', async (req, res) => {
    let connection;

    const sql_SELECT =
        'SELECT I.NAZIV, SP.NAZIV, STAT.VRIJEME_POCETAK as VRIJEME, S.NAZIV, STAT.UTAKMICA_ID AS UTAKMICA_ID, STAT.STAT_ID ';
    const sql_FROM =
        'FROM STATISTIKA STAT, STAT_PODATAK SP, IGRACI I,  STATUSI S ';
    const sql_WHERE =
        "WHERE STAT.IGRAC_ID = I.IGRAC_ID AND STAT.SP_ID = SP.SP_ID AND SP.SP_ID != 11 AND STAT.STATUS_ID = S.STATUS_ID AND S.TABLICA = 'STATISTIKA' AND STAT.UTAKMICA_ID = :utakmica_id ";

    const sql_SELECT_ulaz =
        "SELECT I.NAZIV, 'Ulaz' as NAZIV, STAT.VRIJEME_POCETAK as VRIJEME, S.NAZIV, STAT.UTAKMICA_ID AS UTAKMICA_ID, STAT.STAT_ID ";
    const sql_FROM_ulaz =
        'FROM STATISTIKA STAT, STAT_PODATAK SP, IGRACI I,  STATUSI S ';
    const sql_WHERE_ulaz =
        "WHERE STAT.IGRAC_ID = I.IGRAC_ID AND STAT.SP_ID = SP.SP_ID AND SP.SP_ID = 11 AND STAT.STATUS_ID = S.STATUS_ID AND S.TABLICA = 'STATISTIKA' AND STAT.UTAKMICA_ID = :utakmica_id ";

    const sql_SELECT_izlaz =
        "SELECT I.NAZIV, 'Izlaz' as NAZIV, STAT.VRIJEME_KRAJ as VRIJEME, S.NAZIV, STAT.UTAKMICA_ID AS UTAKMICA_ID, STAT.STAT_ID ";
    const sql_FROM_izlaz =
        'FROM STATISTIKA STAT, STAT_PODATAK SP, IGRACI I,  STATUSI S ';
    const sql_WHERE_ORDER_izlaz =
        "WHERE STAT.IGRAC_ID = I.IGRAC_ID AND STAT.SP_ID = SP.SP_ID AND SP.SP_ID = 11 AND STAT.STATUS_ID = S.STATUS_ID AND S.TABLICA = 'STATISTIKA' AND STAT.UTAKMICA_ID = :utakmica_id AND STAT.VRIJEME_KRAJ IS NOT NULL ORDER BY VRIJEME DESC";
    const utakmica_id = req.body.utakmica_id;

    const domaci_naziv = req.body.domaci_naziv;

    const gosti_naziv = req.body.gosti_naziv;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            sql_SELECT +
                sql_FROM +
                sql_WHERE +
                ' UNION ' +
                sql_SELECT_ulaz +
                sql_FROM_ulaz +
                sql_WHERE_ulaz +
                ' UNION ' +
                sql_SELECT_izlaz +
                sql_FROM_izlaz +
                sql_WHERE_ORDER_izlaz,
            { utakmica_id: utakmica_id }
        );

        const pronadiDomaci = await connection.execute(
            'SELECT M.MOMCAD_ID FROM MOMCAD M WHERE M.NAZIV = :domaci_naziv',
            { domaci_naziv: domaci_naziv },
            { outFormat: oracledb.OBJECT }
        );

        const domaci_id = pronadiDomaci.rows[0].MOMCAD_ID;

        const pronadiGosti = await connection.execute(
            'SELECT M.MOMCAD_ID FROM MOMCAD M WHERE M.NAZIV = :gosti_naziv',
            { gosti_naziv: gosti_naziv },
            { outFormat: oracledb.OBJECT }
        );

        const gosti_id = pronadiGosti.rows[0].MOMCAD_ID;

        const aktivni_domaci = await connection.execute(
            'SELECT I.NAZIV, I.BROJ_DRESA, VMI.MOMCAD_ID, I.IGRAC_ID FROM STATISTIKA STAT, IGRACI I, VEZE_MOMCAD_IGRACI VMI WHERE STAT.STATUS_ID = 2 AND STAT.IGRAC_ID = I.IGRAC_ID AND UTAKMICA_ID = :utakmica_id AND VMI.IGRAC_ID = I.IGRAC_ID AND VMI.MOMCAD_ID = :domaci_id AND VMI.STATUS_ID = 1',
            { utakmica_id: utakmica_id, domaci_id: domaci_id },
            { outFormat: oracledb.OBJECT }
        );

        const aktivni_gosti = await connection.execute(
            'SELECT I.NAZIV, I.BROJ_DRESA, VMI.MOMCAD_ID, I.IGRAC_ID FROM STATISTIKA STAT, IGRACI I, VEZE_MOMCAD_IGRACI VMI WHERE STAT.STATUS_ID = 2 AND STAT.IGRAC_ID = I.IGRAC_ID AND UTAKMICA_ID = :utakmica_id AND VMI.IGRAC_ID = I.IGRAC_ID AND VMI.MOMCAD_ID = :gosti_id AND VMI.STATUS_ID = 1',
            { utakmica_id: utakmica_id, gosti_id: gosti_id },
            { outFormat: oracledb.OBJECT }
        );

        let message = '';
        if (aktivni_domaci.rows[0] !== undefined) {
            message = 'Utakmica gotova';
        }
        res.send({
            statistika: result.rows,
            aktivni_domaci: aktivni_domaci.rows ? aktivni_domaci.rows : [],
            aktivni_gosti: aktivni_gosti.rows ? aktivni_gosti.rows : [],
            message: message,
        });
    } catch (err) {
        console.log(err);
    } finally {
        try {
            if (connection) {
                await connection.close();
            }
        } catch (err) {
            console.log(err);
        }
    }
});

app.post('/unesiStatistiku', async (req, res) => {
    let connection;

    const utakmica_id = req.body.utakmica_id;

    const setStarteri = req.body.setStarteri ? req.body.setStarteri : false;

    const domaci_naziv = req.body.domaci_naziv || '';

    const gosti_naziv = req.body.gosti_naziv || '';

    const aktivni_domaci = req.body.aktivni_domaci || [];

    const aktivni_gosti = req.body.aktivni_gosti || [];

    const igracID = req.body.igrac_id ? req.body.igrac_id.IGRAC_ID : null;

    const momcadID = req.body.igrac_id ? req.body.igrac_id.MOMCAD_ID : null;

    const igracUlazID = req.body.igrac_ulaz_id
        ? req.body.igrac_ulaz_id.IGRAC_ID
        : null;

    const status = req.body.status;
    const podatak = req.body.podatak;

    const minute = req.body.minute;
    const sekunde = req.body.sekunde;

    const uzivo = req.body.uzivo ? req.body.uzivo : null;
    let podatakID;
    let statusID;

    try {
        connection = await oracledb.getConnection();
        const podatak_id = await connection.execute(
            'SELECT SP.SP_ID FROM STAT_PODATAK SP WHERE SP.NAZIV = :podatak',
            { podatak: podatak },
            { outFormat: oracledb.OBJECT }
        );
        podatakID = podatak_id.rows[0].SP_ID;

        const status_id = await connection.execute(
            "SELECT S.STATUS_ID FROM STATUSI S WHERE S.NAZIV = :status AND S.TABLICA = 'STATISTIKA'",
            { status: status },
            { outFormat: oracledb.OBJECT }
        );
        statusID = status_id.rows[0].STATUS_ID;

        const unosPocetnogPodatka = async (igrac) => {
            const SQL_upit =
                "INSERT INTO STATISTIKA(IGRAC_ID, SP_ID, STATUS_ID, UTAKMICA_ID, VRIJEME_POCETAK) VALUES (:igrac_id, :podatak_id, :status, :utakmica_id, '00:00')";
            try {
                const unesi = await connection.execute(
                    SQL_upit,
                    {
                        igrac_id: igrac.IGRAC_ID,
                        podatak_id: podatakID,
                        status: statusID,
                        utakmica_id: utakmica_id,
                    },
                    { autoCommit: true }
                );
            } catch (error) {
                console.error('Error inserting data:', error);
            }
        };

        if (setStarteri) {
            const domaciPromises = aktivni_domaci.map((igrac) =>
                unosPocetnogPodatka(igrac)
            );
            await Promise.all(domaciPromises);

            const gostiPromises = aktivni_gosti.map((igrac) =>
                unosPocetnogPodatka(igrac)
            );
            await Promise.all(gostiPromises);
            return res.send({ message: 'Success' });
        } else if (igracID && igracUlazID !== null) {
            const pronadiOtvoreniUlaz_SQL =
                'SELECT STAT.STAT_ID, STAT.VRIJEME_POCETAK FROM STATISTIKA STAT WHERE STAT.IGRAC_ID = :igrac_id AND STAT.SP_ID = 11 AND STAT.VRIJEME_KRAJ IS NULL AND STAT.UTAKMICA_ID = :utakmica_id';

            const pronadiOtvoreniUlaz = await connection.execute(
                pronadiOtvoreniUlaz_SQL,
                { igrac_id: igracID, utakmica_id: utakmica_id },
                {
                    outFormat: oracledb.OBJECT,
                }
            );
            const stat_id = pronadiOtvoreniUlaz.rows[0].STAT_ID;
            const vrijeme_pocetak = pronadiOtvoreniUlaz.rows[0].VRIJEME_POCETAK;

            if (vrijeme_pocetak > minute + ':' + sekunde) {
                return res.send({
                    message:
                        'Promjenite četvrtinu kako bi unijeli pravo vrijeme ulaska!',
                });
            }
            const unesiVrijemeKraj = await connection.execute(
                "UPDATE STATISTIKA SET VRIJEME_KRAJ = trim(TO_CHAR(:minute, '00')) || ':'  ||  trim(TO_CHAR(:sekunde,'00')) WHERE STAT_ID = :stat_id",
                { minute: minute, sekunde: sekunde, stat_id: stat_id },
                { autoCommit: true }
            );

            const ugasiUlaz = await connection.execute(
                'UPDATE STATISTIKA SET STATUS_ID = 3 WHERE STAT_ID = :stat_id',
                { stat_id: stat_id },
                { autoCommit: true }
            );

            const unesiNoviUlaz_SQL =
                "INSERT INTO STATISTIKA(IGRAC_ID, SP_ID, STATUS_ID, UTAKMICA_ID, VRIJEME_POCETAK) VALUES (:igrac_ulaz_id, :podatak_id, :status_id, :utakmica_id, trim(TO_CHAR(:minute, '00')) || ':'  ||  trim(TO_CHAR(:sekunde,'00')))";

            const unesiNoviUlaz = await connection.execute(
                unesiNoviUlaz_SQL,
                {
                    igrac_ulaz_id: igracUlazID,
                    podatak_id: podatakID,
                    status_id: 2,
                    utakmica_id: utakmica_id,
                    minute: minute,
                    sekunde: sekunde,
                },
                { autoCommit: true }
            );

            const pronadiDomaciID = await connection.execute(
                'SELECT M.MOMCAD_ID FROM MOMCAD M WHERE M.NAZIV = :domaci_naziv',
                { domaci_naziv: domaci_naziv },
                { outFormat: oracledb.OBJECT }
            );

            const domaci_id = pronadiDomaciID.rows[0].MOMCAD_ID;

            const pronadiGosteID = await connection.execute(
                'SELECT M.MOMCAD_ID FROM MOMCAD M WHERE M.NAZIV = :gosti_naziv',
                { gosti_naziv: gosti_naziv },
                { outFormat: oracledb.OBJECT }
            );

            const gosti_id = pronadiGosteID.rows[0].MOMCAD_ID;

            const pronadiAktivneDomace = await connection.execute(
                'SELECT I.NAZIV, I.BROJ_DRESA, VMI.MOMCAD_ID, I.IGRAC_ID FROM STATISTIKA STAT, IGRACI I, VEZE_MOMCAD_IGRACI VMI WHERE STAT.STATUS_ID = 2 AND STAT.IGRAC_ID = I.IGRAC_ID AND UTAKMICA_ID = :utakmica_id AND VMI.IGRAC_ID = I.IGRAC_ID AND VMI.MOMCAD_ID = :domaci_id AND VMI.STATUS_ID = 1',
                { utakmica_id: utakmica_id, domaci_id: domaci_id },
                { outFormat: oracledb.OBJECT }
            );

            const pronadiAktivneGoste = await connection.execute(
                'SELECT I.NAZIV, I.BROJ_DRESA, VMI.MOMCAD_ID, I.IGRAC_ID FROM STATISTIKA STAT, IGRACI I, VEZE_MOMCAD_IGRACI VMI WHERE STAT.STATUS_ID = 2 AND STAT.IGRAC_ID = I.IGRAC_ID AND UTAKMICA_ID = :utakmica_id AND VMI.IGRAC_ID = I.IGRAC_ID AND VMI.MOMCAD_ID = :gosti_id AND VMI.STATUS_ID = 1',
                { utakmica_id: utakmica_id, gosti_id: gosti_id },
                { outFormat: oracledb.OBJECT }
            );

            const pronadiNoviIzlaz_SQL =
                "SELECT I.NAZIV, 'Izlaz' as NAZIV, STAT.VRIJEME_KRAJ as VRIJEME, S.NAZIV, STAT.UTAKMICA_ID AS UTAKMICA_ID, STAT.STAT_ID FROM STATISTIKA STAT, STAT_PODATAK SP, IGRACI I,  STATUSI S WHERE STAT.IGRAC_ID = I.IGRAC_ID AND STAT.SP_ID = SP.SP_ID AND SP.SP_ID = 11 AND STAT.STATUS_ID = S.STATUS_ID AND S.TABLICA = 'STATISTIKA' AND STAT.STAT_ID = :stat_id  AND STAT.VRIJEME_KRAJ IS NOT NULL ";
            const pronadiNoviIzlaz = await connection.execute(
                pronadiNoviIzlaz_SQL,
                {
                    stat_id: stat_id,
                }
            );

            const pronadiStatID = await connection.execute(
                pronadiOtvoreniUlaz_SQL,
                { igrac_id: igracUlazID, utakmica_id: utakmica_id },
                {
                    outFormat: oracledb.OBJECT,
                }
            );
            const stat_ulaz_id = pronadiStatID.rows[0].STAT_ID;

            const pronadiNoviUlaz_SQL =
                "SELECT I.NAZIV, 'Ulaz' as NAZIV, STAT.VRIJEME_POCETAK as VRIJEME, S.NAZIV, STAT.UTAKMICA_ID AS UTAKMICA_ID, STAT.STAT_ID FROM STATISTIKA STAT, STAT_PODATAK SP, IGRACI I,  STATUSI S WHERE STAT.IGRAC_ID = I.IGRAC_ID AND STAT.SP_ID = SP.SP_ID AND SP.SP_ID = 11 AND STAT.STATUS_ID = S.STATUS_ID AND S.TABLICA = 'STATISTIKA' AND STAT.STAT_ID = :stat_id ";
            const pronadiNoviUlaz = await connection.execute(
                pronadiNoviUlaz_SQL,
                {
                    stat_id: stat_ulaz_id,
                }
            );
            return res.send({
                noviIzlaz: pronadiNoviIzlaz.rows[0],
                noviUlaz: pronadiNoviUlaz.rows[0],
                aktivni_domaci: pronadiAktivneDomace.rows,
                aktivni_gosti: pronadiAktivneGoste.rows,
            });
        } else {
            const unesiNoviPodatak_SQL =
                "INSERT INTO STATISTIKA(IGRAC_ID, SP_ID, STATUS_ID, UTAKMICA_ID, VRIJEME_POCETAK) VALUES (:igrac_id, :podatak_id, :status_id, :utakmica_id, trim(TO_CHAR(:minute, '00')) || ':'  ||  trim(TO_CHAR(:sekunde,'00')))";

            let igrac_id = igracID ? igracID : igracUlazID ? igracUlazID : null;
            const unesi = await connection.execute(
                unesiNoviPodatak_SQL,
                {
                    igrac_id: igrac_id,
                    podatak_id: podatakID,
                    status_id: statusID,
                    utakmica_id: utakmica_id,
                    minute: minute,
                    sekunde: sekunde,
                },
                { autoCommit: true }
            );

            const pronadiStatID_SQL =
                "SELECT STAT.STAT_ID FROM STATISTIKA STAT WHERE STAT.IGRAC_ID = :igrac_id AND STAT.VRIJEME_POCETAK = trim(TO_CHAR(:minute, '00')) || ':'  ||  trim(TO_CHAR(:sekunde,'00')) AND STAT.UTAKMICA_ID = :utakmica_id ";
            const pronadiStatID = await connection.execute(
                pronadiStatID_SQL,
                {
                    igrac_id: igrac_id,
                    minute: minute,
                    sekunde: sekunde,
                    utakmica_id: utakmica_id,
                },
                { outFormat: oracledb.OBJECT }
            );

            const stat_id = pronadiStatID.rows[0].STAT_ID;

            let pronadiNoviPodatak_SELECT;
            let pronadiNoviPodatak_FROM;
            let pronadiNoviPodatak_WHERE;
            if (!igracUlazID) {
                pronadiNoviPodatak_SELECT =
                    'SELECT I.NAZIV, SP.NAZIV, STAT.VRIJEME_POCETAK as VRIJEME, S.NAZIV, STAT.UTAKMICA_ID AS UTAKMICA_ID, STAT.STAT_ID ';
                pronadiNoviPodatak_FROM =
                    'FROM STATISTIKA STAT, STAT_PODATAK SP, IGRACI I,  STATUSI S ';
                pronadiNoviPodatak_WHERE =
                    "WHERE STAT.IGRAC_ID = I.IGRAC_ID AND STAT.SP_ID = SP.SP_ID AND SP.SP_ID != 11 AND STAT.STATUS_ID = S.STATUS_ID AND S.TABLICA = 'STATISTIKA' AND STAT.UTAKMICA_ID = :utakmica_id AND STAT.STAT_ID = :stat_id";
            } else {
                pronadiNoviPodatak_SELECT =
                    "SELECT I.NAZIV, 'Ulaz' as NAZIV, STAT.VRIJEME_POCETAK as VRIJEME, S.NAZIV, STAT.UTAKMICA_ID AS UTAKMICA_ID, STAT.STAT_ID ";
                pronadiNoviPodatak_FROM =
                    'FROM STATISTIKA STAT, STAT_PODATAK SP, IGRACI I,  STATUSI S ';
                pronadiNoviPodatak_WHERE =
                    "WHERE STAT.IGRAC_ID = I.IGRAC_ID AND STAT.SP_ID = SP.SP_ID AND SP.SP_ID = 11 AND STAT.STATUS_ID = S.STATUS_ID AND S.TABLICA = 'STATISTIKA' AND STAT.UTAKMICA_ID = :utakmica_id AND STAT.STAT_ID = :stat_id";
            }
            const pronadiNoviPodatak = await connection.execute(
                pronadiNoviPodatak_SELECT +
                    pronadiNoviPodatak_FROM +
                    pronadiNoviPodatak_WHERE,
                { utakmica_id: utakmica_id, stat_id: stat_id }
            );

            let momcad;
            let poeni;
            if ([1, 2, 3].includes(podatakID) && statusID === 1 && uzivo) {
                const pronadiMomcadID = await connection.execute(
                    'SELECT U.DOMACI_ID, U.GOSTI_ID FROM UTAKMICE U WHERE U.UTAKMICA_ID = :utakmica_id',
                    {
                        utakmica_id: utakmica_id,
                    },
                    { outFormat: oracledb.OBJECT }
                );
                let poeniMomcad;
                poeni = podatakID;

                if (pronadiMomcadID.rows[0].DOMACI_ID == momcadID) {
                    momcad = 'DOMACI';
                } else if (pronadiMomcadID.rows[0].GOSTI_ID == momcadID) {
                    momcad = 'GOSTI';
                }
                poeniMomcad = 'POENI_' + momcad;

                const unesiPoene = await connection.execute(
                    'UPDATE UTAKMICE SET ' +
                        poeniMomcad +
                        '=' +
                        poeniMomcad +
                        '+ :poeni' +
                        ' WHERE UTAKMICA_ID = :utakmica_id',
                    { poeni: poeni, utakmica_id: utakmica_id },
                    { autoCommit: true }
                );
            } else if (igracUlazID) {
                const pronadiDomaciID = await connection.execute(
                    'SELECT M.MOMCAD_ID FROM MOMCAD M WHERE M.NAZIV = :domaci_naziv',
                    { domaci_naziv: domaci_naziv },
                    { outFormat: oracledb.OBJECT }
                );

                const domaci_id = pronadiDomaciID.rows[0].MOMCAD_ID;

                const pronadiGosteID = await connection.execute(
                    'SELECT M.MOMCAD_ID FROM MOMCAD M WHERE M.NAZIV = :gosti_naziv',
                    { gosti_naziv: gosti_naziv },
                    { outFormat: oracledb.OBJECT }
                );

                const gosti_id = pronadiGosteID.rows[0].MOMCAD_ID;

                const pronadiAktivneDomace = await connection.execute(
                    'SELECT I.NAZIV, I.BROJ_DRESA, VMI.MOMCAD_ID, I.IGRAC_ID FROM STATISTIKA STAT, IGRACI I, VEZE_MOMCAD_IGRACI VMI WHERE STAT.STATUS_ID = 2 AND STAT.IGRAC_ID = I.IGRAC_ID AND UTAKMICA_ID = :utakmica_id AND VMI.IGRAC_ID = I.IGRAC_ID AND VMI.MOMCAD_ID = :domaci_id AND VMI.STATUS_ID = 1',
                    { utakmica_id: utakmica_id, domaci_id: domaci_id },
                    { outFormat: oracledb.OBJECT }
                );

                const pronadiAktivneGoste = await connection.execute(
                    'SELECT I.NAZIV, I.BROJ_DRESA, VMI.MOMCAD_ID, I.IGRAC_ID FROM STATISTIKA STAT, IGRACI I, VEZE_MOMCAD_IGRACI VMI WHERE STAT.STATUS_ID = 2 AND STAT.IGRAC_ID = I.IGRAC_ID AND UTAKMICA_ID = :utakmica_id AND VMI.IGRAC_ID = I.IGRAC_ID AND VMI.MOMCAD_ID = :gosti_id AND VMI.STATUS_ID = 1',
                    { utakmica_id: utakmica_id, gosti_id: gosti_id },
                    { outFormat: oracledb.OBJECT }
                );
                return res.send({
                    noviPodatak: pronadiNoviPodatak.rows[0],
                    aktivni_domaci: pronadiAktivneDomace.rows,
                    aktivni_gosti: pronadiAktivneGoste.rows,
                });
            }

            return res.send({
                noviPodatak: pronadiNoviPodatak.rows[0],
                momcad: momcad ? momcad : '',
                poeni: poeni ? poeni : null,
            });
        }
    } catch (err) {
        console.log(err);
    } finally {
        try {
            if (connection) {
                await connection.close();
            }
        } catch (err) {
            console.log(err);
        }
    }
});

app.post('/izbrisiPodatak', async (req, res) => {
    let connection;

    const izbrisiPodatak = req.body.izbrisiPodatak[5];

    const izbrisiPodatakUlaz = req.body.izbrisiPodatakUlaz
        ? req.body.izbrisiPodatakUlaz[5]
        : null;

    const podatakUlaz = req.body.izbrisiPodatakUlaz
        ? req.body.izbrisiPodatakUlaz
        : null;

    const imeIgrac = req.body.izbrisiPodatak[0];

    const utakmica_id = req.body.utakmica_id;

    const podatak = req.body.izbrisiPodatak ? req.body.izbrisiPodatak : null;

    const uzivo = req.body.uzivo ? req.body.uzivo : null;
    try {
        connection = await oracledb.getConnection();

        const pronadiPodatakStatus = await connection.execute(
            'SELECT S.SP_ID, S.STATUS_ID FROM STATISTIKA S WHERE S.STAT_ID = :izbrisiPodatak',
            { izbrisiPodatak: izbrisiPodatak },
            { outFormat: oracledb.OBJECT }
        );

        if (podatak[1] == 'Izlaz' && podatakUlaz[1] == 'Ulaz') {
            const azurirajVrijemeIzlaz = await connection.execute(
                'UPDATE STATISTIKA S SET VRIJEME_KRAJ = null WHERE S.STAT_ID = :izbrisiPodatak',
                { izbrisiPodatak: izbrisiPodatak },
                { autoCommit: true }
            );
            const azurirajStatusIzlaz = await connection.execute(
                'UPDATE STATISTIKA S SET STATUS_ID = 2 WHERE S.STAT_ID = :izbrisiPodatak',
                { izbrisiPodatak: izbrisiPodatak },
                { autoCommit: true }
            );

            const izbrisiUlaz = await connection.execute(
                'DELETE STATISTIKA WHERE STAT_ID = :izbrisiPodatakUlaz',
                { izbrisiPodatakUlaz: izbrisiPodatakUlaz },
                { autoCommit: true }
            );

            return;
        } else {
            let poeni;
            let momcad;
            if (
                [1, 2, 3].includes(pronadiPodatakStatus.rows[0].SP_ID) &&
                pronadiPodatakStatus.rows[0].STATUS_ID === 1 &&
                uzivo
            ) {
                const pronadiIgracID = await connection.execute(
                    'SELECT I.IGRAC_ID FROM IGRACI I WHERE I.NAZIV = :imeIgrac',
                    { imeIgrac: imeIgrac },
                    { outFormat: oracledb.OBJECT }
                );
                const igracID = pronadiIgracID.rows[0].IGRAC_ID;

                const pronadiMomcadID = await connection.execute(
                    'SELECT VMI.MOMCAD_ID FROM VEZE_MOMCAD_IGRACI VMI WHERE VMI.IGRAC_ID = :igrac_id AND VMI.STATUS_ID = 1',
                    { igrac_id: igracID },
                    { outFormat: oracledb.OBJECT }
                );

                const pronadiMomcadiUtakmiceID = await connection.execute(
                    'SELECT U.DOMACI_ID, U.GOSTI_ID FROM UTAKMICE U WHERE U.UTAKMICA_ID = :utakmica_id',
                    {
                        utakmica_id: utakmica_id,
                    },
                    { outFormat: oracledb.OBJECT }
                );

                let poeniMomcad;
                poeni = pronadiPodatakStatus.rows[0].SP_ID;

                if (
                    pronadiMomcadiUtakmiceID.rows[0].DOMACI_ID ==
                    pronadiMomcadID.rows[0].MOMCAD_ID
                ) {
                    momcad = 'DOMACI';
                } else if (
                    pronadiMomcadiUtakmice.rows[0].GOSTI_ID ==
                    pronadiMomcadID.rows[0].MOMCAD_ID
                ) {
                    momcad = 'GOSTI';
                }
                poeniMomcad = 'POENI_' + momcad;

                const unesiPoene = await connection.execute(
                    'UPDATE UTAKMICE SET ' +
                        poeniMomcad +
                        '=' +
                        poeniMomcad +
                        '- :poeni' +
                        ' WHERE UTAKMICA_ID = :utakmica_id',
                    { poeni: poeni, utakmica_id: utakmica_id },
                    { autoCommit: true }
                );
            }
            const izbrisi = await connection.execute(
                'DELETE FROM STATISTIKA S WHERE S.STAT_ID = :izbrisiPodatak',
                { izbrisiPodatak: izbrisiPodatak },
                { autoCommit: true }
            );

            res.send({
                momcad: momcad ? momcad : '',
                poeni: poeni ? poeni : null,
            });
        }
    } catch (err) {
        console.log(err);
    } finally {
        try {
            if (connection) {
                await connection.close();
            }
        } catch (err) {
            console.log(err);
        }
    }
});

app.post('/getStatistickiPodatci', async (req, res) => {
    let connection;

    const sql_statistickiPodatci =
        'SELECT SP.NAZIV FROM STAT_PODATAK SP ORDER BY SP.SP_ID';
    const sql_statusi =
        "SELECT S.NAZIV FROM STATUSI S WHERE S.TABLICA = 'STATISTIKA' ORDER BY S.STATUS_ID";
    try {
        connection = await oracledb.getConnection();

        const statistickiPodatci = await connection.execute(
            sql_statistickiPodatci
        );
        const statusi = await connection.execute(sql_statusi);

        res.send({
            statistickiPodatci: statistickiPodatci.rows,
            statusi: statusi.rows,
        });
    } catch (err) {
        console.log(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.log(error);
            }
        }
    }
});

app.post('/unesiPoene', async (req, res) => {
    let connection;

    const poeniDomaci = req.body.poeniDomaci ? req.body.poeniDomaci : null;
    const poeniGosti = req.body.poeniGosti ? req.body.poeniGosti : null;

    const utakmica_id = req.body.utakmica_id ? req.body.utakmica_id : null;
    try {
        connection = await oracledb.getConnection();
        if (poeniDomaci) {
            const result = await connection.execute(
                'UPDATE UTAKMICE SET POENI_DOMACI = :poeniDomaci WHERE UTAKMICA_ID = :utakmica_id',
                { poeniDomaci: poeniDomaci, utakmica_id: utakmica_id },
                { autoCommit: true }
            );
        }
        if (poeniGosti) {
            const result = await connection.execute(
                'UPDATE UTAKMICE SET POENI_GOSTI = :poeniGosti WHERE UTAKMICA_ID = :utakmica_id',
                { poeniGosti: poeniGosti, utakmica_id: utakmica_id },
                { autoCommit: true }
            );
        }
    } catch (err) {
        console.log(err);
    } finally {
        try {
            if (connection) {
                await connection.close();
            }
        } catch (err) {
            console.log(err);
        }
    }
});

app.post('/podatciIgraca', async (req, res) => {
    let connection;

    const imeIgraca = req.body.imeIgrac || '';
    try {
        connection = await oracledb.getConnection();

        if (imeIgraca.length > 0) {
            const podatci = await connection.execute(
                "SELECT I.NAZIV, NVL(I.VISINA, ' '), NVL(D.NAZIV,' '), NVL(P.NAZIV,' '), SUBSTR(VMI.DATUM_OD,1, 10), I.BROJ_DRESA, M.MOMCAD_ID, I.IGRAC_ID, TO_CHAR(I.DATUM_ROD, 'FMMonth DD, YYYY') , I.DRAFT, I.TEZINA, M.NAZIV AS IGRACMOMCAD FROM VEZE_MOMCAD_IGRACI VMI, MOMCAD M, IGRACI I, POZICIJE P, DRZAVE D WHERE VMI.MOMCAD_ID = M.MOMCAD_ID AND VMI.IGRAC_ID = I.IGRAC_ID AND I.NAZIV = :imeIgraca AND I.POZICIJA_ID = P.POZICIJA_ID(+) AND I.DRZAVA_ID = D.DRZAVA_ID(+) AND VMI.STATUS_ID = 1",
                { imeIgraca: imeIgraca }
            );
            const ugovoriIgraca = await connection.execute(
                "SELECT TO_CHAR(VMI.DATUM_OD, 'YYYY') AS DATUM_OD, TO_CHAR(VMI.DATUM_DO, 'YY') AS DATUM_DO, M.KRATICA, M.NAZIV, TO_CHAR(VMI.DATUM_OD, 'YY') || '/' || SUBSTR(NVL(VMI.DATUM_DO, SYSDATE), 9, 2) AS SEZONA FROM VEZE_MOMCAD_IGRACI VMI, MOMCAD M, IGRACI I WHERE VMI.IGRAC_ID = I.IGRAC_ID AND I.NAZIV = :imeIgraca AND VMI.MOMCAD_ID = M.MOMCAD_ID",
                { imeIgraca: imeIgraca },
                { outFormat: oracledb.OBJECT }
            );

            res.send({
                podatci: podatci.rows[0],
                ugovoriIgraca: ugovoriIgraca.rows,
            });
        }
    } catch (err) {
        console.log(err);
    } finally {
        try {
            if (connection) {
                await connection.close();
            }
        } catch (err) {
            console.log(err);
        }
    }
});

app.post('/podatciPocetna', async (req, res) => {
    let connection;

    try {
        connection = await oracledb.getConnection();

        const utakmica = await connection.execute(
            "SELECT M1.KRATICA AS DOMACI_KRATICA, M2.KRATICA AS GOSTI_KRATICA, UTK.POENI_DOMACI, UTK.POENI_GOSTI, TO_CHAR(UTK.DATUM_VRIJEME, 'FMMonth DD, YYYY')  AS DATUM, TO_CHAR(UTK.DATUM_VRIJEME, 'HH24:MI') AS VRIJEME, S.NAZIV, M1.NAZIV AS DOMACI_NAZIV, M2.NAZIV AS GOSTI_NAZIV FROM UTAKMICE UTK, MOMCAD M1, MOMCAD M2, SUDCI S WHERE UTK.DOMACI_ID = M1.MOMCAD_ID AND UTK.GOSTI_ID = M2.MOMCAD_ID AND UTK.SUDAC_ID = S.SUDAC_ID  ORDER BY DATUM_VRIJEME DESC FETCH FIRST 1 ROW ONLY",
            [],
            { outFormat: oracledb.OBJECT }
        );

        const prvihDesetUtakmica = await connection.execute(
            "SELECT M1.KRATICA AS DOMACI_KRATICA, M2.KRATICA AS GOSTI_KRATICA, UTK.POENI_DOMACI, UTK.POENI_GOSTI, TO_CHAR(UTK.DATUM_VRIJEME, 'FMMonth DD, YYYY')  AS DATUM, TO_CHAR(UTK.DATUM_VRIJEME, 'HH24:MI') AS VRIJEME, S.NAZIV, M1.NAZIV AS DOMACI_NAZIV, M2.NAZIV AS GOSTI_NAZIV FROM UTAKMICE UTK, MOMCAD M1, MOMCAD M2, SUDCI S WHERE UTK.DOMACI_ID = M1.MOMCAD_ID AND UTK.GOSTI_ID = M2.MOMCAD_ID AND UTK.SUDAC_ID = S.SUDAC_ID  ORDER BY DATUM_VRIJEME DESC OFFSET 1 ROW FETCH NEXT 10 ROW ONLY",
            [],
            { outFormat: oracledb.OBJECT }
        );

        const sql_SELECT_IGRAC = `SELECT Igrac, count(*) as BrojUtakmica, SUM(TO_NUMBER(SUBSTR(NBA.RACUNAJ_MINUTE(igrac_id, utakmica_id), 1, 2))*60 + TO_NUMBER(SUBSTR(NBA.RACUNAJ_MINUTE(igrac_id, utakmica_id), 4, 2))) as minute, SUM("Slobodna Bacanja Pogodena" + "Šut za 2 Pogoden"*2 + "Šut za 3 Pogoden"*3)/COUNT(*) as Poeni, SUM("Šut za 3 Pogoden" + "Šut za 2 Pogoden")/COUNT(*) as Pogodci_iz_Polja, SUM("Šut za 3 Pogoden" + "Šut za 3 Promasen" + "Šut za 2 Promasen" + "Šut za 2 Pogoden")/COUNT(*)  as Pokusaji_iz_Polja, CASE WHEN SUM("Šut za 3 Pogoden" + "Šut za 3 Promasen" + "Šut za 2 Promasen" + "Šut za 2 Pogoden") = 0 THEN 0 ELSE SUM("Šut za 3 Pogoden" + "Šut za 2 Pogoden") / SUM("Šut za 3 Pogoden" + "Šut za 3 Promasen" + "Šut za 2 Promasen" + "Šut za 2 Pogoden") END as PP ,SUM("Šut za 3 Pogoden")/COUNT(*) as Sut_za_3_pogoden, SUM("Šut za 3 Promasen")/COUNT(*) as Sut_za_3_promasen ,  CASE WHEN SUM("Šut za 3 Pogoden" + "Šut za 3 Promasen") = 0 THEN 0 ELSE SUM("Šut za 3 Pogoden")/SUM("Šut za 3 Pogoden" + "Šut za 3 Promasen") END   as TRI_P, SUM("Slobodna Bacanja Pogodena")/COUNT(*) AS Slobodna_Bacanja_pogodena, SUM("Slobodna Bacanja Promasena")/COUNT(*) as Slobodna_bacanja_promasena,  CASE WHEN SUM("Slobodna Bacanja Pogodena"+"Slobodna Bacanja Promasena") = 0 THEN 0 ELSE SUM("Slobodna Bacanja Pogodena")/SUM("Slobodna Bacanja Pogodena"+"Slobodna Bacanja Promasena")  END  AS SB,SUM("Napadacki Skok")/COUNT(*) as Napadacki_skok,SUM("Obrambeni Skok")/COUNT(*) as Obrambeni_skok,  SUM("Obrambeni Skok" + "Napadacki Skok")/COUNT(*) as Skokovi, SUM("Asistencije")/COUNT(*) as Asistencije, SUM("Ukradene Lopte")/COUNT(*) as Ukradene_lopte,SUM("Blokovi")/COUNT(*) as Blokovi, IgracMomcad, IgracMomcadKratica, Sezona, plasman, BROJ_DRESA, GODINE`;

        const sql_FROM_IGRAC = ` FROM (select utk.utakmica_id as Utakmica_id, vml.konacni_plasman as plasman, m.NAZIV AS IgracMomcad, m.kratica AS IgracMomcadKratica, m1.kratica AS Domaci, m1.naziv as DOMACI_IME, m2.kratica AS Gosti , m2.NAZIV AS GOSTI_IME, i.igrac_id AS Igrac_id, i.naziv AS Igrac, sp.naziv || '_' ||s.naziv AS Podatak, s.naziv AS Status, UTK.DATUM_VRIJEME, l.sezona as Sezona, i.BROJ_DRESA, FLOOR(MONTHS_BETWEEN(SYSDATE, I.DATUM_ROD) / 12) AS GODINE FROM statistika stat,igraci i,utakmice utk,stat_podatak sp, momcad m, momcad m1,momcad m2,statusi s, lige l, veze_momcad_igraci vmi, veze_momcad_lige vml where vml.momcad_id = m.momcad_id and vml.liga_id = l.liga_id and vmi.IGRAC_ID = i.IGRAC_ID AND VMI.STATUS_ID = 1 AND VMI.MOMCAD_ID = M.MOMCAD_ID AND STAT.IGRAC_ID = i.igrac_id and stat.sp_id = sp.sp_id and STAT.STATUS_ID = s.status_id and stat.utakmica_id = utk.utakmica_id and UTK.DOMACI_ID = m1.momcad_id and utk.gosti_id = m2.momcad_id and s.tablica = 'STATISTIKA' and utk.liga_id = l.liga_id and l.sezona = '23/24' ) `;

        const sql_PIVOT_IGRAC = ` PIVOT ( COUNT(Status) FOR Podatak IN('Slobodno bacanje_Pogođen' AS "Slobodna Bacanja Pogodena",'Slobodno bacanje_Promašen' AS "Slobodna Bacanja Promasena",'Šut za 3_Pogođen' AS "Šut za 3 Pogoden", 'Šut za 3_Promašen' AS "Šut za 3 Promasen",'Šut za 2_Pogođen' AS "Šut za 2 Pogoden", 'Šut za 2_Promašen' AS "Šut za 2 Promasen",'Ulaz/Izlaz_Završen' AS "Ulaz/Izlaz",'Obrambeni skok_Završen' AS "Obrambeni Skok",'Napadački skok_Završen' AS "Napadacki Skok",'Asistencija_Završen' AS "Asistencije",'Izgubljena lopta_Završen' AS "Izgubljene Lopte",'Ukradena lopta_Završen' AS "Ukradene Lopte",'Blokada_Završen' AS "Blokovi")) GROUP BY IGRAC , IGRACMOMCAD,  IGRACMOMCADKRATICA, sezona, plasman, BROJ_DRESA, GODINE ORDER BY Poeni DESC FETCH FIRST 1 ROW ONLY`;

        const igrac = await connection.execute(
            sql_SELECT_IGRAC + sql_FROM_IGRAC + sql_PIVOT_IGRAC,
            [],
            { outFormat: oracledb.OBJECT }
        );

        res.send({
            utakmica: utakmica.rows,
            igrac: igrac.rows,
            prvihDesetUtakmica: prvihDesetUtakmica.rows,
        });
    } catch (err) {
        console.log(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.log(err);
            }
        }
    }
});

app.post('/podatciSearch', async (req, res) => {
    let connection;

    try {
        connection = await oracledb.getConnection();

        const igraci = await connection.execute(
            'SELECT I.NAZIV AS IGRAC, M.NAZIV AS MOMCAD, I.BROJ_DRESA, P.NAZIV AS POZICIJA, I.VISINA, D.NAZIV AS DRZAVA, M.KRATICA AS KRATICA FROM VEZE_MOMCAD_IGRACI VMI, IGRACI I, MOMCAD M, POZICIJE P, DRZAVE D WHERE VMI.MOMCAD_ID = M.MOMCAD_ID AND VMI.IGRAC_ID = I.IGRAC_ID AND VMI.STATUS_ID = 1 AND I.POZICIJA_ID = P.POZICIJA_ID AND I.DRZAVA_ID = D.DRZAVA_ID ORDER BY IGRAC',
            [],
            { outFormat: oracledb.OBJECT }
        );

        const momcadi = await connection.execute(
            "SELECT M.NAZIV AS MOMCAD, T.NAZIV AS TRENER, TO_CHAR(M.DATUM_OD, 'FMMonth DD, YYYY') AS DATUM_OSNIVANJA, G.NAZIV AS GRAD, S.NAZIV AS STADION FROM VEZE_MOMCAD_TRENER VMT, MOMCAD M, GRADOVI G, STADIONI S, TRENERI T WHERE VMT.MOMCAD_ID = M.MOMCAD_ID AND VMT.TRENER_ID = T.TRENER_ID AND VMT.STATUS_ID = 1 AND M.GRAD_ID = G.GRAD_ID AND M.STADION_ID = S.STADION_ID ORDER BY MOMCAD",
            [],
            { outFormat: oracledb.OBJECT }
        );

        res.send({ igraci: igraci.rows, momcadi: momcadi.rows });
    } catch (err) {
        console.log(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.log(err);
            }
        }
    }
});
