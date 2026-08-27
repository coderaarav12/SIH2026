const fs = require('fs');
let code = fs.readFileSync('Backend/db/init.js', 'utf8');

const oldUsers = `  const usersToSeed = [
    { name: "Central Ministry Admin", email: "admin@cpse.gov.in", pass: "Admin@12345", role: "admin", dept: "Ministry of Petroleum & Natural Gas" },
    { name: "CPCL Senior Reviewer", email: "reviewer@cpcl.co.in", pass: "Reviewer@12345", role: "reviewer", dept: "CPCL Chennai Refinery" },
    { name: "IOCL Procurement Officer", email: "store.officer@iocl.co.in", pass: "Officer@12345", role: "officer", dept: "IOCL Northern Pipeline" },
    { name: "Demo Reviewer", email: "reviewer@test.com", pass: "Test@12345", role: "reviewer", dept: "Quality Assurance Unit" },
    { name: "Authorized Gmail User", email: "user@gmail.com", pass: "User@12345", role: "reviewer", dept: "Engineering Standards" }
  ];`;

const newUsers = `  const usersToSeed = [
    { name: "Central Ministry Admin", email: "admin@cpse.gov.in", pass: process.env.ADMIN_PASS || "changeme123", role: "admin", dept: "Ministry of Petroleum & Natural Gas" },
    { name: "CPCL Senior Reviewer", email: "reviewer@cpcl.co.in", pass: process.env.REVIEWER_PASS || "changeme123", role: "reviewer", dept: "CPCL Chennai Refinery" },
    { name: "IOCL Procurement Officer", email: "store.officer@iocl.co.in", pass: process.env.OFFICER_PASS || "changeme123", role: "officer", dept: "IOCL Northern Pipeline" }
  ];`;

code = code.replace(oldUsers, newUsers);
fs.writeFileSync('Backend/db/init.js', code);
console.log('init.js patched');
