const express = require('express')
const controller = require('../controllers/chatgroup-controller')
const router = express.Router()

//------- GET -------//

//------- POST -------//
router.post("/chatgroup", controller.createChatGroup)

//------- PUT -------//

//------- DELETE -------//

module.exports = router