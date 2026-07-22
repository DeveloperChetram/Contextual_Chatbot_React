// Test script for Google authentication
const { googleCredentialAuth } = require('./src/controllers/googleAuth.controller');

// Mock request and response objects
const mockReq = {
    body: {
        credential: 'mock-google-credential'
    }
};

const mockRes = {
    status: function(code) {
        this.statusCode = code;
        return this;
    },
    json: function(data) {
        console.log('Response:', data);
        return this;
    },
    cookie: function(name, value, options) {
        console.log('Cookie set:', name, '=', value);
        return this;
    }
};

// Test the credential authentication
console.log('Testing Google credential authentication...');

// This will fail because we don't have a real Google credential,
// but it will test the structure of our implementation
googleCredentialAuth(mockReq, mockRes)
    .then(() => console.log('Test completed'))
    .catch(err => console.error('Test error (expected):', err.message));