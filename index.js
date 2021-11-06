require("dotenv").config();
const express = require('express');
const app = express();
const PORT = process.env.PORT;
const MODE = process.env.MODE;

function requireHTTPS(req, res, next) {
    if (!req.secure && MODE != "DEV") {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
}

app.use(requireHTTPS);
app.use(express.static('public'));

app.get('/',function(req,res) {
    res.sendFile('public/index.html');
});

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));