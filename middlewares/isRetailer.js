exports.isRetailer = async (req,res,next)=>{
    if(req.user.role == "Retailer"){
        next();
    }
    else{
        res.status(401).json({
            error:"You are not authorized as a Retailer",
            success:false
        })
    }
}