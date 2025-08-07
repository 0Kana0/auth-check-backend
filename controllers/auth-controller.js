const axios = require("axios");
require("dotenv").config();
const { Op } = require("sequelize");
const moment = require("moment");

const { hashPassword, comparePassword } = require("../utils/hash.js");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt.js");
const { setOtp, verifyOtp } = require("../services/otp-service.js");
const transporter = require("../config/email-config.js")

const db = require("../db/models");
const User = db.User;
const RefreshToken = db.RefreshToken;

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
      if (response.data.result === "fail")
        return res.status(400).json({ error: response.data.desc });

      // ตรวจสอบว่าชื่อผู้ใช้คนนี้ได้ทำการ backup ไว้หรือยัง
      const exists = await User.findOne({ where: { username } });
      //console.log(exists);

      // ถ้ายังให้ทำการ backup ข้อมูลเก็บไว้
      if (!exists) {
        // บันทักข้อมูลผู้ใช่้งานลง db เพื่อ backup
        const hashed = await hashPassword(password);
        const user = await User.create({
          firstname: response.data.data.fname,
          lastname: response.data.data.lname,
          username: username,
          password: hashed,
          email: response.data.data.email,
          loginType: 'normal'
        });

        // สร้าง token
        const payload = { username: response.data.data.username, id: user.id };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // เก็บ refreshToken ใน db
        await RefreshToken.create({
          token: refreshToken,
          user_id: user.id,
          expiresAt: moment().add(7, "days").toDate(), // 7 วัน
        });

        // ส่ง refresh token ผ่าน cookie
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false, // ✅ ใช้ true ถ้าเป็น HTTPS
          sameSite: "strict",
          path: "/api/refresh-token",
        });

        return res.json({
          user: {
            username: response.data.data.username,
            firstname: response.data.data.fname,
            lastname: response.data.data.lname,
          },
          token: accessToken,
        });

        // ถ้ามีการ backup ข้อมูลเก็บไว้แล้ว
      } else {
        // สร้าง token
        const payload = {
          username: response.data.data.username,
          id: exists.id,
        };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // เก็บ refreshToken ใน db
        await RefreshToken.create({
          token: refreshToken,
          user_id: exists.id,
          expiresAt: moment().add(7, "days").toDate(), // 7 วัน
        });

        // ส่ง refresh token ผ่าน cookie
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false, // ✅ ใช้ true ถ้าเป็น HTTPS
          sameSite: "strict",
          path: "/api/refresh-token",
        });

        return res.json({
          user: {
            username: response.data.data.username,
            firstname: response.data.data.fname,
            lastname: response.data.data.lname,
          },
          token: accessToken,
        });
      }
    } catch (error) {
      // ถ้าระบบของ onesqa มีปัญหา
      console.error("Error:", error.response?.data || error);


    }
  } catch (error) {
    console.log(error);
    res.status(403).json({ error });
  }
};

exports.signinWithIdennumber = async (req, res, next) => {
  try {
    const { idennumber, otp_type } = req.body;

    // เตรียมข้อมูลก่อนส่ง
    const postData = {
      "academy_level_id":"2", 
      "id_card": idennumber,
      "start": 0,
      "length": 1000
    }

    // ส่ง idennumber ไปตรวจสอบที่ onesqa
    try {
      // ถ้าระบบของ onesqa สามารถใช้งานได้
      const response = await axios.post(
        `${process.env.ONESQA_URL}/assessments/get_assessor`,
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
      

      // ตรวจสอบว่าชื่อผู้ใช้คนนี้ได้ทำการ backup ไว้หรือยัง
      const exists = await User.findOne({ where: { username: idennumber } });
      //console.log(exists);

      // ถ้ายังให้ทำการ backup ข้อมูลเก็บไว้
      if (!exists) {
        // บันทักข้อมูลผู้ใช่้งานลง db เพื่อ backup
        const user = await User.create({
          firstname: "testfn",
          lastname: "testln",
          username: idennumber,
          email: "naterzaza1@gmail.com",
          phone: "0800539193",
          loginType: 'verify'
        });
      } 

      // สร้าง OTP แบบสุ่มเลข 6 หลัก
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      // เก็บบัตร บชช กับเลข otp ลง redis
      await setOtp(idennumber, otp);
      // เวลา 5 นาทีข้างหน้า
      const timeIn5Min = moment().add(5, "minutes").format("HH:mm:ss");

      // ถ้าเลือกให้ส่ง otp ทาง sms
      if (otp_type === "sms") {

        // เตรียมข้อมูลก่อนส่ง
        const postData = {
          message: `รหัส OTP ของคุณคือ ${otp} รหัสสามารถใช้ได้ถึง ${timeIn5Min} น.`,
          phone: "0800539193",
          sender: "ONESQA",
        };

        try {
          // ส่ง OTP ผ่าน sms
          const response = await axios.post(
            `${process.env.SMSMKT_URL}/send-message`,
            postData,
            {
              headers: {
                Accept: "application/json",
                api_key: process.env.SMSMKT_API_KEY,
                secret_key: process.env.SMSMKT_SECRET_KEY,
              },
            }
          );
          // ใช้งาน response.data ได้ที่นี่
          console.log("Success:", response.data);

          // ถ้าเบอร์โทรหรือชื่อผู้ส่งไม่ถูกต้อง
          if (response.data.detail !== "OK.")
            return res.status(400).json({ error: "ส่ง OTP ไม่สำเร็จ" });

          return res.json({ message: "OTP ถูกส่งไปที่ SMS แล้ว" });
        } catch (error) {
          console.log(error);
          res.status(403).json({ error });
        }
      } else if (otp_type === "email") {

        await transporter.sendMail({
          from: `"Send OTP" <${process.env.EMAIL_USER}>`,
          to: "naterzaza1@gmail.com",
          subject: "ONESQA",
          text: `รหัส OTP ของคุณคือ ${otp} รหัสสามารถใช้ได้ถึง ${timeIn5Min} น.`,
        });

        return res.json({ message: "OTP ถูกส่งไปที่ Email แล้ว" });
      }
      
    } catch (error) {
      // ถ้าระบบของ onesqa มีปัญหา
      console.error("Error:", error.response?.data || error);


    }

  } catch (error) {
    console.log(error);
    res.status(403).json({ error });
  }
};

exports.verifySigninWithIdennumber = async (req, res, next) => {
  try {
    const { idennumber, otp } = req.body;

    const valid = await verifyOtp(idennumber, otp);
    console.log(valid);
    if (!valid)
      return res.status(401).json({ error: "OTP ผิดหรือ OTP หมดอายุ" });

    

  } catch (error) {
    console.log(error);
    res.status(403).json({ error });
  }
};

exports.refreshToken = async (req, res) => {
  // เรียกใช้ refreshToken จาก cookies
  const token = req.cookies.refreshToken;
  if (!token)
    return res.status(401).json({ error: "ไม่พบ refresh token ถูกส่งมา" });

  try {
    const decoded = verifyRefreshToken(token);
    console.log(decoded);

    // ตรวจสอบว่ามี refreshToken อยู่ใน DB และยังไม่หมดอายุ
    const existing = await RefreshToken.findOne({
      where: {
        token,
        user_id: decoded.id,
        expiresAt: { [Op.gt]: new Date() }, // ยังไม่หมดอายุ
      },
    });
    console.log(existing);
    if (!existing)
      return res
        .status(403)
        .json({ error: "Refresh token ไม่ถูกต้องหรือหมดอายุ" });

    // เรียกข้อมูลผู้ใช้สำหรับส่ง api
    const existUser = await User.findOne({
      where: { username: decoded.username },
    });
    // สร้าง token ใหม่
    const newAccessToken = generateAccessToken({
      username: decoded.username,
      id: decoded.id,
    });

    return res.json({
      user: {
        username: existUser.username,
        firstname: existUser.firstname,
        lastname: existUser.lastname,
      },
      token: newAccessToken,
    });
  } catch (error) {
    console.log(error);
    res.status(403).json({ error });
  }
};
