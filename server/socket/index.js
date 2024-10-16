const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const UserModel = require("../models/UserModel");
const {
  ConversationModel,
  MessageModel,
} = require("../models/ConversationModel");

const app = express();

/**Socket io connection */

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

// Online user
const onlineUser = new Set();

io.on("connection", async (socket) => {
  console.log("connect user", socket.id);
  const token = socket.handshake.auth.token;
  //   Current user details
  const user = await getUserDetailsFromToken(token);

  //   console.log(user)
  //   console.log(token);

  // Create a room

  socket.join(user?._id.toString());
  onlineUser.add(user?._id?.toString());

  io.emit("onlineUser", Array.from(onlineUser));

  socket.on("message-page", async (userId) => {
    const userDetails = await UserModel.findById(userId).select("-password");

    const payload = {
      _id: userDetails?._id,
      name: userDetails?.name,
      email: userDetails?.email,
      online: onlineUser.has(userId),
      profile_pic: userDetails?.profile_pic,
    };

    socket.emit("message-user", payload);
  });

  

  // New message

  socket.on("new-message", async (data) => {
    // Check conversation for both user

    let conversation = await ConversationModel.findOne({
      $or: [
        { sender: data?.sender, reciever: data?.reciever },
        { sender: data?.reciever, reciever: data?.sender },
      ],
    });

    if (!conversation) {
      const createConversation = await ConversationModel({
        sender: data?.sender,
        reciever: data?.reciever,
      });
      conversation = await createConversation.save();
    }
    const message = new MessageModel({
      text: data.text,
      imageUrl: data.imageUrl,
      videoUrl: data.videoUrl,
      msgByUserId: data?.msgByUserId,
    });

    const saveMessage = await message.save();

    const updateConversation = await ConversationModel.updateOne(
      {
        _id: conversation?._id,
      },
      {
        $push: { messages: saveMessage._id },
      }
    );
    const getConversationMessages = await ConversationModel.findOne({
      $or: [
        { sender: data?.sender, reciever: data?.reciever },
        { sender: data?.reciever, reciever: data?.sender },
      ],
    })
      .populate("messages")
      .sort({ updatedAt: -1 });

    io.to(data?.sender).emit("message", getConversationMessages.messages);
    io.to(data?.reciever).emit("message", getConversationMessages.messages);
  });

  // Disconnect
  socket.on("disconnect", () => {
    onlineUser.delete(user?._id);
    console.log("disconnect user", socket.id);
  });
});

module.exports = {
  app,
  server,
};
