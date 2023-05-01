const Product = require("../models/Product");
const Fuse = require('fuse.js');
const { SKUGenerator } = require("../utils");
const Batch = require("../models/Batch");
const Inventory = require("../models/Inventory");

exports.createBatch = async (req, res) => {
  try {
    // Validate the request body
    const { productName, batchNo, productDescription, MRP, mfg, expiry } = req.body;
    if (!productName || !batchNo || !MRP || !mfg || !expiry) {
      throw new Error('Invalid request body');
    }

    // Check if the product already exists
    let product = await Product.findOne({ name: productName });
    if (!product) {
      // If not, create a new product
      product = new Product({
        name: productName,
        description: productDescription,
        sku: SKUGenerator(productName),
        createdBy: req.user
      });
      await product.save();
    }

    // Check if the batch already exists for this product
    let existingBatch = await Batch.findOne({
      product: product._id,
      batchNo: batchNo
    });
    if (!existingBatch) {
      // If not, create a new batch
      existingBatch = new Batch({
        product: product._id,
        batchNo: batchNo,
        MRP: MRP,
        mfgDate: mfg,
        expiryDate: expiry,
        createdBy: req.user
      });
      await existingBatch.save();
    } else {
      // If the batch already exists, update the existing batch
      existingBatch.MRP = MRP;
      existingBatch.mfgDate = mfg;
      existingBatch.expiryDate = expiry;
      await existingBatch.save();
    }
    return existingBatch;
  } catch (error) {
    console.log(error);
    throw error;
  }
};



exports.getAllProducts = async(req,res) => {
    try {
        const products = await Product.find();
        res.status(201).json(products);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
      }
}

exports.searchProduct = async (req, res) => {
  try {
    const { name } = req.query;

    const products = await Product.find().select('name');
    const options = {
        keys: ['name'],
        includeScore: true,
    };
    const fuse = new Fuse(products, options);
    const searchResults = fuse.search(name);
    const filteredResults = searchResults.map(({ item }) => item);

    return res.status(200).json(filteredResults);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getRetailerProducts = async (req, res) => {
  try {
    const retailerId = req.user;
    const inventories = await Inventory.find({ retailerId, quantity: { $gt: 1 } }).populate('batchId');

    // Create a map of product ids to product information
    const productMap = new Map();
    for (const inventory of inventories) {
      const product = await Product.findById(inventory.batchId.product);
      productMap.set(inventory.batchId.id, {
        name: product.name,
        sellingPrice: inventory.sellingPrice,
        MRP: inventory.batchId.MRP,
        batchNo: inventory.batchId.batchNo,
        quantityAvailable: inventory.quantity
      });
    }

    // Create a list of unique products the retailer has
    const retailerProducts = [...productMap.values()];

    return res.status(200).json(retailerProducts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
