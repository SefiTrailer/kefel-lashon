import fs from 'fs';

const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
const images = fs.readdirSync('app/תמונות מקור').filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));

const status = {
  total_files: images.length,
  in_metadata: 0,
  tagged: 0,
  untagged: 0,
  no_topic: 0,
  ai_generated: 0
};

images.forEach(img => {
  const meta = data[img];
  if (meta) {
    status.in_metadata++;
    if (meta.title && meta.explanation) {
      status.tagged++;
      if (!meta.topic) status.no_topic++;
    } else {
      status.untagged++;
    }
    if (meta.isAIGenerated) status.ai_generated++;
  } else {
    status.untagged++;
  }
});

console.log(JSON.stringify(status, null, 2));
