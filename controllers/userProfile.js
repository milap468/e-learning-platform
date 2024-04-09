import express from "express"
import prisma from "../prisma.js";
import { upload } from "../middlewares/multer.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const router = express.Router()

router.route('/profile').get(async function (req,res){

    const {email} = req.user;

    const currUser = await prisma.user.findUnique({
        where : {
            email : email
        }
    });

    res.json({
        id : currUser.id,
        fullName : currUser.fullName,
        email : currUser.email,
        avatar : currUser.avatar,
    })

})

router.route('/profile').put(upload.single('avatar'),async function (req,res) {
    const pic = req.file?.path;
    const body = req.body;

    const currUserId = req.user?.userId

    if (!currUserId) return res.status(403).json({'msg' : "Forbidden"});

    const response = await uploadOnCloudinary(pic)

    const secure_url = response?.secure_url

    const currUser = await prisma.user.findUnique({
        where : {
            id : currUserId
        }
    })

    if (!currUser) return res.send(403).json({'msg' : "Forbidden."})

    const updatedUser = await prisma.user.update({
        where : {
            id : currUserId
        },
        data : {
            email : body.email || currUser.email,
            fullName : body.fullName || currUser.fullName,
            avatar : secure_url || currUser.avatar
        }
    })

    return res.status(201).json({'msg' : "Profile Updated Successfully."})
})


export default router;