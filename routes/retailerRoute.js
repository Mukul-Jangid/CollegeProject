const express = require('express');
const { getRetailerById, signup,signin, getAllTransactionsOfARetailer } = require('../controllers/retailer');
const { createTransaction } = require('../controllers/transaction');
const router= express.Router();

router.param('retailerId',getRetailerById);
router.route('/retailer/signup').post(signup)
router.route('/retailer/signin').post(signin)
router.route('/retailer/create_transaction/:retailerId').post(createTransaction)
router.route('/retailer/transactions/:retailerId').get(getAllTransactionsOfARetailer)
module.exports = router;