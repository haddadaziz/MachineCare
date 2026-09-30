const express = require('express');
const router = express.Router();
const {
  createMachine,
  getMachines,
  getMachineById,
  updateMachine,
  deleteMachine
} = require('../controllers/machineController');
const { authenticateJWT } = require('../middlewares/authMiddleware');

router.use(authenticateJWT);

router.route('/')
  .post(createMachine)
  .get(getMachines);

router.route('/:id')
  .get(getMachineById)
  .put(updateMachine)
  .delete(deleteMachine);

module.exports = router;
