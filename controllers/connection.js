const { mailer } = require("../mailer");
const Connection = require("../models/Connection");
const Retailer = require("../models/Retailer");
const Fuse = require('fuse.js');

exports.createConnectionRequest = async (req, res) => {
  try {
    const requester = req.user;
    const {recipient, sourceType } = req.body;
    const connectionExists = await Connection.findOne({ requester, recipient });

    if (connectionExists) {
      return res.status(400).json({ message: 'Connection already exists' });
    }
    const recipientUser = await Retailer.findById(recipient);
    const requesterUser = await Retailer.findById(requester).populate('businessType');
    const newConnection = new Connection({ requester, recipient, sourceType });
    const savedConnection = await newConnection.save();
    mailOptions = {
      from: process.env.MAIL_USER,
      to: recipientUser.email,
      subject: 'Connection request for your Digital payments book App',
      html: `<p>Dear ${recipientUser.name},</p>
             <p>You have received a connection request from:</p>
             <ul>
               <li>Name: ${requesterUser.name}</li>
               <li>Business Name: ${requesterUser.businessName}</li>
               <li>Business Type: ${requesterUser.businessType.name}</li>
               <li>Email: ${requesterUser.email}</li>
               <li>Phone: ${requesterUser.phone}</li>
             </ul>
             <p>Please confirm if you want to connect with them.</p>
             <p>Accepting the connection request will make trade between you a lot easier</p>
             <p>Regards,</p>
             <p>Team Digital Payments book app</p>`
    };
    mailer(mailOptions)
    res.status(201).json({ message: 'Connection request sent', connection: savedConnection });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create connection request' });
  }
};

exports.getMyConnections = async (req, res) => {
  try {
    const {status} = req.query;
    let myConnections = await Connection.find({
      $or: [{ requester: req.user}, { recipient: req.user }]
    }).where({status: status})
    .populate('requester', '_id name email')
    .populate('recipient', '_id name email')
    .exec();

    myConnections = myConnections.map(conn=>{
      return {
        id: conn.id,
        isCreatedByUser: conn.requester == req.user,
        user: conn.requester == req.user ? conn.recipient : conn.requester,
        sourceType:  conn.sourceType
      }
    })
    // TODO: Improve JSON response
    res.json(myConnections);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Controller to update connection request status
exports.updateConnectionStatus = async (req, res) => {
// TODO: test this properly
  const { connectionId } = req.params;
  const { status } = req.body;
  const recipient = req.user; // Assuming userId is available in the request object after authentication
  
  try {
    // Find the connection by ID
    const connection = await Connection.findById(connectionId).populate('requester recipient');
    if (!connection) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    // Check if the user is authorized to update the connection status
    if (connection.recipient._id.toString() != recipient) {
      return res.status(401).json({ error: 'Unauthorized to update connection request status' });
    }

    // Update the connection status
    connection.status = status;
    mailOptions = {
      from: process.env.MAIL_USER,
      to: connection.requester.email,
      subject: `Your connection request is ${connection.status}`,
      html: `<p>Dear ${connection.requester.name},</p>
             <p>Your connection request is ${connection.status} by:</p>
             <p>Business: ${connection.recipient.businessName}</p>
             <p>Owner: ${connection.recipient.name}</p>
             <p></p>
             <p></p>
             <p>Regards,</p>
             <p>Team Digital Payments book app</p>`
    };
    mailer(mailOptions);
    await connection.save();

    // Send response with updated connection object
    res.json(connection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.searchRetailers = async (req, res) => {
  try {
    const { advance_query } = req.query;
    const currentUser = req.user; // assuming user is authenticated and req.user contains the current user

    const options = {
      keys: ['name', 'email', 'businessName']
    };
    const retailers = await Retailer.find({ _id: { $ne: currentUser } }); // exclude the current user
    const fuse = new Fuse(retailers, options);
    const results = fuse.search(advance_query);

    return res.status(200).json(results);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};


