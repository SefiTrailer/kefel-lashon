import fs from 'fs';

const content = fs.readFileSync('src/App.jsx', 'utf8');
const lines = content.split('\n');

let curly = 0;
let parens = 0;

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    // Simple filter for strings and comments
    line = line.replace(/\/\/.*$/g, '');
    line = line.replace(/\/\*.*?\*\//g, '');
    // Replace strings to avoid counting braces inside them
    line = line.replace(/'[^']*'/g, "''");
    line = line.replace(/"[^"]*"/g, '""');
    line = line.replace(/`[^`]*`/g, '``');

    for (let char of line) {
        if (char === '{') curly++;
        if (char === '}') curly--;
        if (char === '(') parens++;
        if (char === ')') parens--;
    }
    
    if (curly < 0 || parens < 0) {
        console.log(`Mismatch at line ${i + 1}: c:${curly} p:${parens}`);
        console.log(`Line content: "${lines[i]}"`);
        // process.exit(1);
    }
}
console.log('Final count:', curly, parens);
