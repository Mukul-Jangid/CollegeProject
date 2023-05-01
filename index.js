require('dotenv').config();
const CookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors')
const Connection = require('./controllers/db');
const app = express();
const customerRoute = require('./routes/customerRoute');
const retailerRoute = require('./routes/retailerRoute');
const alertRoute = require('./routes/alertRoute')
const adminRoute = require('./routes/adminRoute');
const User = require('./models/User');
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(CookieParser());
app.use(cors())
// app.use('/api/v1',alertRoute)
// app.use('/api/v1',customerRoute);
app.use('/api/v1',adminRoute)
app.use('/api/v1',retailerRoute);

Connection();

app.get('/verify/:uniqueString', async(req, res)=>{
    const {uniqueString} = req.params
    const user = await User.findOne({uniqueString})
    if(user){
        user.isValid = true
        await user.save()
        res.status(200).send("<h1>Your email is verified, you can sign in now</h1>");

    }
    else{
        res.json('User not found')
    }
})


app.listen(5000, () => {
    console.log("server is running at port 5000");
})

