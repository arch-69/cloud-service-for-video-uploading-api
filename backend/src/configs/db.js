import mongoose from "mongoose";

const connectDB = async () => {
    try{

        const instance = await mongoose.connect(process.env.MONGO_URI);

        console.log("mongoose db connected successfully");

    }catch(err){
        console.log("error occure ", err);
    }
}

export default connectDB;