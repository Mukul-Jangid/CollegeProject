require('dotenv').config();
const CookieParser = require('cookie-parser');
const express = require('express');
const Connection = require('./controllers/db');
const app = express();
const customerRoute = require('./routes/customerRoute');
const retailerRoute = require('./routes/retailerRoute');
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(CookieParser());

app.use('/api/v1',customerRoute);
app.use('/api/v1',retailerRoute);
// app.use('/api/v1',alertRoute)
Connection();

app.listen(process.env.PORT, () => {
    console.log("server is running at port 5000");
})