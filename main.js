const { request, response } = require("express");
const express = require("express");

const ws = require('ws');


const app = express();


// 
const  wsServer = new ws.Server({noServer : true});


wsServer.on("connection", socet => {
    socet.on("message", message => {
        // here will check offer and answer
        console.log(`${message}`)
    });
});

const server = app.listen(3000, () => {
    console.log(
        "test"
    )
});


server.on("upgrade", (request, socket, head) => {
    wsServer.handleUpgrade(request, socket,  head, socket => {
        wsServer.emit('connection', socket, request);
    });
})