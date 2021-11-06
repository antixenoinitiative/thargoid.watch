require("dotenv").config();
const express = require('express');
const app = express();
const PORT = process.env.PORT;
const MODE = process.env.MODE;

function requireHTTPS(req, res, next) {
    if (req.headers["x-forwarded-proto"] == "http" && MODE != "DEV") {
        return res.redirect(301, "https://" + req.hostname+req.url);
    }
    next();
}

app.use(requireHTTPS);
app.use(express.static('public'));

app.get('/',function(req,res) {
    res.sendFile('public/index.html');
});

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));