const express = require('express');
const router = express.Router();
const {
  createBreakdown,
  getBreakdowns,
  updateBreakdownStatus
} = require('../controllers/breakdownController');
const { authenticateJWT } = require('../middlewares/authMiddleware');

router.use(authenticateJWT);

router.route('/')
  .post(createBreakdown)
  .get(getBreakdowns);

router.patch('/:id/status', updateBreakdownStatus);

module.exports = router;
