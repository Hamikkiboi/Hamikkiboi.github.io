// Lataa tarvittavat kirjastot
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mysql = require('mysql');

// Luo yhteys tietokantaan
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'kayttajanimi',
  password: 'salasana',
  database: 'tietokannan_nimi'
});

connection.connect((err) => {
  if (err) {
    console.error('Virhe tietokantayhteydessä: ' + err.stack);
    return;
  }
  console.log('Tietokantayhteys muodostettu');
});

// Luo Express-sovellus
const app = express();

// Määritä body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Määritä Express-reitit
app.post('/ilmoittaudu', (req, res) => {
  // Tallenna tiedot tietokantaan
  const nimi = req.body.nimi;
  const sahkoposti = req.body.sahkoposti;

  const sql = 'INSERT INTO ilmoittautumiset (nimi, sahkoposti) VALUES (?, ?)';
  const values = [nimi, sahkoposti];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('Virhe tallennettaessa tietokantaan: ' + err.stack);
      res.status(500).send('Tallennus epäonnistui');
      return;
    }
    console.log('Tiedot tallennettu tietokantaan');
  });

  // Lähetä tiedot sähköpostiin
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'kayttajanimi@gmail.com',
      pass: 'salasana'
    }
  });

  const mailOptions = {
    from: 'kayttajanimi@gmail.com',
    to: 'hamikkipopu@gmail.com',
    subject: 'Uusi ilmoittautuminen',
    text: `Uusi ilmoittautuminen: ${nimi}, ${sahkoposti}`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Virhe lähettäessä sähköpostia: ' + err.stack);
      res.status(500).send('Sähköpostin lähetys epäonnistui');
      return;
    }
    console.log('Sähköposti lähetetty: ' + info.response);
    res.status(200).send('kiitos ilmottautumisesta ;)');
});
}); 

