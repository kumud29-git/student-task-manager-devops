const fs = require('fs');

const tests = [
  'app.js',
  'package.json',
  'public/index.html'
];

let failed = false;

for (const file of tests) {
  if (!fs.existsSync(file)) {
    console.error(`TEST FAILED: ${file} not found`);
    failed = true;
  } else {
    console.log(`TEST PASSED: ${file} exists`);
  }
}

if (failed) {
  console.error('Some automated tests failed.');
  process.exit(1);
}

console.log('All automated tests passed.');
process.exit(0);
