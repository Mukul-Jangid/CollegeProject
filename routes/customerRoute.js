const express = require('express');
const { getUserById, signin, signup, getAllTransactionsOfCustomer, getUserByPhone} = require('../controllers/user');
const router= express.Router();

router.param("customerId",getUserById);
router.route('/customer/signup').post(signup)
// router.route('/customer/signin').post(signin)
router.route('/customer/transactions').get(getAllTransactionsOfCustomer);
router.route('/customer/by_phone').get(getUserByPhone);
module.exports = router;