import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    chatId: {
  type: String,
  required: true,
},

  sender: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  time: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model("Message", messageSchema);

export default Message;