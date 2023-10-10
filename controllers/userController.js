import UserModel from "../models/User.js";
import bcrypt from "bcrypt";
import  Jwt from "jsonwebtoken";
import nodemailer from 'nodemailer'
//import transporter from "../config/emailConfig.js";

class UserController{
    static userRegistration = async (req, res) => {
   //   console.log("req---->",req.body)
        const { name, email, password, password_confirmation, tc } = req.body
        const user = await UserModel.findOne({ email: email })
        if (user) {
          res.send({ "status": "failed", "message": "Email already exists" })
        } else {
          if (name && email && password && password_confirmation && tc) {
            if (password === password_confirmation) {
              try {
                const salt = await bcrypt.genSalt(10)
                const hashPassword = await bcrypt.hash(password, salt)
                 
                const doc = new UserModel({
                  name: name,
                  email: email,
                  password: hashPassword,
                  tc: tc
                })
                await doc.save()
                const saved_user = await UserModel.findOne({ email: email })
                // Generate JWT Token
               const token = Jwt.sign({ userID: saved_user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' })
                res.status(201).send({ "status": "success", "message": "Registration Success", "token":token })
              } catch (error) {
                console.log(error)
                res.send({ "status": "failed", "message": "Unable to Register" })
              }
            } else {
              res.send({ "status": "failed", "message": "Password and Confirm Password doesn't match" })
            }
          } else {
            res.send({ "status": "failed", "message": "All fields are required" })
          }
        }
      }

      static userLogin = async (req, res) => {
        try {
          const { email, password } = req.body
          if (email && password) {
            const user = await UserModel.findOne({ email: email })
            if (user !=null) {
              
              const isMatch = await bcrypt.compare(password, user.password)
              console.log("harish--s")
              if ((user.email === email) && isMatch) {
                // Generate JWT Token
                const token = Jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' })
                res.send({ "status": "success", "message": "Login Success", "token": token })
              } else {
                res.send({ "status": "failed", "message": "Email or Password is not Valid" })
              }
            } else {
              res.send({ "status": "failed", "message": "You are not a Registered User" })
            }
          } else {
            res.send({ "status": "failed", "message": "All Fields are Required" })
          }
        } catch (error) {
          console.log(error)
          res.send({ "status": "failed", "message": "Unable to Login" })
        }
      }

      static changeUserPassword=async (req,res)=>{

        const {password,password_confirmation}=req.body;

        if(password&&password_confirmation){
            if(password!==password_confirmation){
              res.send({ "status": "failed", "message": "New password and Confirm password is not match " })
            }else{
              const salt = await bcrypt.genSalt(10)
              const newhashPassword = await bcrypt.hash(password, salt) 
              await UserModel.findByIdAndUpdate(req.user._id,{$set:{password:newhashPassword}})
              res.send({ "status": "success", "message": "Password Changed Successfully" })  
            }
        }else{
          res.send({ "status": "failed", "message": "All Fields are Required" }) 
        }
      }

      static loggedUser=async (req,res)=>{

        res.send({"user":req.user})
      }

      static sendUserPasswordResetMail=async(req,res)=>{

          const {email}=req.body;
          if(email){
            const user = await UserModel.findOne({ email: email });
            console.log("user--------->",user._id)
            if(user){
             // const user = await UserModel.findOne({ email: email });
              
            const secret=user._id+process.env.JWT_SECRET_KEY
            const token=Jwt.sign({userID:user._id},secret,{expiresIn:"15m"})  
            //front ent Link
            const link=`http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`
            console.log(link)

           // // Send Email
           let transporter = nodemailer.createTransport({
            
          service:"gmail", 
          auth: {
            user:process.env.EMAIL_FROM,
            pass: process.env.EMAIL_PASSWORD, 
          },
        })
        let info = await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: "GeekShop - Password Reset Link",
          html: `<a href=${link}>Click Here</a> to Reset Your Password`
        })
        .then((info)=>console.log(`successfully send ${JSON.stringify(info)}`))
            res.send({"status":"success","message":"Paaword reset Email send On Your Email .....Please Check Your Email",info:"info"})
            }else{
              res.send({"status":"failed","message":"Email does not Exist"})
            }
          }else{
            res.send({"status":"Failed","message":"email is Required"})
          }
      }

      static userPasswordReset=async (req,res)=>{
       const {password,password_confirmation}=req.body;

       const {id,token}=req.params;
       const user=await UserModel.findById(id);
       const new_token=user._id+process.env.JWT_SECRET_KEY;
       try{
        Jwt.verify(token,new_token)
        if(password&&password_confirmation){
          if(password===password_confirmation){
            const salt = await bcrypt.genSalt(10)
            const hashPassword = await bcrypt.hash(password, salt);
            await UserModel.findByIdAndUpdate(user._id,{$set:{password:hashPassword}})
              res.send({ "status": "success", "message": "Password Reset Successfully" }) 
          }else{
            res.send({"status":"failed","message":"password and conform password does not match"})
          }
        }else{
          res.send({"status":"failed","message":"All fields are Required"})
        }
       }catch(err){
        return res.send({"status":"Failed","message":"Invalid token"})

       }
      }
}


export default UserController