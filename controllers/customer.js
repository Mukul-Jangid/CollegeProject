const Customer = require('../models/customer');
const Transaction = require('../models/transaction');

exports.getCustomerById = async (req, res, next, id) => {
    const customer = await Customer.findById({ _id: id })

    if (!customer) {
        return res.status(400).json({
            error: "No User found in DB"
        });
    }
    req.customer = customer
    next();
}

exports.signup = async(req, res) => {
    try {
        const { phone, name, password } = req.body;

        if (!phone || !name || !password) {
            return res.status(400).json({
                error: "All fields are required",
                success: false
            })
        }
        const check = await Customer.findOne({
            phone: phone
        }, 'phone').exec();
        if (check) {
            return res.status(400).json({
                error: "Customer Account Already Exists with this Phone",
                success: false
            })
        }
        else {
            const customer = await Customer.create({
                name, phone, password
            })
            return res.status(200).json({
                customer:customer,
                success:true
            })
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
        const customer = await Customer.findOne({phone:phone})
        if (!customer) {
           return res.status(400).json({
                error: "Account Not Found",
                success: false
            })
        }
        else {
            return res.status(200).json({
                customer:customer,
                success:true
            })
        }
    } catch (error) {
        console.log(error);
    }
}

exports.getAllTransactionsOfCustomer = async (req,res) =>{
    try{
        let transactions =await Transaction.find({customer:req.customer.id}).populate('retailer').exec()
        res.status(200).json({
            success:true,
            transactions
        })
    }catch(error){
        console.log(error);
        res.status(401).json({
            error: "Some error occured",
            success:false
        })
    }
}