const { hashPassword, comparePassword } = require("../utils/hash.js");
const { generateToken } = require("../utils/jwt.js");
const axios = require("axios");
const user = require("../db/models/user.js");
require("dotenv").config();

exports.signin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    console.log(username, password);

    // เตรียมข้อมูลก่อนส่ง
    const postData = {
      username: username,
      password: password,
    };

    // ส่ง username กับ password ไปตรวจสอบที่ onesqa
    try {
      // ถ้าระบบของ onesqa สามารถใช้งานได้
      const response = await axios.post(
        `${process.env.ONESQA_URL}/users/user_login`,
        postData,
        {
          headers: {
            Accept: "application/json",
            "X-Auth-ID": process.env.X_AUTH_ID,
            "X-Auth-Token": process.env.X_AUTH_TOKEN,
          },
        }
      );

      // ใช้งาน response.data ได้ที่นี่
      console.log("Success:", response.data);
      // ถ้าชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง
      if (response.data.result === 'fail') return res.status(400).json({ error: response.data.desc });

      // ตรวจสอบว่าชื่อผู้ใช้คนนี้ได้ทำการ backup ไว้หรือยัง
      const exists = await user.findOne({ where: { username } });
      // ถ้ายังให้ทำการ backup ข้อมูลเก็บไว้
      if (!exists) {

      }

      

    } catch (error) {
      // ถ้าระบบของ onesqa มีปัญหา
      console.error("Error:", error.response?.data || error);
    }

    res.json({
      status: "success",
      message: "Signin Success",
    });
  } catch (error) {
    console.log(error);
  }
};
