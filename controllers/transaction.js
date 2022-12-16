const Transaction = require('../models/transaction')

exports.createTransaction = async (req, res)=>{
    let {customer,itemName, amount,paid, due,note} = req.body;
    let retailer = req.user.id
    if(!retailer || !customer || !itemName || !amount){
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
    const transaction = await Transaction.create({
       retailer, customer,itemName, amount,paid, due,note
    })
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
        transaction.paid = paid;transaction.due = transaction.amount-transaction.paid
        transaction.note = note
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