const User = require('../models/user');
const Transaction = require('../models/transaction');

exports.getUserById = async (req, res, next, id) => {
    const user = await User.findById({ _id: id })

    if (!user) {
        return res.status(400).json({
            error: "No Retailer found in DB"
        });
    }
    req.user = user
    next();
}
exports.getUserByPhone = async (req,res)=>{
    try {
        const user = await User.findOne({phone: phone});
    if(user){
        return res.status(200).json({
            user,
            success:true
        })
    }
    return res.status(404).json({
        error:"User not found",
        success: false
    })
    } catch (error) {
        
    }
}
exports.signup = async (req, res) => {
    try {
        const { name, address ,phone,role, shopName, password } = req.body;

        if (!phone || !name || !password) {
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
            if (createdUser) {
                return res.status(200).json({
                    user:createdUser,
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
        const user = await User.findOne({phone: phone})
        if (!user) {
           return res.status(400).json({
                error: "Account Not Found",
                success: false
            })
        }
        else {
            if(user.validatePassword(password)){
            return res.status(200).json({
                user:user,
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
        console.log(error);
    }
}

exports.getAllTransactionsOfRetailer = async (req,res)=>{
    try {
        const transactions =await Transaction.find({retailer: req.user.id}).populate('customer').exec();
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

exports.getAllTransactionsOfCustomer = async (req,res) =>{
    try{
        let transactions =await Transaction.find({customer:req.user.id}).populate('retailer').exec()
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