const jwt = require('jsonwebtoken');
const authorModel = require('../models/authorModel.js');

const isValidValue = function(value){
  if (typeof value === 'undefined' || value === null) return false
  if (typeof value === 'string' && value.trim().length === 0) return false
  return true
}

const login = async function(req, res){
    try{
        let author = req.body
        const {email, password} = author
        if (!isValidValue(email)){
          return res.status(400).send({status:false, msg:"please provide email"})
        }
        if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
          return res.status(400).send({status:false,msg:"please provide valid email"})
        }
        if (!isValidValue(password)){
            return res.status(400).send({status:false, msg:"please provide password"})
        }
        let authorCred = await authorModel.findOne({email, password});  //finding the email/password in the authors.
        if (!authorCred)
          return res.status(401).send({status: false, msg: "Username & Password is not correct, Please check your credentials again.",})
        
          //authentication starts
          let token = jwt.sign(   //creting the token for the authentication.
            {
              authorId : authorCred._id   //payload(details that we saved in this token)
            },
            "Project/blogs"  //secret key
          );
          res.setHeader("x-api-key", token);  //setting token to header
          res.send({ status: true, msg : "login successfull",data: token });  
    }
    catch (err) {
      res.status(500).send({status:false, msg : err.message})
    }
  }

  module.exports.login = login;