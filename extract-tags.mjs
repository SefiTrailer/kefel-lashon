import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./data.json', 'utf-8'));
const tagsCount = {};

Object.values(data).forEach(item => {
    const topic = item.topic || '';
    const tags = topic.split(',').map(t => t.trim()).filter(Boolean);
    tags.forEach(tag => {
        tagsCount[tag] = (tagsCount[tag] || 0) + 1;
    });
});

const sortedTags = Object.entries(tagsCount).sort((a, b) => b[1] - a[1]);
fs.writeFileSync('./current_tags.json', JSON.stringify(sortedTags, null, 2), 'utf-8');
console.log('Tags extracted to current_tags.json');
