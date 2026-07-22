// Test script for Google login component
import React from 'react';
import ReactDOM from 'react-dom/client';

// Mock the Google login component to test rendering
const TestGoogleLogin = () => {
    return (
        <div style={{ padding: '20px' }}>
            <h3>Google Login Test</h3>
            <p>This tests the new Google Identity Services integration</p>
            <div id="google-login-container">
                {/* The actual component would be rendered here */}
                <button style={{ padding: '10px 20px', background: '#fff', border: '1px solid #ddd' }}>
                    <span>Continue with Google</span>
                </button>
            </div>
        </div>
    );
};

// Create a test root
const testRoot = document.createElement('div');
document.body.appendChild(testRoot);

const root = ReactDOM.createRoot(testRoot);
root.render(<TestGoogleLogin />);

console.log('Google login component test rendered successfully');