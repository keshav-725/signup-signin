require('dotenv').config();
const express = require('express');
const app = express();
require('./db/conn');
const path = require('path')
const jwt = require('jsonwebtoken')
const hbs = require('hbs')
const bcrypt = require("bcryptjs")
const cookieParser = require('cookie-parser')
const auth = require('./middleware/auth')
const port = process.env.PORT

const Register = require("./models/registers");
const { urlencoded } = require('express');

const static_path = path.join(__dirname,"../public")
const template_path = path.join(__dirname,"../templates/views")
const partial_path = path.join(__dirname,"../templates/partials")
app.use(express.static(static_path))
app.use(express.json())
app.use(cookieParser())
app.use(urlencoded({extended:false}))


app.set("view engine","hbs")
app.set("views",template_path)
hbs.registerPartials(partial_path)

app.get('/',(req,res)=>{
    res.render("index")
})

app.get('/verify',auth,async(req,res)=>{
    res.render("verify",{user:req.user})
})

app.get('/logout',auth,async(req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        res.clearCookie('jwt');
        await req.user.save;
        res.render("login")
    } catch (error) {
        res.status(500).send(error)
    }
})

app.get('/login',(req,res)=>{
    res.render("login")
})

app.post('/login',async(req,res)=>{
    try {
        const email = req.body.email
        const password = req.body.password
        
        const user = await Register.findOne({email});

        const isMatch = await bcrypt.compare(password,user.password);

        const token = await user.generateAuthToken();
        res.cookie("jwt",token,{
            expires:new Date(Date.now() + 300000),
            httpOnly:true
        })

        if(isMatch){
            res.status(201).render("verify")
        }
        else{
            res.send("password not matching")
        }

    } catch (error) {
        //res.status(400).send("invalid")
        console.log(error)
    }
})

app.get('/register',(req,res)=>{
    res.render("register")
})

app.post('/register',async(req,res)=>{
    try {
        const password = req.body.password;
        const confirmpassword= req.body.confirmpassword;
        if(password === confirmpassword){
            const registerUser = new Register({
                name : req.body.name,
                email:req.body.email,
                password:req.body.password,
                confirmpassword:req.body.confirmpassword,
                phone:req.body.phone
            })

            const token = await registerUser.generateAuthToken();

            res.cookie("jwt",token,{
                expires:new Date(Date.now + 300000),
                httpOnly:true
            })

            const register = await registerUser.save()
            res.status(201).render("verify")
        }else{
            res.send("not matching password")
        }
    } catch (error) {
        res.status(400).send(error)
    }
})

app.listen(port,function(){
    console.log('server is running at port 3000')
})