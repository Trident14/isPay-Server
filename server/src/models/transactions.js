import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    _id: { type: mongoose.ObjectId, autoIncrement: true },
    username: { type: String, required: true },
    transaction_type: { type: String, required: true },
    amount: { type: Number, required: true },
    balance: { type: Number, required: true },
    sendTo:{type:String,require:true},
    created_at: { type: Date, default: Date.now() },
  });

  export const transactionModel=new mongoose.model('transactions',transactionSchema);