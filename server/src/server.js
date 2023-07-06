import express from 'express'
import router from './router.js';
import { protect, protect2 } from './modules/auth.js';
import mongoose from 'mongoose'
import { createNewUser, signin } from './handlers/users.js';
import { DeleteCustomer, updateBalance } from './handlers/admin.js';

const app=express();

mongoose.connect(process.env.DBkey)

app.use(express.json())
app.use(express.urlencoded({extended:true}))


app.get('/',(req,res)=>{
    res.status(200)
    res.json({message:"hellooooo"})
})
//this route is protected
app.use('/api',protect, router)

app.post('/register',createNewUser)
app.post('/login',signin)

app.patch('/updateBalance',protect2,updateBalance)
//this is a error handler, this gets trigger if a error is thrown
/* throw new Error('hell0') like this in any route handler so this gets trigger  */
app.delete('/delete',protect2,DeleteCustomer)



app.use((err, req, res, next) => {

    res.json({message:"Somthing went wrong"})
  
    let statusCode = 500; // Internal Server Error
    if (err instanceof mongoose.Error) {
      statusCode = 400; // Bad Request
    } 
  
    res.status(statusCode).json({ error: err.message });
  });
  
export default app;