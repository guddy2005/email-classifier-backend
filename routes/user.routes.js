const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { getUserDetails } = require('../controllers/user.controller');

router.get('/user', verifyToken, getUserDetails);

module.exports = router;