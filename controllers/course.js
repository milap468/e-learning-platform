import express from "express"
import prisma from "../prisma.js"
import userRoles from "../middlewares/authorization.js"
import {number, z} from "zod"

import { Level } from "@prisma/client"
import { Popularity } from "@prisma/client"

const router = express.Router();

const PAGE_SIZE = 5

const LEVEL = z.nativeEnum(Level)
const POPULARITY = z.nativeEnum(Popularity)

// This is a API for getting courses. Features 1. Filtering (level,popularity,category) 2. Pagination 

router.route('/get-courses').get(async function (req,res) {
    
    const pageNumber = Number(req.query.pageNumber) || 0;
    const {success} = LEVEL.safeParse(req.query.level);
    const body = POPULARITY.safeParse(req.query.popularity)

    let difficultyLevel = req.query.level

    let popular = req.query.popularity

    if (!success) difficultyLevel = "Easy"

    if (!body.success) popular = "Popular"

    const category = Number(req.query.category);

    if (isNaN(pageNumber)) return res.status(400).json({'msg' : "Bad Inputs."})

    const skip = (pageNumber)*PAGE_SIZE

    const courses = await prisma.courseToCategory.findMany({
        skip : skip,
        take : PAGE_SIZE,
        where : {
            categoryId : category
        },
        include : {
            course : true
        }
    })

    let filterdCourses = courses.filter((item) => item.course.level === difficultyLevel || item.course.popular === popular);
    
    return res.status(200).json({filterdCourses})

})


// Routes for admin.

// Zod validation for course body.

const courseBody = z.object({
    name : z.string(),
    description : z.string(),
    level : z.nativeEnum(Level),
    price : z.number().optional(),
    popular : z.nativeEnum(Popularity).optional()
})

// This is a Course creation API.

router.route('/create-course').post(userRoles,async function (req,res) {
    const {success} = courseBody.safeParse(req.body);

    if (!success) return res.status(400).json({'msg' : "Bad Inputs."});

    const newCourse = await prisma.course.create({
        data : {
            name : req.body.name,
            description : req.body.description,
            level : req.body.level,
            price : req.body.price || 0.0,
            popular : req.body.popular || "NotPoppular"
        }
    })
    
    return res.status(201).json({'msg' : "Course Created."})
})


// Zod Validation for course update body.

const updateCourseBody = z.object({
    name : z.string().optional(),
    description : z.string().optional(),
    level : z.nativeEnum(Level).optional(),
    price : z.number().optional(),
    popular : z.nativeEnum(Popularity).optional()
})

// This is a Course Update API

router.route('/update-course/:courseId').put(userRoles,async function (req,res){
    const courseId = Number(req.params.courseId)

    if (isNaN(courseId)) return res.status(400).json({'msg' : "Bad Inputs"})

    const {success} = updateCourseBody.safeParse(req.body);

    if (!success) return res.status(400).json({'msg' : "Bad Inputs."});

    const existingCourse = await prisma.course.findUnique({
        where : {
            id : courseId
        }
    });

    if (!existingCourse) return res.status(400).json({'msg' : "Course not found."});

    const updateCourse = await prisma.course.update({
        where : {
            id : courseId
        },
        data : {
            name : req.body.name || existingCourse.name,
            description : req.body.description || existingCourse.description,
            level : req.body.description || existingCourse.level,
            price : req.body.price || existingCourse.price,
            popular : req.body.popular || existingCourse.popular
        }
    })

    console.log(updateCourse);

    return res.status(201).json({'msg' : "Course Updated Successfully."})

})

// This is a Course delete API.

router.route('/delete-courses/:courseId').delete(userRoles,async function (req,res) {

    const courseId = Number(req.params.courseId);

    console.log(courseId);

    console.log(isNaN(courseId));

    if (isNaN(courseId)) return res.status(400).json({'msg' : "Bad Inputs"})

    const course = await prisma.course.delete({
        where : {
            id : courseId
        }
    });

    return res.status(200).json({'msg' : "Course deleted Successfully."});

})

const categoryBody = z.object({
    name : z.string()
})

router.route('/create-category').post(userRoles,async function (req,res){
    const {success} = categoryBody.safeParse(req.body);

    if (!success) return res.status(400).json({'msg' : "Bad Inputs."});

    const category = await prisma.category.create({
        data : {
            name : req.body.name
        }
    })

    return res.status(201).json({category})

})

router.route('/course-to-category').post(userRoles,async function (req,res){
    const body = req.body;
    
    const courseCat = await prisma.courseToCategory.create({
        data : {
            courseId : req.body.courseId,
            categoryId : req.body.categoryId
        }
    })

    return res.status(201).json({courseCat})
})


export default router;