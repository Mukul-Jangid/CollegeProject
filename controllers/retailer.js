const { mailer } = require("../mailer");
const Batch = require("../models/Batch");
const Inventory = require("../models/Inventory");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Retailer = require("../models/Retailer");
const Sell = require('../models/Sell');


const { randString, SKUGenerator } = require("../utils");
const { createBatch } = require("./product");

const PDFDocument = require("pdfkit-table");
const Table = require('pdfkit-table');
const fs = require('fs');
const { updateInventories } = require("./common");

exports.signup = async (req, res) => {
    try {
        const {name, email, phone, address, password ,businessName, businessType } = req.body;
        if (!phone || !name || !email || !address || !password || !businessName) {
            return res.status(400).json({
                error: "All fields are required",
                success: false
            })
        }
        const user = await Retailer.findOne({email: email, isValid: true}).exec();
        if (user) {
            return res.status(400).json({
                error: "Account Already Exists Please Sign in"
            })
        }
        else {
            const nonVerifiedUser = await Retailer.findOne({email: email, isValid: false}).exec();

            let createdUser = null;
            let uniqueString = null;
            if(!nonVerifiedUser){
              uniqueString = randString();
              createdUser = await Retailer.create({
                name, email, phone, address, password, businessName, businessType, uniqueString 
              })
            }

            mailOptions = {
                from: process.env.MAIL_USER,
                to: email,
                subject: 'Email Confirmation',
                html: `Click <a href=${process.env.MAIL_URL}/${uniqueString || nonVerifiedUser.uniqueString}>here</a> to verify your email. Thanks`
            };

            mailer(mailOptions)

            if (createdUser || nonVerifiedUser) {
                return res.status(200).json({"message": "Please verify your email, verification link has been sent to mail provided"})
                // TODO:What should we send from backend the JWTToken or user
            }
        }

    } catch (error) {
        console.log(error);
    }
}

exports.signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if retailer exists
    const retailer = await Retailer.findOne({email: email, isValid: true}).exec();
    if (!retailer) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Check if password matches
    if (!await retailer.validatePassoword(password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token

    res.status(200).json(retailer.getJwtToken());

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addBatchInRetailerInventory = async (req, res) => {
    try {
      const { batchNo, buyingPrice, sellingPrice, quantity } = req.body;
      const retailerId = req.user;

      if (!batchNo || !buyingPrice || !sellingPrice || !quantity) {
        return res
          .status(400)
          .json({ success: false, error: 'Please provide all required fields.' });
      }
      if (isNaN(buyingPrice) || isNaN(sellingPrice) || isNaN(quantity)) {
        return res
          .status(400)
          .json({ success: false, error: 'Please provide valid numbers for buyingPrice, sellingPrice, and quantity.' });
      }
  
      let batch = await Batch.findOne({ batchNo: batchNo }).exec();

      if (!batch) {
        batch = await createBatch(req, res);
      }
      else{
        return res.status(409).json({error:"Batch Exists with this batchNo"})
      }
  
      let inventory = await Inventory.findOne({
        batchId: batch._id,
        retailerId: retailerId,
      }).exec();
  
      if (!inventory) {
        inventory = await Inventory.create({
          retailerId: retailerId,
          batchId: batch._id,
          buyingPrice: buyingPrice,
          sellingPrice: sellingPrice,
          quantity: quantity,
        });
      } else {
        // inventory.batchId = batch._id;
        if(inventory.buyingPrice == buyingPrice && inventory.sellingPrice == sellingPrice){
          inventory.quantity = quantity + inventory.quantity;
          await inventory.save();
        }
        else{
          inventory = await Inventory.create({
            retailerId: retailerId,
            batchId: batch._id,
            buyingPrice: buyingPrice,
            sellingPrice: sellingPrice,
            quantity: quantity,
          });
        }
      }
  
      res.status(200).json(inventory);
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: error.message });
    }
};
  

exports.addBatchesToRetailerInventory = async (req, res) => {
try {
    const { batches } = req.body;
    const retailerId = req.user;

    // Loop through each batch in the request body
    for (const batch of batches) {
    // Validate the batch data
    const { productName, batchNo, productDescription, MRP, mfg, expiry, buyingPrice, sellingPrice, quantity } = batch;
    if (!productName || !batchNo || !MRP || !mfg || !expiry || !buyingPrice || !sellingPrice || !quantity) {
        throw new Error('Invalid batch data');
    }

    // Check if the product already exists


    // Check if the batch already exists for this product
    let existingBatch = await Batch.findOne({
        batchNo: batchNo
    });
    if (!existingBatch) {

        let product = await Product.findOne({ name: productName });
        if (!product) {
            // If not, create a new product
            product = new Product({
            name: productName,
            description: productDescription,
            sku: SKUGenerator(productName),
            createdBy: retailerId
            });
            await product.save();
        }

        // If not, create a new batch
        existingBatch = new Batch({
        product: product._id,
        batchNo: batchNo,
        MRP: MRP,
        mfgDate: mfg,
        expiryDate: expiry,
        createdBy: retailerId
        });
        await existingBatch.save();
    }
    else{
      continue;
    }
    // Check if the inventory already exists for this batch and retailer
    let inventory = await Inventory.findOne({ batchId: existingBatch._id, retailerId: retailerId });
    if (!inventory) {
        // If not, create a new inventory record
        inventory = new Inventory({
        retailerId: retailerId,
        batchId: existingBatch._id,
        buyingPrice: buyingPrice,
        sellingPrice: sellingPrice,
        quantity: quantity
        });
        await inventory.save();
    } else {
      if(inventory.buyingPrice == buyingPrice && inventory.sellingPrice == sellingPrice){
        inventory.quantity = quantity + inventory.quantity;
        await inventory.save();
      }
      else{
        inventory = await Inventory.create({
          retailerId: retailerId,
          batchId: existingBatch._id,
          buyingPrice: buyingPrice,
          sellingPrice: sellingPrice,
          quantity: quantity,
        });
      }
    }
    }

    res.status(200).json({ message: 'Batches added to inventory successfully' });
} catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to add batches to inventory' });
}
};


exports.myInventory = async (req, res) => {
    try {
      const retailerId = req.user;

      // Find all inventories for the retailer
      const inventories = await Inventory.find({ retailerId }).populate({
        path: 'batchId',
        populate: {
          path: 'product',
          model: 'Product'
        }
      }).exec();
      
      // Extract product information from each inventory
      const products = [];
      for (const inventory of inventories) {
        console.log(inventory);
        const { batchId, quantity} = inventory;
        const { name: productName } = batchId.product;
        const {batchNo} = batchId;

        // Check if product already exists in the products list
        const productIndex = products.findIndex(product => product.productName == productName);
        if (productIndex === -1) {
          // If product doesn't exist, add it to the list
          products.push({ batchIds:[batchId._id], productName, quantity});
        } else {
          // If product exists, update its quantity and MRP
          products[productIndex].quantity += quantity;

          if(!products[productIndex].batchIds.includes(batchId._id)){
            products[productIndex].batchIds.push(batchId._id);
          }
        }
      }
      
      // Return the list of unique products
      return res.status(200).json(products);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getBatchesByIds = async (req, res) => {
    try {
      const retailerId = req.user;
      const batchIds = req.query.ids // Get the batch IDs from the request parameters
      let batches = await Inventory.find({ batchId: batchIds }).populate({
        path: 'batchId',
        populate: {
          path: 'product',
          model: 'Product'
        }
      }).select('batchId quantity').exec();

      batches = batches.map(obj=>{
        return {id: obj.batchId.id,
        batchNo: obj.batchId.batchNo,
        MRP: obj.batchId.MRP,
        mfg: obj.batchId.mfgDate,
        expiry: obj.batchId.expiryDate,
        productName: obj.batchId.product.name,
        quantity: obj.quantity,
        buyingPrice: obj.buyingPrice,
        sellingPrice: obj.sellingPrice,
        isUpdateAllowed: obj.createdBy == retailerId
        }
      })
      res.status(200).json(batches);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
};


exports.updateBatch = async (req, res) => {
  try {
    // TODO: Only the quantity can be updated if user is not creator
    const { batchId } = req.query;
    const { MRP, mfg, expiry, quantity } = req.body;

    const obj = await Inventory.findOne({batchId: batchId}).populate('batchId')

    if (!obj) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    obj.batchId.MRP = MRP
    obj.batchId.mfgDate = mfg
    obj.batchId.expiryDate = expiry
    obj.quantity = quantity

    await obj.save();
    await obj.batchId.save();
    return res.status(200).json(obj);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { receiverId, products, totalAmount} = req.body;

    if (!receiverId) {
      return res.status(400).json({ error: 'Receiver ID is required.' });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'At least one product is required.' });
    }

    for (const product of products) {
      if (!product.batchNo) {
        return res.status(400).json({ error: 'Batch number is required for all products.' });
      }
      else{
        product.batchId = await Batch.findOne({batchNo: product.batchNo}).select('id');
        product.batchId = product.batchId._id
      }

      if (!product.quantity || product.quantity <= 0) {
        return res.status(400).json({ error: 'Quantity is required and should be greater than 0.' });
      }
    }
    console.log(products);

    const order = await Order.create({
      creator: req.user,
      receiver: receiverId,
      totalAmount : totalAmount,
      products,
    })

    const orderDetails = await Order.findById(order._id).populate('receiver').populate('products.batchId').populate({
      path: 'products.batchId',
      populate: {
        path: 'product',
        model: 'Product'
      }
    })
    .exec();
    
    const creatorDetails = await Retailer.findById(req.user);
    const receiverDetails = await Retailer.findById(receiverId);
    // Generate a PDF of the order data
    const pdfBuffer =  await createOrderPDF(orderDetails);
    console.log(receiverDetails);
    // Define the email message
    mailOptions = {
      from: process.env.MAIL_USER,
      to: 'mukul.jangid@metacube.com',
      //TODO: add order Receiver's mail
      subject: `Order received for your business ${receiverDetails.businessName}`,
      text: `You have received an order from ${creatorDetails.businessName}, Please see the attached PDF for details of the order.`,
      attachments: [{
        filename: `Order_${order._id}.pdf`,
        content: pdfBuffer
      }]};

  mailer(mailOptions)
  // console.log(orderDetails.products[0].batchId.product);

 

    return res.status(201).json({ order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
};

// Update an existing order by ID
// main use to cancel the order
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    console.log(order);
    // Update order properties
    if (req.body.status) {
      order.status = req.body.status;
    }
    if(req.body.status == 'inactive'){
      let batches = [];
      order.products.forEach(batch=>{
        let obj = {
          batchId: batch.batchId,
          batchNo: batch.batchNo,
          quantity: batch.quantity,
          price: batch.demandedPrice
        }
        batches.push(obj);
      })
      const sale = await Sell.create({
        fromRetailerId : order.receiver,
        toRetailerId : order.creator,
        batches : batches,
        totalPrice : order.totalAmount,
        paid : 0,
        due: order.totalAmount,
        // TODO: Update if we add an option to pay when order created
      });
      await updateInventories(fromRetailerId, toRetailerId, sale.batches)
    }
    // Save updated order to database
    const updatedOrder = await order.save();
    res.status(201).json({ message: 'Order updated successfully', order: updatedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

async function createOrderPDF(orderData) {

  const doc = new PDFDocument();
  doc.font('Helvetica-Bold');
  doc.fontSize(16);
  doc.text('Order Details', { align: 'center' });

  doc.moveDown();
  doc.font('Helvetica');
  doc.fontSize(12);

  const tableData = {
    headers: ['Product', 'Batch No', 'Quantity Required'],
    rows: []
  };

  orderData.products.forEach(product => {
    tableData.rows.push([product.batchId.product.name, product.batchNo, product.quantity]);
  });

  const table =  {
    headers: tableData.headers,
    rows: tableData.rows,
    x: 50,
    y: 150,
    width: 500,
    columnWidths: {
      0: 200,
      1: 150,
      2: 150
    },
    headerAlignment: 'left',
    rowAlignment: 'left'
  }
  await doc.table(table, { 
    columnsSize: [ 200, 100, 100 ],
  });
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });
}

exports.myOrders = async (req, res) => {
  try {
    const {isCreatedByUser} = req.query;
    let orderQuery = {creator : req.user}
    if(isCreatedByUser != null && isCreatedByUser == 'false'){
     orderQuery = {receiver : req.user}
     console.log(orderQuery);
    }
    const orders = await Order.find(orderQuery)
      .populate('creator', 'name businessName email')
      .populate('receiver', 'name businessName email')
      .populate({
        path: 'products.batchId',
        populate: {
          path: 'product',
          model: 'Product'
        },
      })
      .sort({createdAt: 'desc'})
      .exec();

      let orderDetails =  [];
      orders.forEach(order => {
        var detail = {
          id : order.id,
          status : order.status,
          createdAt : order.createdAt,
          total: order.totalAmount,
          products : []
        }
        if(isCreatedByUser != null && isCreatedByUser == false){
          detail.creator = order.creator
        }
        else{
          detail.recipent = order.receiver
        }
        order.products.forEach(prod => {
          detail.products.push({
            batchNo : prod.batchNo,
            quantity : prod.quantity,
            name : prod.batchId?.product.name,
            MRP : prod.batchId?.MRP,
            sellingPrice: prod.batchId?.sellingPrice
          })
        })
        orderDetails.push(detail);
      })

    return res.status(200).json(orderDetails);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
};






  