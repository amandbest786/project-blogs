const blogModel = require('../models/blogModel.js');
const authorModel = require('../models/authorModel.js');

const isValidValue = function(value){
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const isValidDetails = function(details){
    return Object.keys(details).length > 0
}

const createBlog = async function (req, res){
    try{
        const blogDetails = req.body
        if(!isValidDetails(blogDetails)){
            res.status(400).send({status:false, msg:"Please provide blog details"})
        }
        if(!blogDetails.title){
            return res.status(400).send({status:false, msg:"please provide title"})
        }
        if(!blogDetails.body){
            return res.status(400).send({status:false, msg:"please provide body"})
        }
        if(!blogDetails.authorId){
            return res.status(400).send({status:false, msg:"please provide authorId"})
        }
        if(!blogDetails.catagory){
            return res.status(400).send({status:false, msg:"please provide category"})
        }
        const id = blogDetails.authorId
        const validate = await authorModel.findById(id)   //finding by authorId
        if(!validate) {
            return res.status(400).send({status:false, msg:"AuthorId is invalid"})    //check valid authorId
        }
        const data = await blogModel.create(blogDetails)   //create blog
        console.log("Data saved successfully")
        res.status(201).send({status:true,msg:"blog created successfully", data:data})  
    }
    catch(err){
    console.log(err)
    res.status(500).send({status:false, msg: err.message})
    }
}

const getBlog = async function (req, res){
    try{
            let qwery = req.query
            let filter = {
                isDeleted: false,     //store the condition in filter variable
                isPublished: true,
                ...qwery
            }
            // console.log(filter)

            const filterByQuery = await blogModel.find(filter)  //finding the blog by the condition that is stored in the fiter variable.
            if(filterByQuery.length == 0) {
                return res.status(404).send({status:false, msg:"No blog found"})
            }
            console.log("Data fetched successfully")
            res.status(201).send({status:true, data:filterByQuery})
    }
    catch(err) {
    console.log(err)
    res.status(500).send({status:false, msg: err.message})
    }
}

const updateBlog = async function(req, res){
    try{
        const blogId = req.params.blogId
        const Details = req.body
        if(!blogId){
            return res.status(400).send({status:false, msg:"please provide blogId"})
        }
        const validId = await blogModel.findById(blogId)   //finding the blogId 
        if (!validId){
            return res.status(400).send({status:false, msg:"Blog Id is invalid"})   //check the blogId
        }
        const authorIdFromParam = req.params.authorId
        const authorIdFromBlog = validId.authorId.toString()    //change the authorId to string
        if (authorIdFromParam !== authorIdFromBlog) {          // for similar authorId from param & blogModel to update
            return res.status(401).send({status : false, msg : "This is not your blog, you can not update it."})
        }
        const updatedDetails = await blogModel.findOneAndUpdate(
            {_id : blogId},    //update the title, body, tage & subcategory.
            {title : Details.title, body : Details.body, tags : Details.tags,
            subcategory : Details.subcategory, isPublished : true, publishedAt : new Date()},
            {new : true, upsert : true})    //ispublished will be true and update the date at publishAt.
        res.status(201).send({status:true, data:updatedDetails})
    }
    catch(err) {
        console.log(err)
        res.status(500).send({status:false, msg: err.message})
    }
}

const deleteBlogById = async function(req, res){
    try{
        const blogId = req.params.blogId
        const validId = await blogModel.findById(blogId)   
        if (!validId){
            return res.status(400).send({status:false, msg:"Blog Id is invalid"})
        }
        const authorIdFromParam = req.params.authorId
        const authorIdFromBlog = validId.authorId.toString()    //change the authorId to string
        console.log(authorIdFromBlog, authorIdFromParam)
        if (authorIdFromParam !== authorIdFromBlog) {          // for similar authorId from param & blogModel to delete
            return res.status(401).send({status : false, msg : "This is not your blog, you can not delete it."})
        }       //checks the authorId with the blogId that who is the owner of this blog.  
        const deletedDetails = await blogModel.findOneAndUpdate(
            {_id : blogId},
            {isDeleted : true, deletedAt : new Date()},
            {new : true})    //isDeleted will be true & update the date at deletedAt.
        res.status(201).send({status:true, data:deletedDetails})
    }
    catch(err) {
        console.log(err)
         res.status(500).send({status:false, msg: err.message})
    }
}

const deleteBlogByQuery = async function(req, res){
    try{
    let qwery = req.query
        let filter = {...qwery}
        const filterByQuery = await blogModel.find(filter)    //finding the blogId & return the array form with the data.
        console.log(filterByQuery)
        if(filterByQuery.length == 0){
            return res.status(404).send({status:false, msg:"No blog found to delete"})
        }    
        const authorIdFromParam = req.params.authorId
        for (let i=0; i<filterByQuery.length; i++){
            let authorIdFromBlog = filterByQuery[i].authorId.toString()   
            console.log(authorIdFromBlog)
            if (authorIdFromBlog == authorIdFromParam){     // for similar authorId from param & blogModel to delete
                const deletedDetails = await blogModel.findOneAndUpdate(
                    filter,
                    {isDeleted : true, deletedAt : new Date()},   //isDeleted will be true & update the date at deletedAt.
                    {new : true})   
                res.status(201).send({status:true, data:deletedDetails})
                break
            }else {
                return res.status(401).send({status : false, msg : "This is not your blog, you can not delete it."})
            }
        }
    }
    catch(err) {
        console.log(err)
        res.status(500).send({status:false, msg: err.message})
        }
}
    

const getAllBLogs = async function(req, res) {
    const getBlogs = await blogModel.find()
    res.send({msg: getBlogs})
}




module.exports.createBlog = createBlog
module.exports.getBlog = getBlog
module.exports.updateBlog = updateBlog
module.exports.deleteBlogById = deleteBlogById
module.exports.deleteBlogByQuery = deleteBlogByQuery
module.exports.getAllBLogs = getAllBLogs;