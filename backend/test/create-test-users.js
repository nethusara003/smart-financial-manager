/**
 * Create Test Users for P2P Transfer Testing
 * Creates sender and receiver test accounts
 */

import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const testUsers = [
  {
    name: 'Test Sender',
    email: 'sender@test.com',
    password: 'password123'
  },
  {
    name: 'Test Receiver',
    email: 'receiver@test.com',
    password: 'password123'
  }
];

async function createUser(user) {
  try {
    const response = await axios.post(`${API_URL}/users/register`, user);
    console.log(`✅ Created: ${user.name} (${user.email})`);
    if (response.data.user?._id) {
      console.log(`   User ID: ${response.data.user._id}`);
    } else if (response.data._id) {
      console.log(`   User ID: ${response.data._id}`);
    }
    return response.data;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log(`ℹ️  User already exists: ${user.email}`);
      return { exists: true };
    } else {
      console.log(`❌ Failed to create ${user.email}`);
      if (error.response?.data) {
        console.log(`   Error: ${error.response.data.message || JSON.stringify(error.response.data)}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
      return null;
    }
  }
}

async function createTestUsers() {
  console.log('\n🔧 Creating Test Users for P2P Transfer Testing\n');
  console.log('═'.repeat(60) + '\n');
  
  for (const user of testUsers) {
    await createUser(user);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('✨ Test users are ready!');
  console.log('\n📝 Next steps:');
  console.log('   1. Run comprehensive tests: node backend/test/test-transfer.js');
  console.log('   2. Or test manually via Postman/Thunder Client');
  console.log('\n💡 Test Credentials:');
  console.log('   Sender:   sender@test.com / password123');
  console.log('   Receiver: receiver@test.com / password123\n');
}

createTestUsers();
