const express = require('express');
const {getCustomerById,signin, signup, getAllTransactionsOfCustomer } = require('../controllers/customer');
const router= express.Router();

router.param("customerId",getCustomerById);
router.route('/customer/signup').post(signup)
router.route('/customer/signin').post(signin)
router.route('/customer/transactions/:customerId').get( getAllTransactionsOfCustomer);

module.exports = router;