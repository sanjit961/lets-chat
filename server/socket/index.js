const express = require("express");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const http = require("http");
const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const UserModel = require("../models/UserModel");
const {
  ConversationModel,
  MessageModel,
} = require("../models/ConversationModel");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

const onlineUser = new Set();

io.on("connection", async (socket) => {
  console.log("User connected", socket.id);
  try {
    const token = socket.handshake.auth.token;
    const user = await getUserDetailsFromToken(token);

    if (!user) {
      socket.disconnect();
      return;
    }

    // Create a room and track online users
    socket.join(user?._id?.toString());
    onlineUser.add(user?._id?.toString());

    io.emit("onlineUser", Array.from(onlineUser));

    socket.on("message-page", async (userId) => {
      try {
        // Ensure the userId is valid
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
          console.error("Invalid userId");
          return;
        }
    
        // Proceed with fetching the user and conversation data
        const userDetails = await UserModel.findById(userId).select("-password");
    
        const payload = {
          _id: userDetails?._id,
          name: userDetails?.name,
          email: userDetails?.email,
          online: onlineUser.has(userId),
          profile_pic: userDetails?.profile_pic,
        };
        socket.emit("message-user", payload);
    
        // Fetch conversation messages
        const getConversationMessages = await ConversationModel.findOne({
          $or: [
            { sender: user?._id, reciever: userId },
            { sender: userId, reciever: user?._id },
          ],
        })
          .populate({
            path: "messages",
            options: { sort: { updatedAt: -1 }, limit: 50 },
          });
    
        socket.emit("message", getConversationMessages?.messages || []);
      } catch (error) {
        console.error("Error fetching user or messages:", error);
      }
    });
    

    // Handle new message
    socket.on("new-message", async (data) => {
      try {
        // Check if sender and receiver are valid ObjectIds
        if (!data?.sender || !data?.reciever) {
          console.error("Sender or receiver is missing or invalid");
          return;
        }
    
        // Ensure both sender and receiver are valid ObjectIds
        const isSenderValid = mongoose.Types.ObjectId.isValid(data.sender);
        const isReceiverValid = mongoose.Types.ObjectId.isValid(data.reciever);
    
        if (!isSenderValid || !isReceiverValid) {
          console.error("Invalid ObjectId for sender or receiver");
          return;
        }
    
        // Check conversation for both users
        let conversation = await ConversationModel.findOne({
          $or: [
            { sender: data?.sender, reciever: data?.reciever },
            { sender: data?.reciever, reciever: data?.sender },
          ],
        });
    
        if (!conversation) {
          conversation = await new ConversationModel({
            sender: data?.sender,
            reciever: data?.reciever,
          }).save();
        }
    
        const message = new MessageModel({
          text: data.text,
          imageUrl: data.imageUrl,
          videoUrl: data.videoUrl,
          msgByUserId: data?.msgByUserId,
        });
    
        const saveMessage = await message.save();
    
        await ConversationModel.updateOne(
          { _id: conversation?._id },
          { $push: { messages: saveMessage._id } }
        );
    
        // Only fetch messages once
        const getConversationMessages = await ConversationModel.findOne({
          _id: conversation?._id,
        })
          .populate("messages")
          .sort({ updatedAt: -1 });
    
        // Emit to both sender and receiver
        io.to(data?.sender).emit("message", getConversationMessages.messages);
        io.to(data?.reciever).emit("message", getConversationMessages.messages);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });
    

    // Handle sidebar conversations
    socket.on("sidebar", async (currentUserId) => {
      try {
        const currentUserConversation = await ConversationModel.find({
          $or: [{ sender: currentUserId }, { reciever: currentUserId }],
        })
          .sort({ updatedAt: -1 })
          .populate("messages")
          .populate("sender")
          .populate("reciever");

        const conversation = currentUserConversation.map((conv) => {
          const countUnSeenMsg = conv.messages.reduce(
            (prev, curr) => prev + (curr.seen ? 0 : 1),
            0
          );

          return {
            _id: conv?._id,
            sender: conv?.sender,
            reciever: conv?.reciever,
            unSeenMsg: countUnSeenMsg,
            lastMsg: conv?.messages[conv?.messages?.length - 1],
          };
        });

        socket.emit("conversation", conversation);
      } catch (error) {
        console.error("Error fetching sidebar data:", error);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      onlineUser.delete(user?._id);
      console.log("User disconnected", socket.id);
    });
  } catch (error) {
    console.error("Error during connection:", error);
  }
});

module.exports = {
  app,
  server,
};
