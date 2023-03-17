require('dotenv').config();
const CookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors')
const Connection = require('./controllers/db');
const app = express();
const customerRoute = require('./routes/customerRoute');
const retailerRoute = require('./routes/retailerRoute');
const alertRoute = require('./routes/alertRoute')
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(CookieParser());
app.use(cors())
app.use('/api/v1',alertRoute)
app.use('/api/v1',customerRoute);
app.use('/api/v1',retailerRoute);
// app.use('/api/v1',alertRoute)
Connection();

app.listen(5000, () => {
    console.log("server is running at port 5000");
})