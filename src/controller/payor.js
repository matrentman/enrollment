import { Router } from 'express';
import bodyParser from 'body-parser';
var logger = require('../logger');

const { Pool, Client } = require('pg');
const util = require('util');

export default({ config, pool }) => {
  let api = Router();

  // '/v1/payor/list'
  api.get('/list', (request, response) => {

    logger.info('Entered api /payor/list');

    (async () => {
      // note: we don't try/catch this because if connecting throws an exception
      // we don't need to dispose of the client (it will be undefined)
      const client = await pool.connect();

      try {
        let getPayorListQuery = {
          name: 'payor-list',
          text: "SELECT code, SUBSTRING(name,0,65) as name FROM public.payor_code ORDER BY name",
        }

        let resultSet  = await client.query(getPayorListQuery);

        var payorList = [];
        for (var i = 0; i < resultSet.rows.length; i++) {
          payorList.push({code: resultSet.rows[i].code, name: resultSet.rows[i].name});
        }

        logger.info('Call to /payor/list was successful!');
        response.json({'payor-list': payorList});
      } catch (e) {
        console.log("Payor list could not be retrieved...");
        logger.info('Payor list could not be retrieved!');
        logger.error(e.stack);
        throw e
      } finally {
        client.release();
      }
    })().catch(
      e => {
        console.error(e.stack);
        logger.error(`ERROR!!! - ${e.stack}`);
        response.json({ message: 'ERROR: Could not retrieve payor list!'})
      }
    )
  logger.info('Exited api /payor/list');
  });

  return api;
}
