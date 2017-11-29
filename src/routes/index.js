import express from 'express';
import config from '../config';
import middleware from '../middleware';
import initializeDb from '../db';
import enrollment from '../controller/enrollment';
import payor from '../controller/payor';
import state from '../controller/state';

let router = express();

// connect to db
initializeDb( (pool, adminPool) => {

  // internal middleware
  router.use(middleware({ config, pool }));

  // api routes v1
  router.use('/enrollment', enrollment({ config, pool, adminPool }));
  router.use('/payor', payor({ config, pool }));
  router.use('/state', state({ config, pool }));

});

export default router;
