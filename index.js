require("dotenv").config();
const express = require('express');
const app = express();
const PORT = process.env.PORT;

app.use(express.static('public'));

app.get('/',function(req,res) {
    res.sendFile('public/index.html');
});

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));