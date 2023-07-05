import mongoose from "mongoose";
import { UserModel } from "../models/user.js";
import { BalanceModel } from "../models/balance.js";
import { transactionModel } from "../models/transactions.js";
import {savingModel} from '../models/savings_goal.js'

export const updateBalance=async (req,res)=>{
    try{
    const existingUser = await UserModel.findOne({ username: req.body.username });
    const existingUserDB = await BalanceModel.findOne({ username: req.body.username });
    if (!existingUser || !existingUserDB) {
        return res.status(400).json({ error: 'NO User Found' });
    }
    const adminTransaction=new transactionModel({
      _id: new mongoose.Types.ObjectId(),
       username:existingUser.username,
       transaction_type: "credit",
       amount: req.body.newBalance,
       balance:  existingUserDB.balance+req.body.newBalance,
       sendTo:"Deposit at branch",
       created_at: Date.now(),
     });
     await adminTransaction.save();


    existingUserDB.balance+=req.body.newBalance;
    await existingUserDB.save();
   
  
    res.json({message:"update balance Success"})
    }catch(error){
        next(error)
    }
};

export const DeleteCustomer = async (req, res) => {

    try {
    const user = await BalanceModel.findOne({ username: req.body.username });
    const user1 = await UserModel.findOne({ username: req.body.username });
      if (!user || !user1) {
        return res.status(500).json({ message: "User not found" });
      }
        await BalanceModel.findOneAndDelete({ username: req.body.username});
        await UserModel.findOneAndDelete({ username: req.body.username });
        await transactionModel.deleteMany({ username:req.body.username });
        await savingModel.deleteMany({username:req.body.username});
        return res.json({message:"User Removed!"})

    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
};
