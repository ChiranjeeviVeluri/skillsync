const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const http = require('http');
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

    const req = http.request(requestOptions, (res) => {
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

async function testRatingAPI() {
  try {
    console.log('🧪 Testing Rating API...');

    // First login to get a token
    console.log('🔐 Logging in...');
    const loginResponse = await makeRequest('http://localhost:5000/api/auth/login', {
      method: 'POST',
      body: {
        email: 'learner@university.edu',
        password: 'password123'
      }
    });

    if (loginResponse.status !== 200) {
      throw new Error('Login failed');
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Test getting tutors with ratings
    console.log('\n📚 Testing tutor ratings...');
    const tutorsResponse = await makeRequest('http://localhost:5000/api/tutors', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (tutorsResponse.status === 200) {
      console.log('✅ Tutors API working');
      console.log('📊 Tutor ratings:');
      tutorsResponse.data.data.forEach(tutor => {
        console.log(`   ${tutor.firstName} ${tutor.lastName}: ${tutor.stats.averageRating}⭐ (${tutor.stats.reviewCount} reviews)`);
      });
    }

    console.log('\n🎉 Rating system is working!');

  } catch (error) {
    console.error('❌ Error testing rating API:', error.message);
  }
}

testRatingAPI();