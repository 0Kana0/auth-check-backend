const express = require('express')
const controller = require('../controllers/modelai-controller')
const router = express.Router()

//------- GET -------//
router.get("/modelai", controller.getAllModelAi)
router.get("/modelai/:id", controller.getModelAiById)

//------- POST -------//
router.post("/modelai", controller.createModelAi)

//------- PUT -------//
router.put("/modelai/:id", controller.updateModelAi)

//------- DELETE -------//
router.delete("/modelai/:id", controller.deleteModelAi)

module.exports = router