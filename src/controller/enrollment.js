import { Router } from 'express';
import bodyParser from 'body-parser';
//import { authenticate } from '../middleware/authMiddleware';
//const auth = require('./auth');
const { Pool, Client } = require('pg');
const util = require('util');
var logger = require('../logger');
var uuid = require('uuid');

export default({ config, pool, adminPool }) => {
  let api = Router();

  // '/v1/enrollment/add'
  api.post('/add', (request, response) => {

    logger.info('Entered api /enrollment/add');

    let companyName = request.body.provider_company_name;
    let dba = request.body.provider_dba;
    let taxId = request.body.provider_tax_id;
    let npi = request.body.provider_npi;
    let taxonomy = request.body.provider_taxonomy;
    let medicaidNumber = request.body.provider_medicaid_number;
    let medicareNumber = request.body.provider_medicare_number_ptan;
    let street = request.body.provider_street;
    let city = request.body.provider_city;
    let state = request.body.provider_state;
    let zipCode = request.body.provider_zip_code;
    let contactFirstName = request.body.provider_contact_first_name;
    let contactLastName = request.body.provider_contact_last_name;
    let contactTitle = request.body.provider_contact_title;
    let contactEmail = request.body.provider_contact_email;
    let contactPhone = request.body.provider_contact_primary_phone_number;
    let contactFax = request.body.provider_contact_fax;
    let claimTypeProfessional = request.body.provider_payer_claim_type_professional;
    let claimTypeInstitutional = request.body.provider_payer_claim_type_institutional;
    let claimTypeDental = request.body.provider_payer_claim_type_dental;
    let claimTypeDme = request.body.provider_payer_claim_type_dme;
    let claimTypeErs = request.body.provider_payer_claim_type_ers;
    let stateList = request.body.provider_payer_states;
    let payerList = request.body.provider_payer_payers;
    let authToken = request.header('auth-token');

    console.log(`companyName = ${companyName}`);
    console.log(`dba = ${dba}`);
    console.log(`taxId = ${taxId}`);
    console.log(`npi = ${npi}`);
    console.log(`taxonomy = ${taxonomy}`);
    console.log(`medicaidNumber = ${medicaidNumber}`);
    console.log(`medicareNumber = ${medicareNumber}`);
    console.log(`street = ${street}`);
    console.log(`city = ${city}`);
    console.log(`state = ${state}`);
    console.log(`zipCode = ${zipCode}`);
    console.log(`contactFirstName = ${contactFirstName}`);
    console.log(`contactLastName = ${contactLastName}`);
    console.log(`contactTitle = ${contactTitle}`);
    console.log(`contactEmail = ${contactEmail}`);
    console.log(`contactPhone = ${contactPhone}`);
    console.log(`contactFax = ${contactFax}`);
    console.log(`claimTypeProfessional = ${claimTypeProfessional}`);
    console.log(`claimTypeInstitutional = ${claimTypeInstitutional}`);
    console.log(`claimTypeDental = ${claimTypeDental}`);
    console.log(`claimTypeDme = ${claimTypeDme}`);
    console.log(`claimTypeErs = ${claimTypeErs}`);
    console.log(`stateList = ${stateList}`);
    console.log(`payerList = ${payerList}`);
    console.log(`authToken = ${authToken}`);

    //const isValid = auth.verify(authToken, adminPool);
//console.log('isValid', isValid);

    //if (isValid) {
      let uuidString = uuid.v4();
      console.log(`UUID = ${uuidString}`);

      (async () => {
        // note: we don't try/catch this because if connecting throws an exception
        // we don't need to dispose of the client (it will be undefined)
        const client = await pool.connect();

        try {
          await client.query('BEGIN');

          let insertEnrollmentQuery = {
            name: 'insert-enrollment',
            text: "INSERT INTO public.enrollment (enrollment_group_identifier) VALUES($1) RETURNING id",
            values: [uuidString]
          }
          let resultSet  = await client.query(insertEnrollmentQuery);
          let enrollmentId = resultSet.rows[0].id;
  console.log(util.inspect(resultSet, false, null));
  console.log(`id=${resultSet.rows[0].id}`);
  console.log(`id=${enrollmentId}`);
  console.log('After enrollment');

          let insertProviderQuery = {
            name: 'insert-provider',
            text: "INSERT INTO public.provider (enrollment_id, company_name, dba, tax_id, npi, taxonomy, medicaid_number, medicare_number_ptan, street, city, state, zip_code) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12 ) RETURNING id",
            values: [enrollmentId, companyName, dba, taxId, npi, taxonomy, medicaidNumber, medicareNumber, street, city, state, zipCode]
          }
          resultSet = await client.query(insertProviderQuery);
          let contactId = resultSet.rows[0].id;
  console.log(util.inspect(resultSet, false, null));
  console.log(`id=${resultSet.rows[0].id}`);
  console.log(`id=${contactId}`);
  console.log('After provider');

          let insertContactQuery = {
            name: 'insert-contact',
            text: "INSERT INTO public.contact (provider_id, first_name, last_name, title, email, phone, fax) VALUES($1, $2, $3, $4, $5, $6, $7 ) RETURNING id",
            values: [contactId, contactFirstName, contactLastName, contactTitle, contactEmail, contactPhone, contactFax]
          }
          resultSet = await client.query(insertContactQuery);
  console.log('After contact');

          let insertPayorGroupQuery = {
            name: 'insert-payor-group',
            text: "INSERT INTO public.payor_group (enrollment_id, professional_flag, institutional_flag, dental_flag, dme_flag, ers_flag) VALUES($1, $2, $3, $4, $5, $6) RETURNING id",
            values: [enrollmentId, claimTypeProfessional, claimTypeInstitutional, claimTypeDental, claimTypeDme, claimTypeErs]
          }
          resultSet = await client.query(insertPayorGroupQuery);
          let payorGroupId = resultSet.rows[0].id;
  console.log(util.inspect(resultSet, false, null));
  console.log(`id=${resultSet.rows[0].id}`);
  console.log(`id=${payorGroupId}`);
  console.log('After payor-group');

  console.log(stateList);
  console.log(util.inspect(stateList, false, null));
  console.log(stateList[0].code);
  console.log(stateList.length);

          let selectStateIdQuery = 'SELECT id FROM public.state WHERE code = $1';
          let insertPayorGroupStateQuery = 'INSERT INTO public.payor_group_state (payor_group_id, state_id) VALUES($1, $2)';
          for (let i = 0; i < stateList.length; i++) {
  console.log('<<<<<<<<<<<<<<');
            var queryParams = [];
            queryParams.push(stateList[i].code);
  console.log(`QueryParams=${queryParams}`);
            var result = await client.query(selectStateIdQuery, queryParams);
  console.log('<<<<<<<<<<<<<<');
            if (result.rows[0] != null) {
              queryParams = [];
              queryParams.push(payorGroupId);
              queryParams.push(result.rows[0].id);
              await client.query(insertPayorGroupStateQuery, queryParams);
            } else {
              logger.info(`Could not retrieve id for state code [${payerList[i].code}]`);
            }
          }

          let selectPayorCodeIdQuery = 'SELECT id FROM public.payor_code WHERE code = $1';
          let insertPayorGroupPayorCodeQuery = 'INSERT INTO public.payor_group_payor_code (payor_group_id, payor_code_id) VALUES($1, $2)';
          for (let i = 0; i < payerList.length; i++) {
  console.log('<<<<<<<<<<<<<<');
            var queryParams = [];
            queryParams.push(payerList[i].code);
  console.log(`QueryParams=${queryParams}`);
            var result = await client.query(selectPayorCodeIdQuery, queryParams);
  console.log('<<<<<<<<<<<<<<');
            if (result.rows[0] != null) {
              queryParams = [];
              queryParams.push(payorGroupId);
              queryParams.push(result.rows[0].id);
              await client.query(insertPayorGroupPayorCodeQuery, queryParams);
            } else {
              logger.info(`Could not retrieve id for payor code [${payerList[i].code}]`);
            }
          }

          await client.query('COMMIT');
          logger.info('Transaction was successful!');
          response.status(200).json({ message: 'SUCCESS! Persisted enrollment data!', id: uuidString})
        } catch (e) {
  console.log("Rolling back...");
          await client.query('ROLLBACK')
          logger.info('Transaction was rolled back!');
          logger.error('e.stack');
          throw e
        } finally {
          client.release();
        }
      })().catch(
        e => {
          console.error(e.stack);
          logger.error(`ERROR!!! - ${e.stack}`);
          response.status(500).json({ message: 'ERROR: Could not persist enrollment data!'})
        }
      )
    // } else {
    //   response.status(401).json({ message: 'Not authorized!'})
    // }
    logger.info('Exited api /add');
  });

  return api;
}
