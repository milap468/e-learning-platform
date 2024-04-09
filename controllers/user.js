import express from "express"
import jwt from "jsonwebtoken";
import {z} from "zod"
import prisma from "../prisma.js"
import bcrypt from "bcrypt"
import sendEmail from "../utils/email.js";

const router = express.Router()

// Validation of regsiter data using zod Library.

const registerBody = z.object({
    fullName : z.string(),
    email : z.string().email(),
    password : z.string().min(8,"Password Must be 8 characters long.")

})

// This is a Register API for Registering a User to a Platform. 

router.route('/register').post(async function (req,res) {

    const {success} = registerBody.safeParse(req.body);
    
    if (!success) {
        res.status(400).json({
            msg : "Bad Inputs"
        })
    }

    const existingUser =  await prisma.user.findUnique({
        where : {
           email : req.body.email
        }
    })

    if (existingUser){
        res.status(400).json({
            'msg' : "Email already Exists."
        })
    }

    const password = await bcrypt.hash(req.body.password,10)
    console.log(password);

    const newUser = await prisma.user.create({
        data : {
            fullName : req.body.fullName,
            email : req.body.email,
            password : password
        }
    })

    const response = await sendEmail(newUser.email,"This is Confirmation Email for User Registeration.", '<p> This is a Email for letting you know that your account has been successfully created at our platform. Hope you enjoy our service. </p>')

    console.log(response);

    res.status(201).json({'msg' : "User Registered Successfully"})
})


const loginBody = z.object({
    email : z.string().email(),
    password : z.string()
})


// This is a Login API for authenticates a User to a Platform. 

router.route('/login').post(async function (req,res) {

    const {success} = loginBody.safeParse(req.body);

    if (!success){
        return res.status(400).json({'msg' : "Something is wrong."})
    }

    const isUser = await prisma.user.findUnique({
        where : {
            email : req.body.email 
        }
    })

    if (!isUser){
        return res.status(400).json({'msg' : "User Not Found"})
    }

    const isPasswordMatched = await bcrypt.compare(req.body.password,isUser.password);

    console.log(isPasswordMatched);

    if (!isPasswordMatched){
        return res.status(401).json({'msg' : "You are not Authorized."})
    }

    const token = jwt.sign({userId : isUser.id,email : isUser.email, fullName : isUser.fullName},process.env.JWT_SECRET,{expiresIn : "1d"});

    const refresh_token = jwt.sign({userId : isUser.id},process.env.JWT_REFRESH_SECRET,{expiresIn : "15d"});

    await prisma.user.update({
        where : {
            id : isUser.id
        },
        data : {
            refresh_token : refresh_token
        }
    })

    res.cookie('jwt',refresh_token,{httpOnly : true, secure : true, maxAge : 15*24*60*60*1000});

    return res.status(200).json({'msg' : "Logged In Successfully", 'token' : token})

})

// This is a Refresh Token API for getting a new access token using refresh token.

router.route('/refresh-token').get(async function (req,res) {

    const cookies = req.cookies;

    if (!cookies?.jwt) return res.status(401).json({'msg' : "Forbidden"});

    const refresh_token = cookies.jwt;

    const foundUser = await prisma.user.findFirst({
        where : {
            refresh_token : refresh_token
        }
    });

    if (!foundUser) return res.status(403).json({'msg' : "Forbidden"});

    jwt.verify(refresh_token,process.env.JWT_REFRESH_SECRET,(err,user) => {

        if (err || foundUser.id != user.userId) return res.status(403).json({'msg' : "Forbidden"});

        const token = jwt.sign({userId : user.userId,email : foundUser.email, fullName : foundUser.fullName},process.env.JWT_SECRET,{expiresIn : "1d"});

        res.status(200).json({'token' : token})
    })

})


export default router;