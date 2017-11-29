import jwt from 'jsonwebtoken';
//import expressJwt from 'express-jwt';

const TOKENTINE = 60*50*24*30;
const SECRET = '123abc';

//let authenticate = expressJwt({secret: SECRET});

let generateAccesstoken = (req, res, next) => {
  req.token = req.token || {};
  req.token = jwt.sign({
    id: req.user.id,
  }, SECRET, {
    expiresIn: TOKENTIME
  });
  next();
}

let respond = (req, res) => {
  res.status(200).json({
    user: req.user.username,
    token: req.token
  });
}

module.exports = {
  //authenticate,
  generateAccesstoken,
  respond
}
