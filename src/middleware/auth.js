const jwt = require('jsonwebtoken')
const Register = require('../models/registers')

const auth = async (req,res,next)=>{
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token,process.env.SECRET_KEY)
        const user = await Register.findOne({_id:verifyUser._id})
        console.log(user.name)
        req.user = user
        req.token = token
        next()
    } catch (error) {
        //res.status(401).send(error)
        res.render("index")
    }
}

module.exports = auth
