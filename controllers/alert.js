const Alert = require('../models/alert')

exports.createAlert = async (req,res)=>{
    const {transaction, customer, retailer, message} = req.body;
    if(!transaction || !customer || !retailer || !message){
        return res.status(401).json({
            error:"All fields are required",
            success: false
        })
    }
    alert = Alert.create({
        transaction,customer,retailer,message
    })
    if(alert){
       return res.status(200).json({
            message: "Alert created successfully",
            success:true
        })
    }
    else{
        return res.status(404).json({
            error:"Some error occurred"
        })
    }
}