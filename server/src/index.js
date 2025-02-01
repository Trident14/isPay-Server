import cors from 'cors'
import app from './server.js'
app.use(cors())

app.listen(3080||process.env.PORT,()=>{
    console.log("server running");
   
});

