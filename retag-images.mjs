import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./data.json', 'utf-8'));
const master = JSON.parse(fs.readFileSync('./tags_master.json', 'utf-8'));

const normalizeTags = (topicStr) => {
    if (!topicStr) return [];
    const rawTags = topicStr.split(',').map(t => t.trim()).filter(Boolean);
    const normalized = new Set();
    
    rawTags.forEach(tag => {
        if (master.mappings[tag]) {
            normalized.add(master.mappings[tag]);
        } else if (master.categories.includes(tag)) {
            normalized.add(tag);
        } else {
            // If it's a very specific tag not in master, we keep it for now but maybe we should've mapped it
            // Let's try to find a partial match in master mappings
            let found = false;
            for (const [key, val] of Object.entries(master.mappings)) {
                if (tag.includes(key) || key.includes(tag)) {
                    normalized.add(val);
                    found = true;
                    break;
                }
            }
            if (!found) normalized.add(tag);
        }
    });
    return Array.from(normalized);
};

// Keyword based auto-tagging
const autoTag = (item) => {
    const text = (item.title + ' ' + item.explanation).toLowerCase();
    const tags = new Set(normalizeTags(item.topic));

    const rules = {
        "חיות": ["כלב", "חתול", "חיה", "חיות", "דג", "ציפור", "גדי", "סוס", "גמל", "שור", "חמור", "פרה", "תרנגול"],
        "יהדות ומסורת": ["רב", "גמרא", "תורה", "בית כנסת", "תפילה", "מצווה", "חסיד", "יהודי", "הלכה", "ברסלב", "מדרש"],
        "אוכל ושתייה": ["אוכל", "מאכל", "שתיה", "מתוק", "חלב", "בשרי", "חלבי", "יין", "לחם", "עוגה", "ירקות", "פירות"],
        "חגים ומועדים": ["פסח", "סוכות", "ראש השנה", "חנוכה", "פורים", "שבועות", "יום כיפור", "צום", "חג", "מועד", "מצה", "חמץ"],
        "פוליטיקה ואקטואליה": ["שר", "ממשלה", "כנסת", "נשיא", "בחירות", "פוליטיקה", "ראש הממשלה", "ביבי", "נתניהו"],
        "פתגמים וביטויים": ["ביטוי", "פתגם", "משל", "מטבע לשון", "כפל לשון"],
        "בית ויומיום": ["בית", "חדר", "רהיט", "בגד", "מטבח", "מקלחת", "ניקיון", "סלון"],
        "טכנולוגיה ומדע": ["מחשב", "טלפון", "טכנולוגיה", "חשמל", "מכשיר", "אינטרנט", "אפל", "גוגל", "רכב", "מכונית"]
    };

    for (const [category, keywords] of Object.entries(rules)) {
        if (keywords.some(kw => text.includes(kw))) {
            tags.add(category);
        }
    }

    return Array.from(tags).join(', ');
};

const updatedData = {};
for (const [key, value] of Object.entries(data)) {
    updatedData[key] = {
        ...value,
        topic: autoTag(value)
    };
}

fs.writeFileSync('./data.json', JSON.stringify(updatedData, null, 2), 'utf-8');
console.log('data.json has been re-tagged and normalized.');
