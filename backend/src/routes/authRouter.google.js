const express = require('express');
const { googleAuth } = require('../controllers/googleAuth.controller');
const router = express.Router();

router.get('/google-auth', googleAuth);

module.exports = router;
