const express = require('express');
const { createTransaction, updateTransaction } = require('../controllers/transaction');
const router= express.Router();
const {signup,signin, getAllTransactionsOfRetailer, getUserById, getUserByPhone, getCustomersOfRetailer, getCustomerTransactionsMadeByRetailer} = require('../controllers/user');
const { isRetailer } = require('../middlewares/isRetailer');
router.param('retailerId', getUserById);
router.route('/retailer/signup').post(signup)
// router.route('/retailer/signin').post(signin)
router.route('/retailer/create_transaction/:retailerId').post(getUserById,createTransaction)
router.route('/retailer/transactions/:retailerId').get(getUserById,getAllTransactionsOfRetailer)
router.route('/retailer/update_transaction').put(isRetailer,updateTransaction)
// router.route('/retailer/by_phone').get(isRetailer,getUserByPhone);
router.route('/retailer/customers/:retailerId').get(getUserById,getCustomersOfRetailer);
router.route('/retailer/customer/transactions/:retailerId').get(getCustomerTransactionsMadeByRetailer);
router.route('/user/by_phone').get(getUserByPhone);
module.exports = router;