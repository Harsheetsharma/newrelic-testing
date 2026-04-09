
import('newrelic');

const express = require('express');

const app = express();

app.get('/', async (req, res) => {
    console.log("hello there!");
    res.json({
        msg: 'hello from express app'
    })
})

app.listen(3000, () => {
    console.log('the app is listening on port 3000')
})