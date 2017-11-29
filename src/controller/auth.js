const jwt = require('jsonwebtoken');
const { Pool, Client } = require('pg');
var logger = require('../logger');

module.exports.verify = ( token, pool ) => {
  var isValid = false;
  var decoded = '';
  try {
    console.log('Attempting to decode the token!');
    console.log('The token was decoded!');
    decoded = jwt.verify(token, '123abc');
    let userName = decoded.id;
    console.log('Decoded id:', decoded.id);

    (async () => {
      // note: we don't try/catch this because if connecting throws an exception
      // we don't need to dispose of the client (it will be undefined)
      console.log('Before connecting to the data pool');
      const client = await pool.connect();
      console.log('After connecting to the data pool');

      try {
        let findUserQuery = {
          name: 'find-user',
          text: "SELECT * FROM public.user WHERE user_name = $1",
          values: ['mtrentman']
        }

        console.log('Before querying for the user');
        let resultSet  = await client.query(findUserQuery);
        console.log('After querying for the user');
        if (resultSet.rows.length > 0) {
          console.log('Token is valid!');
          isValid = true;
        } else {
          console.log('Token is NOT valid!');
          isValid = false;
        }
      } catch (e) {
        console.log("Error connecting to administration...");
        logger.info('Error connecting to administration!');
        logger.error(e.stack);
        throw e
      } finally {
        client.release();
      }
    } )().catch(
      e => {
        console.error(e.stack);
        logger.error(`ERROR!!! - ${e.stack}`);
      }
    )
  } catch (e) {
    logger.info('Well that did not go as planned...');
    logger.error(e.stack);
  }
  return isValid;
}
