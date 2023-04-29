const { mailer } = require("../mailer");
const Batch = require("../models/Batch");
const Inventory = require("../models/Inventory");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Retailer = require("../models/Retailer");
const { randString, SKUGenerator } = require("../utils");
const { createBatch } = require("./product");

const PDFDocument = require("pdfkit-table");
const Table = require('pdfkit-table');
const fs = require('fs');

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
            const uniqueString = randString();
            const createdUser = await Retailer.create({
                name, email, phone, address, password, businessName, businessType, uniqueString 
            })

            mailOptions = {
                from: process.env.MAIL_USER,
                to: email,
                subject: 'Email Confirmation',
                html: `Click <a href=${process.env.MAIL_URL}/${uniqueString}>here</a> to verify your email. Thanks`
            };

            mailer(mailOptions)

            if (createdUser) {
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
      console.log(req.user);
      // Validate fields
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
        inventory.batchId = batch._id;
        inventory.buyingPrice = buyingPrice;
        inventory.sellingPrice = sellingPrice;
        inventory.quantity = quantity;
        await inventory.save();
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
        createdBy: retailerId
        });
        await existingBatch.save();
    } else {
        // If the batch already exists, update the existing batch
        existingBatch.MRP = MRP;
        existingBatch.mfgDate = mfg;
        existingBatch.expiryDate = expiry;
        await existingBatch.save();
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
        // If the inventory already exists, update the existing inventory record
        inventory.buyingPrice = buyingPrice;
        inventory.sellingPrice = sellingPrice;
        inventory.quantity = quantity;
        await inventory.save();
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
          products[productIndex].batchIds.push(batchId._id);
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

      console.log(batches[0]);
      batches = batches.map(obj=>{
        return {id: obj.batchId.id,
        batchNo: obj.batchId.batchNo,
        MRP: obj.batchId.MRP,
        mfg: obj.batchId.mfgDate,
        expiry: obj.batchId.expiryDate,
        productName: obj.batchId.product.name,
        quantity: obj.quantity,
        isUpdateAllowed: obj.createdBy == retailerId
        }
      })
      res.status(200).json({batches});
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
    const { receiverId, products } = req.body;

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
      products,
    })

    const orderDetails = await Order.findById(order._id).populate('receiver').populate('products.batchId').populate({
      path: 'products.batchId',
      populate: {
        path: 'product',
        model: 'Product'
      }
    })
    .exec();;
    
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
      .select('-createdAt -__v')
      .exec();

      let orderDetails =  [];
      orders.forEach(order => {
        var detail = {
          id : order.id,
          status : order.status,
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

   




  