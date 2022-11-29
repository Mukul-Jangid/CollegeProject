const express = require('express');
const { getUserById, signin, signup, getAllTransactionsOfCustomer} = require('../controllers/user');
const router= express.Router();

router.param("customerId",getUserById);
router.route('/customer/signup').post(signup)
router.route('/customer/signin').post(signin)
router.route('/customer/transactions/:customerId').get(getAllTransactionsOfCustomer);

module.exports = router;