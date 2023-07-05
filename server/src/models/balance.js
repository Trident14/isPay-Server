import mongoose from "mongoose";
const BalanceSchema=new mongoose.Schema({
    "username": {
      "type": "string",
      "required": true
    },
    "balance": {
      "type": "number"
    },
    isSavingsEnable:{
      type:Boolean,
      default:false,
    }
  });

  export const BalanceModel=mongoose.model("balance",BalanceSchema);
  