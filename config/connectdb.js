import mongoose from "mongoose";

 const connectDB=async(DATABASE_URL)=>{
    try{
 const DB_OPTIONS={
    dbName:"geekshop"
 }
   await mongoose.connect(DATABASE_URL,DB_OPTIONS)
     console.log("connection Successfully.....")
    }catch(err){
console.log("error",err)
    }

}


  


  
  export default connectDB
  