const express = require('express');
const { signup,signin, addBatchInRetailerInventory, addBatchesToRetailerInventory, myInventory,getBatchesByIds, updateBatch, createOrder, myOrders, updateOrder} = require('../controllers/retailer');
const { addProducts, getAllProducts, searchProduct, getRetailerProducts } = require('../controllers/product');
const { verifyToken } = require('../middlewares/verifyToken');
const { createConnectionRequest, getMyConnections, updateConnectionStatus, searchRetailers } = require('../controllers/connection');
const { getSales, createSale } = require('../controllers/sell');

const router= express.Router();
router.route('/retailer/signup').post(signup)
router.route('/retailer/signin').post(signin)
//Product routes
router.route('/retailer/product_list').get(getAllProducts);
router.route('/retailer/search_product').get(searchProduct);
// router.route('/retailer/add_products').post(verifyToken,addProducts);

// Retailer views his inventory or store
// He can view his inventory in which he will se each product name and its quantity there.
// He can search for a product and add in his inventory (Search API)
router.route('/retailer/my_inventory').get(verifyToken, myInventory);
router.route('/retailer/add_batch_to_inventory').post(verifyToken, addBatchInRetailerInventory);
router.route('/retailer/add_batches_in_bulk').post(verifyToken,addBatchesToRetailerInventory);
router.route('/retailer/get_batches_by_id').get(getBatchesByIds);//Returns product details of the inventory
router.route('/retailer/update_batch').put(updateBatch);

// Retailer creates order to other retailer
// in recipent list we will show my_connections APIs response parameter as recipent id
// then after selecting the recipent we will show response of product list api for that selected recipent
router.route('/retailer/retailer_products').get(verifyToken, getRetailerProducts);
router.route('/retailer/create_order').post(verifyToken, createOrder)
router.route('/retailer/my_orders').get(verifyToken, myOrders)
router.route('/retailer/update_order/:id').put(verifyToken, updateOrder)
// Retailer creates sell to other retailer and customer too
// in receiver list we will not restrict the Retailer for his connections/ same he can enter any email for customer 
// he can just enter the email and 
router.route('/retailer/my_sells').get(verifyToken, getSales)
router.route('/retailer/record_a_sell').post(verifyToken, createSale)

//My connections
router.route('/retailer/my_connections').get(verifyToken, getMyConnections)
router.route('/retailer/create_connection_req').post(verifyToken, createConnectionRequest)
router.route('/retailer/update_connection_req/:connectionId').put(verifyToken, updateConnectionStatus)
router.route('/retailer/search_retailers').get(verifyToken, searchRetailers);
module.exports = router;