var admin = require('firebase-admin');
var serviceAccount = require('./firebaseCred.json');

exports.sendPushNotifications = (payload, registrationToken)=>{
    // var registrationTokenz = ["d9I0xiyeTv6n2gai3OcXzg:APA91bFzCVeamZuRqt4Hyj8r0SndcMb3gDs5PqjawsX11TiLmtLRUbntPatmL-i_iL8MX61Q39bA3AAiNDA7HSukh-VNfLaEHPwdP8ii0u-13tL23ldpy-NOPLBR3zv7GsAJcWsT_kr4"];
    // var payload = {
    //     notification: {
    //        title: "Test Notification",
    //        body: "SKIT is a c**m*ya college"
    //     }
    // };
    
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