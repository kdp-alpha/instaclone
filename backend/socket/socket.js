const {Server} = require('socket.io');
const express = require('express');
const http = require('http')

const app = express();

const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin: process.env.URL,
        methods:['GET','POST']
    }
})

const userSocketMap = {};  //this map stores socket id corresponding the user id

const getreceiverSocketId = (receiverId) => userSocketMap[receiverId]

io.on('connection',(socket) => {
    const userId = socket.handshake.query.userId;
    if(userId){
        userSocketMap[userId] = socket.id
        console.log(`User id ${userId} : ${socket.id}` );
    }
    io.emit('getOnlineUser',Object.keys(userSocketMap))

    socket.on('disconnect',() => {
        if(userId){
            console.log(`User deleted id ${userId} : ${socket.id}` );
            delete userSocketMap[userId]
        }

        io.emit('getOnlineUser',Object.keys(userSocketMap))
    })
})

module.exports =  {app,server,io,getreceiverSocketId}