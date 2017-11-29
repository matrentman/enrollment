import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';

import config from './config';
import routes from './routes';
var cors = require('cors');
var app = express();
app.use(cors());
app.server = http.createServer(app);

// middleware
// parse application/json
app.use(bodyParser.json({
  limit: config.bodyLimit
}));

// passport config

// api routes v1
app.use('/api/v1', routes);

app.server.listen(config.port);
console.log(`Started on port ${app.server.address().port}`);

export default app;
