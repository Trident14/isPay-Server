import mongoose from "mongoose";


const savingGoalSchema=new mongoose.Schema({
    "username":{
        "type":String,
        "required":true,
    },
    "goal_name":{type:String},
    "goal_amount":{type:Number},
    "amount_deposit":{type:Number},
    "Total_amount":{type:Number},
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        autoIncrement: true,
      },
});
    savingGoalSchema.index({ username: 1 });
    savingGoalSchema.index({ goal_name: 1 });
export const savingModel=mongoose.model("savings_goal",savingGoalSchema);