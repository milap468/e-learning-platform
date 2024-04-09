import express from "express"
const app = express();
const PORT = process.env.PORT || 3000
import cors from "cors"
import cookieParser from "cookie-parser";
import userRoutes from './controllers/user.js'
import profileRoutes from './controllers/userProfile.js'
import courseRoutes from './controllers/course.js';
import enrollmentsRoutes from './controllers/userEnrollments.js'
import authenticationMiddleware from './middlewares/authentication.js'


import prisma from "./prisma.js"
import bcrypt from "bcrypt"


app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use(express.static("public"))



app.use('/users',userRoutes);

// app.post('/create-superadmin',async function (req,res) {
//     const body = req.body;

//     const password = await bcrypt.hash(body.password,10)

//     const superadmin = await prisma.user.create({
//         data : {
//             fullName : body.fullName,
//             email : body.email,
//             password : password,
//             superAdmin : true,
//         }
//     })

//     return res.json({superadmin})

// })

app.use(authenticationMiddleware);

app.use('/user',profileRoutes);

app.use('/courses',courseRoutes);

app.use('/enroll',enrollmentsRoutes)

app.get('/', function (req,res) {

    res.send(req.user)
} )



app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}.`)
})