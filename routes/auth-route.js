const express = require('express')
const controller = require('../controllers/auth-controller')
const router = express.Router()

//------- LOGIN -------//
router.post("/signin", controller.signin)

//------- LOGOUT -------//

//------- GET -------//


//------- POST -------//

//------- PUT -------//

//------- DELETE -------//

module.exports = router