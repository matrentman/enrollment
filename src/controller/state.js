import { Router } from 'express';
import bodyParser from 'body-parser';
var logger = require('../logger');

const { Pool, Client } = require('pg');
const util = require('util');

export default({ config, pool }) => {
  let api = Router();

  // '/v1/payor/list'
  api.get('/list', (request, response) => {

    logger.info('Entered api /state/list');

    (async () => {
      // note: we don't try/catch this because if connecting throws an exception
      // we don't need to dispose of the client (it will be undefined)
      const client = await pool.connect();

      try {
        let getStateListQuery = {
          name: 'state-list',
          text: "SELECT code, name FROM public.state ORDER BY name",
        }

        let resultSet  = await client.query(getStateListQuery);

        var stateList = [];
        for (var i = 0; i < resultSet.rows.length; i++) {
          stateList.push({code: resultSet.rows[i].code, name: resultSet.rows[i].name});
        }

        logger.info('Call to /state/list was successful!');
        response.json({'state-list': stateList});
      } catch (e) {
        console.log("State list could not be retrieved...");
        logger.info('State list could not be retrieved!');
        logger.error('e.stack');
        throw e
      } finally {
        client.release();
      }
    })().catch(
      e => {
        console.error(e.stack);
        logger.error(`ERROR!!! - ${e.stack}`);
        response.json({ message: 'ERROR: Could not retrieve state list!'})
      }
    )
  logger.info('Exited api /payor/list');
  });

  return api;
}
