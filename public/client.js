var connection = new WebSocket('ws://localhost:9090'); 


connection.onmessage = function (message) { 
    console.log("Got message", message.data);
    var data = JSON.parse(message.data); 
     
    switch(data.type) { 
       case "login": 
          onLogin(data.success); 
          break; 
       case "offer": 
          onOffer(data.offer, data.name); 
          break; 
       case "answer": 
          onAnswer(data.answer); 
          break; 
       case "candidate": 
          onCandidate(data.candidate); 
          break; 
       default: 
          break; 
    } 
 };
   
 //when a user logs in 
 function onLogin(success) { 
 
    if (success === false) { 
       alert("oops...try a different username"); 
    } else { 
       //creating our RTCPeerConnection object 
         
       var configuration = { 
          "iceServers": [{ "url": "stun:stun.1.google.com:19302" }] 
       }; 
         
       myConnection = new webkitRTCPeerConnection(configuration); 
       console.log("RTCPeerConnection object was created"); 
       console.log(myConnection); 
   
       //setup ice handling
       //when the browser finds an ice candidate we send it to another peer 
       myConnection.onicecandidate = function (event) { 
         
          if (event.candidate) { 
             send({ 
                type: "candidate", 
                candidate: event.candidate 
             }); 
          } 
       }; 
    } 
 };
   
 connection.onopen = function () { 
    connection.send(JSON.stringify({type : "youcef"})); 
    console.log("Connected"); 
 };
   
 connection.onerror = function (err) { 
    console.log("Got error", err); 
 };
   
 // Alias for sending messages in JSON format 
 function send(message) { 
 
    if (connectedUser) { 
       message.name = connectedUser; 
    } 
     
    connection.send(JSON.stringify(message)); 
 };





