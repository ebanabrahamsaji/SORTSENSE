import fs from 'fs';
const content = fs.readFileSync('schema.txt', 'utf16le');
console.log(content.toString());
