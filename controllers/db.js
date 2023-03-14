const mongoose =require('mongoose');

const Connection=()=>{
    mongoose.connect("mongodb://127.0.0.1:27017",{
        useNewUrlParser:true,
        useUnifiedTopology:true
    }).then(console.log('DB Connected'))
    .catch(err=>{console.log(err)
    process.exit(1)})
}

module.exports=Connection;