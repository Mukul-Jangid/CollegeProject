const Transaction = require('../models/transaction')

exports.createTransaction = async (req, res)=>{
    let {customer,itemName, amount,paid, due} = req.body;
    let retailer = req.retailer.id
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
       retailer, customer,itemName, amount,paid, due
    })
    if(transaction){
        return res.status(200).json({
            transaction,
            success:true
        })
    }
}