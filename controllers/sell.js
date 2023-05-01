const Sell = require('../models/Sell');

exports.createSale = async (req, res) => {
  try {
    const fromRetailerId = req.user;
    const { toRetailerId, isCustomerSale, customerEmail, batches, totalPrice, paid } = req.body;

    // Check if batches are empty
    if (batches.length === 0) {
      return res.status(400).json({ message: 'Batches cannot be empty' });
    }

    // Check if all required fields are present for each batch
    const invalidBatches = batches.filter(batch => !batch.batchId || !batch.quantity || !batch.price);
    if (invalidBatches.length > 0) {
      return res.status(400).json({ message: 'All batches must have batchId, quantity, and price fields' });
    }

    // Check if batch quantity is a positive integer
    const invalidQuantities = batches.filter(batch => !Number.isInteger(batch.quantity) || batch.quantity < 1);
    if (invalidQuantities.length > 0) {
      return res.status(400).json({ message: 'Batch quantity must be a positive integer' });
    }

    // Check if batch price is a positive number
    const invalidPrices = batches.filter(batch => batch.price <= 0);
    if (invalidPrices.length > 0) {
      return res.status(400).json({ message: 'Batch price must be a positive number' });
    }

    // Create the sale object
    const sale = new Sell({
      fromRetailerId,
      toRetailerId,
      isCustomerSale,
      customerEmail,
      batches,
      totalPrice,
      paid,
      due: totalPrice - paid,
    });

    // Save the sale object to the database
    const savedSale = await sale.save();

    res.status(201).json(savedSale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getSales = async (req, res) => {
  try {
    const retailerId =req.user;
console.log(retailerId);
    const sales = await Sell.find({
      fromRetailerId: retailerId
    })
    .populate('toRetailerId', 'name businessName email')
    .populate({
      path: 'batches.batchId',
      populate: {
        path: 'product',
        model: 'Product',
        select: '-createdAt -updatedAt -__v' // exclude unwanted fields from the product document
      }
    })
    .sort({ date: -1 })
    .select('-createdAt -__v')
    .exec();
    const salesJson = [];
    sales.forEach(sale => {
      let obj = {
        id: sale._id,
        toRetailer: sale.toRetailerId,
        isCustomerSale: sale.isCustomerSale,
        totalPrice: sale.totalPrice,
        paid: sale.paid,
        due: sale.due,
        date: sale.date,
        batches: []
      }
      sale.batches.forEach(batch=>{
        let obj2 = {
          batchNo: batch.batchNo,
          quantity: batch.quantity,
          sellingPrice: batch.price,
          MRP: batch.batchId.MRP,
          productName: batch.batchId.product.name
        }
        obj.batches.push(obj2);
      })
      salesJson.push(obj)
    })
    return res.status(200).json(salesJson);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};


