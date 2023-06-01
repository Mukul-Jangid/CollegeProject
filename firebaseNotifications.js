var admin = require('firebase-admin');
var serviceAccount = require('./firebaseCred.json');

exports.sendPushNotifications = (payload, registrationToken)=>{
    var options = {
        priority: "high", 
        timeToLive: 60 * 60
    }
    //main function which sends messages.
    
    admin.messaging().sendToDevice(registrationToken, payload, options)
        .then(function (response) {
            console.log("successfully sent message : ", response)
        }).catch( (error)=> {
            console.log(error);
            console.log("didn't work");
    });
}