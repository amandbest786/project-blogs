const authorModel = require('../models/authorModel.js');

const isValidValue = function(value){
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const isValidTitle = function(title){
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1
}

const isValidDetails = function(details){
    return Object.keys(details).length > 0
}

const author = async function (req, res){
    try{
        const details = req.body
        if(!isValidDetails(details)){
            res.status(400).send({status:false, msg:"Please provide author details"})
        }
        const {fname, lname, title, email, password} = details
        if (!isValidValue(fname)){
            return res.status(400).send({status:false, msg:"please provide first name"})
        }
        if (!isValidValue(lname)){
            return res.status(400).send({status:false, msg:"please provide last name"})
        }
        if (!isValidValue(title)){
            return res.status(400).send({status:false, msg:"please provide title"})
        }
        if (!isValidValue(email)){
            return res.status(400).send({status:false, msg:"please provide email"})
        }
        if (!isValidValue(password)){
            return res.status(400).send({status:false, msg:"please provide password"})
        }
        if (!isValidTitle(title)){
            return res.status(400).send({status:false, msg:"title should be Mr, Miss or Mrs"})
        }
        if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
            return res.status(400).send({status:false,msg:"please provide valid email"})
        }
        const emailUsed = await authorModel.findOne({email})
        if(emailUsed){
            return res.status(400).send({status:false, msg:`Email Id ${email} already exists`})
        }
        const data = await authorModel.create(details)  //creating the author details
        res.status(201).send({status: true, msg : "Author created and details saved successfully", data:data})
    }
    catch(err){
        res.status(500).send({status:false, error : err.message})
    }               
}

module.exports.author = author