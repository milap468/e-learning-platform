import jwt from "jsonwebtoken";


const authenticationMiddleware = (req,res,next) => {

    console.log("Passed from Middleware.");

    const authHeader  = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({'msg' : "UnAuthorized"});
    }

    jwt.verify(token,process.env.JWT_SECRET, (err,user) => {
        if (err) res.status(403).json({'msg' : "UnAuthorized"});
        req.user = user;
        next();
    })
}

export default authenticationMiddleware;
