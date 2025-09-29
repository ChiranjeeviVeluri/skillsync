// Test script for complete authentication flow
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

// Test signup
async function testSignup() {
    console.log('🧪 Testing Signup...');

    const signupData = {
        firstName: 'Test',
        lastName: 'Student',
        email: `teststudent${Date.now()}@university.edu`,
        password: 'password123',
        university: 'Test University',
        year: '2',
        role: 'learner'
    };

    try {
        const response = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signupData)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Signup successful:', data.user.firstName, data.user.lastName);
            return { success: true, email: signupData.email, password: signupData.password };
        } else {
            console.log('❌ Signup failed:', data.message);
            return { success: false };
        }
    } catch (error) {
        console.log('❌ Signup error:', error.message);
        return { success: false };
    }
}

// Test login
async function testLogin(email, password) {
    console.log('🧪 Testing Login...');

    try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Login successful:', data.user.firstName, data.user.lastName);
            return { success: true, token: data.token };
        } else {
            console.log('❌ Login failed:', data.message);
            return { success: false };
        }
    } catch (error) {
        console.log('❌ Login error:', error.message);
        return { success: false };
    }
}

// Test authenticated endpoint
async function testAuthenticatedEndpoint(token) {
    console.log('🧪 Testing Authenticated Endpoint...');

    try {
        const response = await fetch(`${BASE_URL}/api/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Authenticated request successful:', data.user.firstName, data.user.lastName);
            return { success: true };
        } else {
            console.log('❌ Authenticated request failed:', data.message);
            return { success: false };
        }
    } catch (error) {
        console.log('❌ Authenticated request error:', error.message);
        return { success: false };
    }
}

// Test with existing demo accounts
async function testWithDemoAccounts() {
    console.log('\n🧪 Testing with Demo Accounts...');

    // Test demo learner
    const learnerLogin = await testLogin('learner@university.edu', 'password123');
    if (learnerLogin.success) {
        await testAuthenticatedEndpoint(learnerLogin.token);
    }

    // Test demo tutor
    const tutorLogin = await testLogin('tutor@university.edu', 'password123');
    if (tutorLogin.success) {
        await testAuthenticatedEndpoint(tutorLogin.token);
    }
}

// Run complete test
async function runCompleteTest() {
    console.log('🚀 Starting Complete Authentication Flow Test\n');

    // Test 1: Signup new user
    const signupResult = await testSignup();

    if (signupResult.success) {
        // Test 2: Login with newly created user
        const loginResult = await testLogin(signupResult.email, signupResult.password);

        if (loginResult.success) {
            // Test 3: Access authenticated endpoint
            await testAuthenticatedEndpoint(loginResult.token);
        }
    }

    // Test 4: Test with demo accounts
    await testWithDemoAccounts();

    console.log('\n🎯 Authentication Flow Test Complete!');
}

runCompleteTest().catch(console.error);