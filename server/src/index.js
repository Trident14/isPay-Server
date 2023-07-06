import mongoose from 'mongoose'
import cors from 'cors'
import app from './server.js'
app.use(cors())

app.listen(process.env.PORT,()=>{
    console.log("server running");
   
});

