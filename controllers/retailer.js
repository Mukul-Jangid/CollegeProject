const Retailer = require('../models/retailer');
const Transaction = require('../models/transaction');
const retailer = require('../models/retailer');

exports.getRetailerById = async (req, res, next, id) => {
    const retailer = await Retailer.findById({ _id: id })

    if (!retailer) {
        return res.status(400).json({
            error: "No Retailer found in DB"
        });
    }
    req.retailer = retailer
    next();
}

exports.signup = async (req, res) => {
    try {
        const { phone, shopName, password } = req.body;

        if (!phone || !shopName || !password) {
            return res.status(400).json({
                error: "All fields are required",
                success: false
            })
        }
        const check = await Retailer.findOne({
            phone: phone
        }, 'phone').exec();
        if (check) {
            return res.status(400).json({
                error: "Account Already Exists with this Phone",
                success: false
            })
        }
        else {
            const createdRetailer = await Retailer.create({
                shopName, phone, password
            })
            if (createdRetailer) {
                return res.status(200).json({
                    retailer:createdRetailer,
                    success:true
                })
            }
        }

    } catch (error) {
        console.log(error);
    }
}


exports.signin = async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
           return res.status(400).json({
                error: "All fields are required",
                success: false
            })
        }
        const retailer = await Retailer.findOne(phone)
        if (!retailer) {
           return res.status(400).json({
                error: "Account Not Found",
                success: false
            })
        }
        else {
            if(retailer.validatePassword()){
            return res.status(200).json({
                retailer:retailer,
                success:true
            })
            }
            else{
                return res.status(404).json({
                    error: "Wrong Password",
                    success: false
                })
            }
        }
    } catch (error) {

    }
}

exports.getAllTransactionsOfARetailer = async (req,res)=>{
    try {
        const transactions =await Transaction.find({retailer: req.retailer.id}).populate('customer').exec();
        res.status(200).json({
            success:true,
            transactions
        })
    } catch (error) {
        res.status(401).json({
            error:"Some error occured",
            success:false
        })
    }
}