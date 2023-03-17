const User = require('../models/user');
const Transaction = require('../models/transaction');
const mongoose = require('mongoose')
exports.getUserById = async (req, res, next, id) => {
    const user = await User.findById({ _id: id })
    if (!user) {
        return res.status(400).json({
            error: "No User found in DB"
        });
    }
    req.user = user
    next();
}
exports.getUserByPhone = async (req,res)=>{
    try {
        const user = await User.findOne({phone: req.body.phone || req.query.phone});
        console.log(user);
    if(user){
        return res.status(200).json(user)
    }
    return res.status(404).json({
        error:"User not found",
        success: false
    })
    } catch (error) {
        console.log(error);
    }
}
exports.signup = async (req, res) => {
    try {
        const { name, address ,phone,role, shopName, password } = req.body;
        console.log("Signup");
        if (!phone || !name) {
            return res.status(400).json({
                error: "All fields are required",
                success: false
            })
        }
        const check = await User.findOne({
            phone: phone
        }, 'phone').exec();
        if (check) {
            return res.status(400).json({
                error: "Account Already Exists with this Phone",
                success: false
            })
        }
        else {
            const createdUser = await User.create({
                name, address, shopName, phone, password, role
            })
            console.log(createdUser);
            if (createdUser) {
                return res.status(200).json(createdUser)
            }
        }

    } catch (error) {
        console.log(error);
    }
}
exports.getAllTransactionsOfRetailer = async (req,res)=>{
    try {
        const transactions =await Transaction.find({retailer: req.user.id}).populate('customer').exec();
        res.status(200).json(
            transactions)
    } catch (error) {
        res.status(401).json({
            error:"Some error occured",
            success:false
        })
    }
}

exports.getAllTransactionsOfCustomer = async (req,res) =>{
    try{

        let transactions =await Transaction.find({customerPhone: req.query.customerPhone}).populate('retailer').exec()
        console.log(transactions);
        res.status(200).json(
            transactions)
    }catch(error){
        console.log(error);
        res.status(401).json({
            error: "Some error occured",
            success:false
        })
    }
}

exports.getCustomersOfRetailer = async (req,res) =>{
    try {
       let customers =  await Transaction.aggregate([
        { "$match": { "retailer":  new mongoose.Types.ObjectId(req.user.id)} },
        {
        $group: {
          _id: {
            key1: "$customerPhone",
          },
          object: {
            $first: "$$ROOT"
          }
        }
      }])
       customers = customers.map(customer=>{ return {customerName: customer.object.customerName, customerPhone: customer.object.customerPhone}});
        res.status(200).json(customers)
    } catch (error) {
        console.log(error);
        res.status(401).json({
            error: "Some error occured"
            // ,
            // success:false
        })
    }
}

exports.getRetailersOfCustomer = async (req,res)=>{
    try {
        let retailers = await Transaction.aggregate([
            {"$match": {"customer": new mongoose.Types.ObjectId(req.user.id)}},
            {"$match": {"customer": new mongoose.Types.ObjectId(req.user.phone)}},
            {
                $group: {
                    _id: {
                      key1: "$retailer",
                    },
                    object: {
                      $first: "$$ROOT"
                    }
                  }
            }
        ])
        retailers = retailers.map(ret=> ret.object);
        retailers = await User.populate(retailers, {path: 'retailer'})
        retailers = retailers.map(ret => {
           ret.retailer.role = undefined;
           return ret.retailer; 
        });
        // retailers = retailers.populate('retailer');
        return res.status(200).json(retailers)
    } catch (error) {
        console.log(error);
    }
}

exports.getCustomerTransactionsMadeByRetailer = async(req,res) =>{
    try {
        let transactions = await Transaction.find({customerPhone: req.query.customerPhone, retailer: req.user.id});
        res.status(200).json(transactions)
    } catch (error) {
        console.log(error);
        res.status(401).json({
            error: "Some error occured",
            success:false
        })
    }
}