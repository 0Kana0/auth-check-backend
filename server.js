const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
require('dotenv').config()
const { readdirSync } = require('fs')
const cookieParser = require('cookie-parser');
const { createClient } = require('redis');

const app = express()
app.use(cookieParser()); 
app.use(cors())
app.use(morgan('dev'))

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

app.use(bodyParser.json({limit:'20mb'}))
app.use(bodyParser.text());
app.use(bodyParser.text({ type: 'application/xml' }));
app.use(bodyParser.urlencoded({ extended: true }));

readdirSync('./routes')
.map((r) => app.use('/api', require('./routes/' + r)))

redisClient.connect().catch(console.error);

const port = process.env.PORT || 3000
app.listen(port, function () {
  console.log('CORS-enabled web server listening on port ' + port)
}) 