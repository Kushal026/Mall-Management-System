import 'dotenv/config';
import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

const employees = [
  { full_name: 'Rajesh Kumar', email: 'rajesh@mall.com', phone: '9876543210', department: 'Security', shift: 'morning', salary: 25000, password: 'password123', role: 'employee' },
  { full_name: 'Priya Singh', email: 'priya.singh@mall.com', phone: '9876543211', department: 'Billing', shift: 'afternoon', salary: 28000, password: 'password123', role: 'employee' },
  { full_name: 'Amit Patel', email: 'amit@mall.com', phone: '9876543212', department: 'Maintenance', shift: 'night', salary: 26000, password: 'password123', role: 'employee' },
  { full_name: 'Neha Sharma', email: 'neha@mall.com', phone: '9876543213', department: 'Cleaning', shift: 'morning', salary: 22000, password: 'password123', role: 'employee' },
  { full_name: 'Vikas Gupta', email: 'vikas@mall.com', phone: '9876543214', department: 'Security', shift: 'afternoon', salary: 25000, password: 'password123', role: 'employee' },
  { full_name: 'Anjali Verma', email: 'anjali@mall.com', phone: '9876543215', department: 'Administration', shift: 'morning', salary: 32000, password: 'password123', role: 'admin' },
  { full_name: 'Suresh Reddy', email: 'suresh@mall.com', phone: '9876543216', department: 'Maintenance', shift: 'morning', salary: 24000, password: 'password123', role: 'employee' },
  { full_name: 'Divya Nair', email: 'divya@mail.com', phone: '9876543217', department: 'Billing', shift: 'morning', salary: 29000, password: 'password123', role: 'employee' },
];

async function getAuthToken() {
  try {
    console.log('🔐 Attempting to login with admin credentials...\n');
    const response = await axios.post(`${API_URL}/login`, {
      email: 'admin@smartmall.local',
      password: 'password'
    });
    
    if (response.data.success && response.data.data.token) {
      console.log('✅ Login successful!\n');
      return response.data.data.token;
    }
  } catch (error) {
    console.error(`❌ Login failed: ${error.response?.data?.message || error.message}`);
  }
  return null;
}

async function insertEmployees(token) {
  console.log('Starting to insert employees...\n');
  let count = 0;

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  for (const emp of employees) {
    try {
      const response = await axios.post(`${API_URL}/employees`, emp, { headers });
      console.log(`✅ ${emp.full_name} - Added successfully`);
      count++;
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`⚠️  ${emp.full_name} - Already exists (skipped)`);
      } else {
        console.error(`❌ ${emp.full_name} - Error: ${error.response?.data?.message || error.message}`);
      }
    }
  }

  console.log(`\n✅ Inserted ${count} employees successfully!`);
  console.log('Refresh the website to see the changes.');
}

async function main() {
  const token = await getAuthToken();
  if (token) {
    await insertEmployees(token);
  } else {
    console.log('\n❌ Could not authenticate. Please check your admin credentials.');
  }
}

main().catch(console.error);
