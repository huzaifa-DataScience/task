const express = require('express');
const { login, submitTracker, getAnalytics } = require('../controllers');

const router = express.Router();

router.post('/login', login);
router.post('/tracker', submitTracker);
router.get('/analytics', getAnalytics);

module.exports = router;
