const express = require('express');
const { googleAuth, googleCredentialAuth } = require('../controllers/googleAuth.controller');
const router = express.Router();

// Legacy code-based authentication (kept for backward compatibility)
router.get('/google-auth', googleAuth);

// Modern credential-based authentication (faster and more reliable)
router.post('/google-credential', googleCredentialAuth);

module.exports = router;
