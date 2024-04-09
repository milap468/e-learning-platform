import express from "express"
import prisma from "../prisma.js";
import sendEmail from "../utils/email.js";

const PAGE_SIZE = 5

const router = express.Router();

router.route('/enroll-to-course').post(async function (req,res) {

    const user = req.user

    if (!user) return res.status(401).json({'msg' : "First Login to Enroll in the course."});

    const courseId = Number(req.body.courseId);

    if (isNaN(courseId)) return res.status(400).json({'msg' : "Bad Inputs."});

    const existingEnrollment = await prisma.enrollements.findUnique({
        where : {
            userId_courseId : {
                userId : user.userId,
                courseId : courseId
            }
        }
    })

    if (existingEnrollment) return res.json({'msg' : "You are already enrolled in this course."})

    const enrollment = await prisma.enrollements.create({
        data : {
            userId : user.userId,
            courseId : courseId
        },
        include : {
            course : true
        }
    })

    console.log(enrollment);

    const response = await sendEmail(user.email,"Course Enrollment Email",`<h1>Enrolled in ${enrollment.course.name}.<h1/> <p>You have successfully enrolled in the course. wish you a happy learning.</p>`)

    return res.status(201).json({'msg' : "Enrolled in Course."})

})


router.route('/view-enrolled-courses').get(async function (req,res) {

    const pageNumber = Number(req.query.pageNumber) || 0;

    if (isNaN(pageNumber)) return res.status(400).json({'msg' : "Bad Inputs."})

    const skip = (pageNumber)*PAGE_SIZE

    const user = req.user;

    if (!user) return res.status(401).json({'msg' : "You are not logged in."});

    const myCourses = await prisma.enrollements.findMany({
        skip : skip,
        take : PAGE_SIZE,
        where : {
            userId : user.userId
        },
        include : {
            course : true
        }
    })

    return res.status(200).json({myCourses})

})

export default router;