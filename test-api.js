const http = require('http');

function testAPI(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing HARS API...\n');

  // Test 1: Health check
  try {
    console.log('1. Testing GET /health');
    const health = await testAPI('/health');
    console.log(`   Status: ${health.status}`);
    console.log(`   Response:`, JSON.stringify(health.data, null, 2));
    console.log('');
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 2: Root endpoint
  try {
    console.log('2. Testing GET /');
    const root = await testAPI('/');
    console.log(`   Status: ${root.status}`);
    console.log(`   Response:`, JSON.stringify(root.data, null, 2));
    console.log('');
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 3: Register
  try {
    console.log('3. Testing POST /api/auth/register');
    const register = await testAPI('/api/auth/register', 'POST', {
      email: 'test@test.com',
      password: 'Test1234',
      first_name: 'Test',
      last_name: 'User',
      affiliation: 'Test University'
    });
    console.log(`   Status: ${register.status}`);
    console.log(`   Response:`, JSON.stringify(register.data, null, 2));
    console.log('');
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 4: Login with admin
  try {
    console.log('4. Testing POST /api/auth/login (admin)');
    const login = await testAPI('/api/auth/login', 'POST', {
      email: 'admin@hanyanghars.com',
      password: 'Admin123!'
    });
    console.log(`   Status: ${login.status}`);
    if (login.data && login.data.data && login.data.data.token) {
      console.log(`   ✅ Login successful! Token: ${login.data.data.token.substring(0, 20)}...`);
      console.log(`   User:`, JSON.stringify(login.data.data.user, null, 2));
    } else {
      console.log(`   Response:`, JSON.stringify(login.data, null, 2));
    }
    console.log('');
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  console.log('✅ Tests completed!');
}

runTests().catch(console.error);
