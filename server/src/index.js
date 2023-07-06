import mongoose from 'mongoose'
import cors from 'cors'
import app from './server.js'
app.use(cors())

app.listen(3001,()=>{
    console.log("server running");
   
});

