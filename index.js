const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.get('/',function(req,res) {
    res.sendFile('public/index.html');
});

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));