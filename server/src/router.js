import { Router, json } from 'express'
import { BalanceModel } from './models/balance.js';
import { UserModel } from './models/user.js';
import { savingModel } from './models/savings_goal.js';
import mongoose from 'mongoose';
import { transactionModel } from './models/transactions.js';

const router=Router();

router.patch('/dashboard/transfer', async (req, res, next) => {
  const user = req.user;
  try {
    const existingUser = await BalanceModel.findOne({ username: user.username });
    if (!existingUser) {
      return res.status(401).json({message:"user Not found"});
    }

    const targetAccount = await BalanceModel.findOne({ username: req.body.username });
    if (!targetAccount) {
      return res.status(401).json({message:"user Not found"});
    }

    const transferAmount = req.body.amount;
    const savingGoals = await savingModel.find({
      username: user.username,
    });

    if (existingUser.balance >= transferAmount) {
      // Debit the transfer amount from the balance.
      existingUser.balance -= transferAmount;

      // Create a transaction record for the debit.
      const transaction = new transactionModel({
        _id: new mongoose.Types.ObjectId(),
        username: existingUser.username,
        transaction_type: "debit",
        amount: transferAmount,
        balance: existingUser.balance,
        sendTo:targetAccount.username,
        created_at: Date.now(),
      });
      await transaction.save();

      // Credit the transfer amount to the target account.
      targetAccount.balance += transferAmount;

      // Create a transaction record for the credit.
      const transaction1 = new transactionModel({
        _id: new mongoose.Types.ObjectId(),
        username: targetAccount.username,
        transaction_type: "credit",
        amount: transferAmount,
        balance: targetAccount.balance,
        sendTo:targetAccount.username,
        created_at: Date.now(),
      });
      await transaction1.save();

      // Save the updated balance and target account.
      await existingUser.save();
      await targetAccount.save();

      res.json({message:"Transfer success"});
    } else {
      let flag=false;
      // Check if the transfer amount is greater than the balance.
      if (transferAmount > existingUser.balance) {
        // Loop through all the savings goals.
        for (const savingGoal of savingGoals) {
          // Check if the total amount in the savings goal is greater than the transfer amount.
          if (savingGoal.Total_amount >= transferAmount) {
            // Debit the transfer amount from the savings goal.
            savingGoal.Total_amount -= transferAmount;
            // Create a transaction record for the debit.
            const transaction = new transactionModel({
              _id: new mongoose.Types.ObjectId(),
              username: existingUser.username,
              transaction_type: "debit",
              amount: transferAmount,
              balance: existingUser.balance,
              sendTo:targetAccount.username,
              created_at: Date.now(),
            });

            const transaction1 = new transactionModel({
              _id: new mongoose.Types.ObjectId(),
              username: targetAccount.username,
              transaction_type: "credit",
              amount: transferAmount,
              balance: targetAccount.balance,
              sendTo:targetAccount.username,
              created_at: Date.now(),
            });
            await transaction1.save();


            targetAccount.balance+=transferAmount;
            await transaction.save();
            await targetAccount.save();
            // Save the updated savings goal.
            await savingGoal.save();
            flag=true;
            break;
          }
        }
      }
      if(flag) return res.json({message:"success"})
      return res.json({message:"Insufficient Funds"})
    }
  } catch (err) {
    next(err);
  }
});




// .............................................

router.get('/dashboard/balance', async (req, res, next) => {
    const user = req.user;
    try {
        const existingUser = await BalanceModel.findOne({ username: user.username });

        if (!existingUser) {
            throw new Error('User not found');
        }

        // Check if the user requesting the balance is the same as the authenticated user
      
        res.json({ balance: existingUser.balance });
    } catch (err) {
        next(err);
    }
});


router.get('/dashboard/check-saving-goals-enable',async(req,res,next)=>{
  const currentUser=req.user;
  try{
    const balanceUser=await BalanceModel.findOne({username:currentUser.username})

    if(currentUser.username!=balanceUser.username){
      res.json('Invalid Access');
      return;
    }
    if(!balanceUser){
      res.status(404).send("User not found.");
      return;
    }
    const flag=balanceUser.isSavingsEnable;
    return res.json(flag);
    }catch(err){
      next(err);
    }
})


router.post('/dashboard/enable-saving-goals',async(req,res,next)=>{
    const currentUser=req.user;
    try{
      const balanceUser=await BalanceModel.findOne({username:req.body.username})

      if(currentUser.username!=balanceUser.username){
        res.json('Invalid Access');
        return;
      }
      if(!balanceUser){
        res.status(404).send("User not found.");
        return;
      }

      if(balanceUser.isSavingsEnable){
        res.json({message:"Already enabled"})
      }
      balanceUser.isSavingsEnable=true;
      await balanceUser.save();
      res.status(200).json({
        success: true,
        message: "Multiple saving goals feature enabled successfully.",
        });
      }catch(err){
        next(err);
      }
});



router.post('/dashboard/new-saving-goal', async (req, res, next) => {
  const currentUser = req.user;
  try {
    const balanceUser = await BalanceModel.findOne({ username: currentUser.username });

    if (!balanceUser) {
      res.status(404).send("User not found.");
      return;
    }

    if (!balanceUser.isSavingsEnable) {
      res.json({ message: "Please enable the feature to access" });
    }

    const existingGoal = await savingModel.findOne({ goal_name: req.body.goal_name });

    if (existingGoal) {
      return res.status(400).json({
        success: false,
        message: "Goal already exists",
      });
    }

    const amount_deposit = req.body.amount_deposit;

    if(req.body.goal_amount<amount_deposit){
      return res.json({message:"Amount cannot exceed Goal Amount"})
    }

    if (amount_deposit > balanceUser.balance) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    if(amount_deposit>req.body.goal_amount){
      return res.status(400).json({message:"Amount greater than goal"})
    }

    const remaining = req.body.goal_amount - amount_deposit;
    const Total_amount = req.body.goal_amount - remaining;

    const newGoal = new savingModel({
      username: currentUser.username,
      goal_name: req.body.goal_name,
      goal_amount: req.body.goal_amount,
      amount_deposit: amount_deposit,
      Total_amount: Total_amount,
      _id: new mongoose.Types.ObjectId(),
    });
    const payment=currentUser.username+req.body.goal_name;
    const transaction=new transactionModel({
      _id: new mongoose.Types.ObjectId(),
       username:currentUser.username,
       transaction_type: "debit",
       amount: amount_deposit,
       balance: balanceUser.balance-amount_deposit,
       sendTo:payment,
       created_at: Date.now(),
     });
     await transaction.save();
     balanceUser.balance-=amount_deposit;
     await balanceUser.save();
    await newGoal.save();
    res.status(200).json({
      success: true,
      message: "Goal added Successfully !!!!!",
    });
  } catch (err) {
    next(err);
  }
}); 


router.get('/dashboard/all-savings-goal',async(req,res,next)=>{
    const currentUser=req.user;
    try{
      const savingGoals = await savingModel.find({ username: currentUser.username }, {limit:100},{
        projection: {
          _id:false,
          goal_name: true,
          goal_amount:true,
          Total_amount:true,
          amount_required: true,
        },
      });

      if (!savingGoals) {
        res.status(404).json([]);
        return;
      }
      res.json(savingGoals);
      }catch(err){
        next(err);
      }
});
  

router.get('/dashboard/all-transaction',async(req,res,next)=>{
  const currentUser=req.user;
  try{
    const transaction = await transactionModel.find({ username: currentUser.username }, {limit:100},{
      projection: {
        _id:false,
        transaction_type: true,
        amount:true,
        balance:true,
        sendTo: true,
        created_at: true,
      },
    });

    if (!transaction) {
      res.status(404).json([]);
      return;
    }
    res.json(transaction);
    }catch(err){
      next(err);
    }
});

///tested api above///////////////////////////////////////////////
router.patch('/dashboard/update-money-saving-goal', async (req, res, next) => {
  const currentUser = req.user;
  try {
    const savingGoal = await savingModel.findOne({
      username: currentUser.username,
      goal_name: req.body.goal_name,
    });
    if (!savingGoal) {
      res.json({ message: "no goal found" });
      return;
    }
    const userbalance=await BalanceModel.findOne({username:currentUser.username})

    if(!userbalance){
      throw new Error()
    }



    const amount_deposit = req.body.amount_deposit;
    
    if(savingGoal.goal_amount-savingGoal.Total_amount<amount_deposit){
      return res.json({message:"Amount exceed the require Goal"})
    }

    if(userbalance.balance<amount_deposit){
      res.json({message:"insufficient funds in account "});
      return;
    }
    const remaining = savingGoal.goal_amount - amount_deposit;
    const newTotalAmount = savingGoal.goal_amount - remaining;
    savingGoal.Total_amount += newTotalAmount;
    if(savingGoal.Total_amount>=savingGoal.goal_amount){
      res.json({message:"Goal Reached ,withdrawal the money"})
    }


    userbalance.balance-=amount_deposit;

    const transaction=new transactionModel({
      _id: new mongoose.Types.ObjectId(),
       username:currentUser.username,
       transaction_type: "debit",
       amount: amount_deposit,
       balance:userbalance.balance,
       sendTo:currentUser.username+' '+savingGoal.goal_name,
       created_at: Date.now(),
     });
     await transaction.save();

    await userbalance.save();
    await savingGoal.save();
    res.json({message: "Total amount updated successfully"
    });
  } catch (err) {
    next(err);
  }
}); //test this //transaction

router.patch('/dashboard/withdrwal-money-sg', async (req, res, next) => {
  const currentUser = req.user;
  try {
    const savingGoal = await savingModel.findOne({
      username: currentUser.username,
      goal_name: req.body.goal_name,
    });
    if (!savingGoal) {
      res.json({ message: "No goal found" });
      return;
    }
    const existingUser=await BalanceModel.findOne({username:currentUser.username})
    if(!existingUser){
      throw new Error()
    }

    existingUser.balance+=savingGoal.Total_amount;
    savingGoal.Total_amount=0;

    const transaction=new transactionModel({
      _id: new mongoose.Types.ObjectId(),
       username:currentUser.username,
       transaction_type: "credit",
       amount: savingGoal.Total_amount,
       balance: existingUser.balance,
       sendTo:"goal_name withdrawal",
       created_at: Date.now(),
     });
     await transaction.save();
    
    await existingUser.save();


    try {
      await savingModel.findOneAndDelete({goal_name:req.body.goal_name});
    } catch (err) {
      if (err.code == 404) {
        res.json({ message: "no goal found" });
        return;
      } else {
        next(err);
      }
    }
    res.json({message: "Goal amount withdrawal successfully"
    });
  } catch (err) {
    next(err);
  }
});  //transaction


export default router