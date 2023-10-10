import  Jwt  from "jsonwebtoken";
import UserModel from "../models/User.js";

const checkUserAuth=async (req,res, next)=>{
  let token
    const {authorization}=req.headers
   // Get token from Headers
    if(authorization&& authorization.startsWith('Bearer')){
    try{
         token=authorization.split(' ')[1]
       //token Varify
         const {userID}= Jwt.verify(token,process.env.JWT_SECRET_KEY);
         console.log("userId---->",userID)

         //Get user From token

         req.user=await UserModel.findById(userID).select("-password")
         next()

    }catch(err){
res.status(401).send({ "status":"Failed" ,"message":"Unauthorised User"})
    }
}
 if(!token){
    res.status(401).send({"status":"Failed","message":"Unauthorised User , no token"})
 }


}


export default checkUserAuth