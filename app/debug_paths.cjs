const path = require('path');
const fs = require('fs');

const __dirname = path.resolve('app');
const IMAGES_DIR = path.resolve(__dirname, '../app/תמונות מקור');
const NEW_IMAGES_DIR = path.resolve(__dirname, '../תמונות חדשות');

console.log('__dirname simulation:', __dirname);
console.log('IMAGES_DIR:', IMAGES_DIR);
console.log('NEW_IMAGES_DIR:', NEW_IMAGES_DIR);

console.log('NEW_IMAGES_DIR exists:', fs.existsSync(NEW_IMAGES_DIR));
if (fs.existsSync(NEW_IMAGES_DIR)) {
    const files = fs.readdirSync(NEW_IMAGES_DIR).filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'));
    console.log('Found new files:', files.length);
    console.log('First 5 files:', files.slice(0, 5));
}
