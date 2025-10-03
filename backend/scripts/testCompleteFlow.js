const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const https = require('http'); // Using http since localhost
    const urlObj = new URL(url);

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testCompleteFlow() {
  try {
    console.log('🔐 Testing login flow...');

    // Login as learner
    const loginResponse = await makeRequest('http://localhost:5000/api/auth/login', {
      method: 'POST',
      body: {
        email: 'learner@university.edu',
        password: 'password123'
      }
    });

    console.log('✅ Login successful');
    const token = loginResponse.data.token;

    // Now test the bookings API
    console.log('📚 Fetching bookings...');
    const bookingsResponse = await makeRequest('http://localhost:5000/api/bookings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Bookings API response:');
    console.log('Status:', bookingsResponse.status);
    console.log('Response data:', JSON.stringify(bookingsResponse.data, null, 2));

    // Filter for upcoming bookings (status: accepted)
    const upcoming = bookingsResponse.data.data.filter(b => b.status === 'accepted');
    console.log('\n📋 Upcoming bookings (status=accepted):', upcoming.length);
    upcoming.forEach((booking, index) => {
      console.log(`  ${index + 1}. ${booking.subject} - ${booking.date} at ${booking.timeSlot}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCompleteFlow();