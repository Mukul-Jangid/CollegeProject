const BusinessType = require("../models/BusinessType");

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


