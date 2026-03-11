import fs from 'fs';

const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

Object.keys(data).forEach(filename => {
    const meta = data[filename];
    if (meta.title && meta.explanation) {
        // Mark as AI generated for user validation
        meta.isAIGenerated = true;
    }
});

fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
console.log('Marked all tagged entries as isAIGenerated: true');
