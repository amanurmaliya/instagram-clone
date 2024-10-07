// This is used for the chatting purpose

import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
export const sendMessage = async (req, res) => {
  try {
    // Sender ki id hum le lenge logged in user se
    const senderId = req.id;

    // Receiver ki id hum le lenge id params se
    const receiverId = req.params.id;

    // Getting the msg
    let { textMessage: message } = req.body;
    // console.log(message);
    // console.log(senderId);
    // console.log(receiverId);
    if (!receiverId) {
      return res
        .status(400)
        .json({ success: false, message: "Receiver ID is missing" });
    }
    // isse mere sender aur receiver mil jayenge
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    // Agar aaj tak conversation nahi huaa hai dono ke beech me toh mai usse stablish kar dunga
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }
    // console.log(senderId);
    // Ab connection ban chuka hai toh naya message bhej dete hain
    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
    });

    if (newMessage) {
      // Har baar jitne naye message aa rahe hon unhe push karte jao
      conversation.messages.push(newMessage._id);
    }

    /*
      ya toh ek ek karke save kar lo
      i.e., await conversation.save()
      await newMessage.save()  
      ya toh change kar lo mtlb ye hai ki ek  saath save kar lo 
    */
    await Promise.all([conversation.save(), newMessage.save()]);

    // Implement SocketIO for real time data transfer
    const ReceiverSocketId = getReceiverSocketId(receiverId);

    if (ReceiverSocketId) {
      io.to(ReceiverSocketId).emit("newMessage", newMessage);
    }
    // console.log(newMessage);
    return res.status(200).json({
      success: true,
      message: "Message to the receiver has been sended SuccessFully",
      newMessage,
    });
  } catch (error) {
    console.log("The Message Cannot Be Send Due to: ", error);
  }
};
// Ye Message bhejne ke liye tha

// Message Receive karne ke liye controller
export const getMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    // console.log(senderId, receiverId);
    // Getting the real participants
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");

    // Agar aaj tak koi conversation start nahi huyi hai toh empty array return kar do
    if (!conversation) {
      return res.status(200).json({
        success: true,
        message: [], // Emppty array return kar do mtlb ki kai message nahi hai in dono ke beech ne
      });
    }

    // console.log(conversation?.messages);

    return res.status(200).json({
      success: true,
      messages: conversation?.messages,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Sorry Cannot Get the user messages",
    });
  }
};
