const Alert = require('../models/alert');
const User = require('../models/user');

exports.createAlert = async (req,res)=>{
    const {transaction, customerPhone, message} = req.body;
    const retailer = req.query.retailerId;
    if(!transaction || !customer || !message){
        return res.status(401).json({
            error:"All fields are required",
            success: false
        })
    }
    let customer = await User.find({phone: customerPhone});
    if(!customer){
        return res.status(422).json({
            error: "This User does not uses the app, Alert cannot be created!!!"
        })
    }
    alert = Alert.create({
        transaction,customer,retailer,message
    })
    if(alert){
       return res.status(200).json({
            message: "Alert created successfully"
        })
    }
    else{
        return res.status(404).json({
            error:"Some error occurred"
        })
    }
}

exports.createBulkAlert = async(req,res)=>{
    
}