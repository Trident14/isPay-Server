import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { UserModel } from '../models/user.js'
import { BalanceModel } from '../models/balance.js'

//cehckin pass 
export const comparePassword=(password,hash)=>{
    return bcrypt.compare(password,hash)
}


export const  hashPassword=(password)=>{
    return bcrypt.hash(password,10)
}
export const createJWT=(user)=>{
    const token =jwt.sign(
        {
            username:user.username,
            _id:user._id,
        },
        process.env.jwtScreat,
        {expiresIn:"1hr"}
        )
    return token;
}

//middleware to protect update balance only admin can update
export const protect2 = async(req, res, next) => {
    const bearer = req.headers.authorization;
  //geting bearer from header
    if (!bearer) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
  //splitting bearer into brearer +token as token is sent like-> Bearer "1234123412341234"
  //so token get val of "1234123412341234"
    const [, token] = bearer.split(' ');
  
    if (!token) {
      res.status(401).json({ message: 'Not a valid token' });
      return;
    }
    try {
        //we now decrvpt the token and find the username associate it with in Db and check if admin or not
        // if admin then we move to update route elss throw error
       
            const decodedToken = jwt.verify(token, process.env.jwtScreat);
        

        const user = await UserModel.findOne({username:decodedToken.username});
    
        if (!user || !user.isAdmin) {
            return res.status(401).json({message:"Not Authorised Admin"});
        //   res.status(401).json({ message: 'Not authorized as admin' });
        //   return;
        }
       // req.user = user;
        next();
      } catch (error) {
          
        console.error('Error validating token:', error);
        res.status(401).json({ message: 'Not a valid token' });
      }
 };
  

export const protect =(req,res,next) =>{
    const bearer=req.headers.authorization

    //checking if we have token or not
    if(!bearer){
        res.status(401)
        res.json({message:'not authorised'})
        return
    }

    //now we grab the token from bearer to check if it exist

    const [,token]=bearer.split(' ')
    if(!token){
        res.status(401)
        res.json({message:'not valid token'})
        return
    }
    // this verifis that the token sended is correct if yest then it allows to next handler 
    //or middleware otherwis we get error
    try{
        const user=jwt.verify(token,process.env.jwtScreat)
        req.user=user
        next()
    }catch(e){
        res.status(401)
        res.json({message:'not valid token'})
        return
    }
}