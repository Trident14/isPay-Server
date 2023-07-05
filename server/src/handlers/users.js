
import { UserModel } from "../models/user.js";
import { BalanceModel } from "../models/balance.js";
import { comparePassword, createJWT, hashPassword } from "../modules/auth.js";


export const createNewUser=async(req,res)=>{
    const existingUser = await UserModel.findOne({ username: req.body.username });
    const existingUserDB = await BalanceModel.findOne({ username: req.body.username });
        if (existingUser && existingUserDB) {
          return res.json({ message: 'Username already exists' });
        }
        
    const hash =await hashPassword(req.body.password)

   
    const User=new UserModel({
        username:req.body.username,
        password:hash
    })
    const UserDB=new BalanceModel({
        username:req.body.username,
        balance:0,

    })

    await User.save();
    await UserDB.save();
   
    res.json({message:"User Created Successfully"})
}


export const signin= async(req,res)=>{
    const user=await UserModel.findOne({username:req.body.username});
    if(!user){
        res.json('NAAAA')
    }
  
    const isValid=await comparePassword(req.body.password,user.password)
    
    if(!isValid){
        res.status(401)
        res.json('Nope, Password Wrong')
        return
    }
    const token=createJWT(user)
   
    const responseData=[
        {token:token},
        {isAdmin:user.isAdmin}
    ]
    res.json({token,username:user.username,isAdmin:user.isAdmin})
}

// export const balanceTransfer=async(req,res)=>{
//     const user=await BalanceModel.findOne({username:req.body.username});

// };