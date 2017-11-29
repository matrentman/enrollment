import pg from 'pg';
const { Pool, Client } = require('pg');
import config from './config';

export default callback => {
  const pool1 = new Pool({
    connectionString: config.enrollmentDatasource,
  });
  const pool2 = new Pool({
    connectionString: config.adminDatasource,
  });
  //let db = new pg.Client(config.postgreUrl);
  callback(pool1, pool2);
}
