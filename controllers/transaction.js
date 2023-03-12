const Transaction = require('../models/transaction');
const User = require('../models/user');

exports.createTransaction = async (req, res)=>{
    let {customerPhone, customerName, itemName, amount,paid, due,note} = req.body;
    let retailer = req.user.id
    let customer = await User.findOne({phone: customerPhone});
    if(!retailer || !customerPhone || !customerName || !itemName || !amount){
        return res.status(400).json({
            error: 'All Fields are required',
            success: false
        })
    }
    if(!paid){
        due=amount;
    }
    if(!due){
        paid=amount;
    }
    const transaction =  new Transaction({
        customerPhone, customerName, retailer,itemName, amount,paid, due,note
    })
    if(customer){
        transaction.customer = customer.id;
    }
    if(transaction.due == 0){
        transaction.status = 'inactive';
    } 
    await transaction.save();
    if(transaction){
        return res.status(200).json({
            transaction,
            success:true
        })
    }
}

exports.updateTransaction = async (req, res)=>{
    try {
        let {paid, note} = req.body;
        let transactionId = req.query.transactionId;
        const transaction = await Transaction.findById(req.query.transactionId).exec();
        console.log(transaction);
        if(transaction.amount<paid || transaction.due<paid){
            return res.status(200).json({
                error: "Please enter value less than amount and due",
                success: false
            })
        }
        transaction.paid = paid;
        transaction.due = transaction.amount-transaction.paid
        transaction.note = note
        if(transaction.due == 0)
            transaction.status = 'inactive';
        await transaction.save();
        // const transaction = Transaction.findByIdAndUpdate({id : req.query.transactionId},{paid:paid ,note:note})

        if(transaction){
          return res.status(200).json({
                transaction,
                success:true
            })
        }
        return res.status(401).json({
            error: "Some error occured",
            success:false
        })
    } catch (error) {
        console.log(error);
    }
}