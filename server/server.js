const express = require('express');
const cors = require('cors')
const app = express();
const request = require('request');
const https = require('https')
const fs = require("fs");
const path = require("path");

const options = {
    key: fs.readFileSync(path.join(__dirname, 'server_key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'server_cert.pem')),
    requestCert: true,
    rejectUnauthorized: false, // so we can do own error handling
    ca: [
        fs.readFileSync(path.join(__dirname, 'server_cert.pem'))
    ]
};

app.use(cors());
app.use(express.json());

app.use('/login', (req, res) => {
    console.log(req.client.authorized)

    if (req.client.authorized) {
        console.log(`Hello your certificate is valid `);
    } else {
        console.log(`Sorry, but you need to provide a client certificate to continue.`);
    }

    console.log(req.body)

    if (req.body.username === "admin" && req.body.password === "secret") {
        res.send({
            token: 'test123'
        });
    } else {
        res.status(401).send("Bad login")
    }
});

app.use('/validatecaptcha', (req, res) => {
    let secretKey = "6Lebr74eAAAAAISa4rV4aO-AyXBCGvY01oMHZkW5";

    let verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body.token;
    // Hitting GET request to the URL, Google will respond with success or error scenario.
    request(verificationUrl, function (error, response, body) {
        body = JSON.parse(body);
        console.log(body.success)
        if (body.success !== undefined && !body.success) {
            return res.send({"responseCode": 1, "responseDesc": "Failed captcha verification"});
        }
        res.send({"responseCode": 0, "responseDesc": "Success"});
    });

})

app.use('/getagent', (req, res) => {

    const certFile = path.resolve(__dirname, `certs/client_cert.pem`);
    const keyFile = path.resolve(__dirname, `certs/client_key.pem`);
    const agent = new https.Agent({
        cert: fs.readFileSync(certFile),
        key: fs.readFileSync(keyFile),
        rejectUnauthorized: false
    });
    console.log("-- Agent requested! Sending...")
    res.send(agent)
})

let server = https.createServer(options, app).listen(8080, function () {
    console.log("Express server listening on port " + 8080);
});