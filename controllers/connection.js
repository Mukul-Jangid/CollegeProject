const Connection = require("../models/Connection");


exports.createConnectionRequest = async (req, res) => {
  try {
    const requester = req.user;
    const {recipient, sourceType } = req.body;
    const connectionExists = await Connection.findOne({ requester, recipient });

    if (connectionExists) {
      return res.status(400).json({ message: 'Connection already exists' });
    }

    const newConnection = new Connection({ requester, recipient, sourceType });
    const savedConnection = await newConnection.save();

    res.status(201).json({ message: 'Connection request sent', connection: savedConnection });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create connection request' });
  }
};

exports.getMyConnections = async (req, res) => {
  try {
    const {status} = req.query;
    const myConnections = await Connection.find({
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
      status: status
    })
    .populate('requester', '_id name email')
    .populate('recipient', '_id name email')
    .exec();
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
  const { userId } = req.user; // Assuming userId is available in the request object after authentication
  
  try {
    // Find the connection by ID
    const connection = await Connection.findById(connectionId).populate('requester recipient');
    if (!connection) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    // Check if the user is authorized to update the connection status
    if (connection.recipient._id.toString() !== userId && connection.requester._id.toString() !== userId) {
      return res.status(401).json({ error: 'Unauthorized to update connection request status' });
    }

    // Update the connection status
    connection.status = status;
    await connection.save();

    // Send response with updated connection object
    res.json(connection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};



