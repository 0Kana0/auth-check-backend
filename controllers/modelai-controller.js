require("dotenv").config();

const db = require("../db/models");
const ModelAi = db.ModelAi;

// READ - อ่านข้อมูลทั้งหมด
exports.getAllModelAi = async (req, res, next) => {
  try {
    const modelaiAll = await ModelAi.findAll();

    return res.json({
      data: modelaiAll,
    });
  } catch (error) {
    console.error("Error fetching ModelAi:", error);
  }
};

// READ by ID
exports.getModelAiById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const modelaiOne = await ModelAi.findByPk(id);

    return res.json({
      data: modelaiOne,
    });
  } catch (error) {
    console.error("Error fetching ModelAi:", error);
  }
};

// CREATE - สร้างข้อมูลใหม่
exports.createModelAi = async (req, res, next) => {
  try {
    const { name, tokenCount } = req.body;
    const createModelAi = await ModelAi.create({ name, tokenCount });

    return res.json(createModelAi);
  } catch (error) {
    console.error("Error creating ModelAi:", error);
  }
};

// UPDATE - แก้ไขข้อมูล
exports.updateModelAi = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { name, tokenCount } = req.body;

    const updateModelAi = await ModelAi.findByPk(id);
    if (!updateModelAi) {
      console.log("ModelAi not found");
      return res.json({ messge: "ModelAi not found" });
    }
    await updateModelAi.update({ name, tokenCount });

    return res.json(updateModelAi);
  } catch (error) {
    console.error("Error updating ModelAi:", error);
  }
};

// DELETE - ลบข้อมูล
exports.deleteModelAi = async (req, res, next) => {
  try {
    const id = req.params.id;
    const deleteModelAi = await ModelAi.findByPk(id);
    if (!deleteModelAi) {
      console.log("ModelAi not found");
      return res.json({ messge: "ModelAi not found" });
    }
    await ModelAi.destroy({
      where: { id: id }, // หรือ shorthand { id }
    });

    return res.json(true);
  } catch (error) {
    console.error("Error deleting ModelAi:", error);
  }
};
