require("dotenv").config();

const db = require("../db/models");
const ChatGroup = db.ChatGroup;

// CREATE - สร้างข้อมูลใหม่
exports.createChatGroup = async (req, res, next) => {
  try {
    const { name, user_id, modelai_id } = req.body;
    const createChatGroup = await ChatGroup.create({
      name,
      user_id,
      modelai_id
    });

    return res.json(createChatGroup);
  } catch (error) {
    console.error("Error creating ChatGroup:", error);
  }
};
