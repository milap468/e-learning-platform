import prisma from "../prisma.js"

const userRoles = async function (req,res,next) {
    
    const currUserId = req.user?.userId;

    if (!currUserId) return res.status(403).json({'msg' : "Forbidden."});

    const currUser = await prisma.user.findUnique({
        where : {
            id : currUserId
        }
    })

    if (!currUser) return res.status(403).json({'msg' : "Forbidden."});

    if (!currUser.superAdmin) return res.status(403).json({'msg' : "Forbidden."});

    next()

}

export default userRoles;