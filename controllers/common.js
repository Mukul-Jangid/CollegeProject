const BusinessType = require("../models/BusinessType");
const Stock = require("../models/Stock");

exports.createBusinessTypes = async (req, res) => {
  try {
    const businessTypes = req.body.businessTypes;
    
    const savedBusinessTypes = await BusinessType.insertMany(businessTypes);

    res.status(201).json({
      message: 'Business types created successfully!',
      businessTypes: savedBusinessTypes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllBusinessTypes = async (req, res) => {
  try {
    const businessTypes = await BusinessType.find();

    res.status(200).json(businessTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.updateInventories = async(fromRetailerId, toRetailerId, batches)=> {
  try {
    const updatePromises = batches.map(async (batch) => {
      const { batchId, quantity, price } = batch;
      await Stock.updateOne(
        { batch: batchId, retailer: fromRetailerId },
        { $inc: { quantity: -quantity } }
      );
      await Stock.updateOne(
        { batch: batchId, retailer: toRetailerId, buyingPrice: price },
        { $inc: { quantity: quantity } },
        { upsert: true }
      );
    });
    await Promise.all(updatePromises);

  } catch (error) {
    console.error(error);
    throw new Error('Failed to update inventories');
  }
}

