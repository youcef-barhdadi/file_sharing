const { request, response } = require("express");
const express = require("express");
const  ejs = require('ejs');

const ws = require('ws');


const app = express();
app.use(express.static('public'));


app.set('view engine', 'ejs');




app.get('/', (req, res)=> {

    res.render("index.ejs")
});



let users = {};



// 
const  wss = new ws.Server({noServer : true});




wss.on('connection', function(connection) {
  
    console.log("User connected");
     
    //when server gets a message from a connected user
    connection.on('message', function(message) { 
       console.log(`${message}`)
       var data; 
       //accepting only JSON messages 
       try {
          data = JSON.parse(message); 
       } catch (e) { 
          console.log("Invalid JSON"); 
          data = {}; 
       } 
         
       //switching type of the user message 
       switch (data.type) { 
          //when a user tries to login 
             
          case "login": 
             console.log("User logged", data.name); 
                 
             //if anyone is logged in with this username then refuse 
             if(users[data.name]) { 
                sendTo(connection, { 
                   type: "login", 
                   success: false 
                }); 
             } else { 
                //save user connection on the server 
                users[data.name] = connection; 
                connection.name = data.name; 
                     
                sendTo(connection, { 
                   type: "login", 
                   success: true 
                }); 
             } 
                 
             break; 
                 
          case "offer": 
             //for ex. UserA wants to call UserB 
             console.log("Sending offer to: ", data.name); 
                 
             //if UserB exists then send him offer details 
             var conn = users[data.name];
                 
             if(conn != null) { 
                //setting that UserA connected with UserB 
                connection.otherName = data.name; 
                     
                sendTo(conn, { 
                   type: "offer", 
                   offer: data.offer, 
                   name: connection.name 
                }); 
             } 
                 
             break;  
                 
          case "answer": 
             console.log("Sending answer to: ", data.name); 
             //for ex. UserB answers UserA 
             var conn = users[data.name]; 
                 
             if(conn != null) { 
                connection.otherName = data.name; 
                sendTo(conn, { 
                   type: "answer", 
                   answer: data.answer 
                }); 
             } 
                 
             break;  
                 
          case "candidate": 
             console.log("Sending candidate to:",data.name); 
             var conn = users[data.name];  
                 
             if(conn != null) { 
                sendTo(conn, { 
                   type: "candidate", 
                   candidate: data.candidate 
                });
             } 
                 
             break;  
                 
          case "leave": 
             console.log("Disconnecting from", data.name); 
             var conn = users[data.name]; 
             conn.otherName = null; 
                 
             //notify the other user so he can disconnect his peer connection 
             if(conn != null) { 
                sendTo(conn, { 
                   type: "leave" 
                }); 
             }  
                 
             break;  
                 
          default: 
             sendTo(connection, { 
                type: "error", 
                message: "Command not found: " + data.type 
             }); 
                 
             break; 
       }  
    });  
     
    //when user exits, for example closes a browser window 
    //this may help if we are still in "offer","answer" or "candidate" state 
    connection.on("close", function() { 
     
       if(connection.name) { 
       delete users[connection.name]; 
         
          if(connection.otherName) { 
             console.log("Disconnecting from ", connection.otherName);
             var conn = users[connection.otherName]; 
             conn.otherName = null;  
                 
             if(conn != null) { 
                sendTo(conn, { 
                   type: "leave" 
                });
             }  
          } 
       } 
    });  
     
    connection.send("Hello world"); 
     
 });  
 
 function sendTo(connection, message) { 
    connection.send(JSON.stringify(message)); 
 } 
const server = app.listen(9090, () => {
    console.log(
        "test"
    )
});


server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket,  head, socket => {
        wss.emit('connection', socket, request);
    });
})