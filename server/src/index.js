import mongoose from 'mongoose'
import app from './server.js'
import  * as dotenv from 'dotenv'
dotenv.config()

app.listen(3001,()=>{
    console.log("server running");
   
});

