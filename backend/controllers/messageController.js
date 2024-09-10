const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");
const {getreceiverSocketId,io} = require("../socket/socket");
const mongoose = require('mongoose')


const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const { textMessage:message } = req.body;

        let conversation = await Conversation.findOne({
            participants: { $all: [ senderId, receiverId ] }
        })

        //establish the conversation if not started yet. 
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            })
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            message
        })
        console.log(conversation)
        if(newMessage) conversation.message.push(newMessage._id)

        await Promise.all([conversation.save(),newMessage.save()]);

        //implmenet socketio for data trasnfer
        const receiverSocketId = getreceiverSocketId(receiverId)
        if(receiverSocketId){
            io.to(receiverSocketId).emit('newMessage',newMessage)
        }

        return res.status(201).json({
            success:true,
            newMessage
        })

    } catch (error) {
        console.log(error)
    }
}

const getMessage = async (req, res) => {
    try {
        const senderId = new mongoose.Types.ObjectId(req.id);
        const receiverId = new mongoose.Types.ObjectId(req.params.id);
        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate('message');

        if (!conversation) {
            return res.status(200).json({ success: true, messages: [] });
        }

        return res.status(200).json({
            success: true,
            messages: conversation.message
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}

module.exports ={sendMessage,getMessage}