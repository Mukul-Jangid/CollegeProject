const express = require('express');
const { createTransaction, updateTransaction } = require('../controllers/transaction');
const router= express.Router();
const {signup,signin, getAllTransactionsOfRetailer, getUserById} = require('../controllers/user');
const { isRetailer } = require('../middlewares/isRetailer');
router.param('userId', getUserById);
router.route('/retailer/signup').post(signup)
router.route('/retailer/signin').post(signin)
router.route('/retailer/create_transaction/:retailerId').post(isRetailer,createTransaction)
router.route('/retailer/transactions/:retailerId').get(isRetailer,getAllTransactionsOfRetailer)
router.route('/retailer/update_transaction').put(isRetailer,updateTransaction)

module.exports = router;