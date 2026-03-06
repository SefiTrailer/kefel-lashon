const fs = require('fs');
const cp = require('child_process');
const sharp = require('sharp');
const path = require('path');

const OLD_DATA_JSON = 'public/public-data.json';
const SRC_DIR = 'תמונות מקור';
const SYSTEM_DATA_JSON = '../data.json';

// Simple average hash (aHash) for image comparison
async function getAverageHash(buffer) {
    try {
        const { data } = await sharp(buffer)
            .resize(8, 8, { fit: 'fill' })
            .greyscale()
            .raw()
            .toBuffer({ resolveWithObject: true });

        let sum = 0;
        for (let i = 0; i < 64; i++) {
            sum += data[i];
        }
        const mean = sum / 64;
        let hash = '';
        for (let i = 0; i < 64; i++) {
            hash += data[i] >= mean ? '1' : '0';
        }
        return hash;
    } catch (e) {
        return null;
    }
}

// Hamming distance
function getDistance(hash1, hash2) {
    let dist = 0;
    for (let i = 0; i < 64; i++) {
        if (hash1[i] !== hash2[i]) dist++;
    }
    return dist;
}

async function run() {
    console.log('Loading old public-data.json from git...');
    const oldPublicDataOutput = cp.execSync('git show b869021:app/public/public-data.json', { encoding: 'utf-8' });
    const oldPublicData = JSON.parse(oldPublicDataOutput.trim());

    // We only care about images that had titles (tags)
    const taggedKeys = Object.keys(oldPublicData.data).filter(k => oldPublicData.data[k].title);
    console.log(`Found ${taggedKeys.length} tagged images in git history.`);

    // Read current data.json
    let currentData = {};
    if (fs.existsSync(SYSTEM_DATA_JSON)) {
        currentData = JSON.parse(fs.readFileSync(SYSTEM_DATA_JSON, 'utf-8'));
    }

    // 1. Compute hashes for the old tagged images from git
    console.log('Computing hashes for old tagged images from Git...');
    const oldHashes = [];
    let processedOld = 0;
    for (const file of taggedKeys) {
        // Git path escaping
        const gitPath = `b869021:app/public/images/${file}`;
        try {
            // execSync returns a buffer
            const buffer = cp.execSync(`git show "${gitPath}"`, { encoding: 'buffer', maxBuffer: 50 * 1024 * 1024 });
            const hash = await getAverageHash(buffer);
            if (hash) {
                oldHashes.push({ file, hash, meta: oldPublicData.data[file] });
            }
        } catch (e) {
            console.warn(`Could not read from git: ${gitPath}`, e.message.substring(0, 50));
        }
        processedOld++;
        if (processedOld % 50 === 0) console.log(`Processed ${processedOld}/${taggedKeys.length} old images...`);
    }

    // 2. Compute hashes for all new source images
    console.log('\nComputing hashes for new source images...');
    const srcFiles = fs.readdirSync(SRC_DIR).filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'));
    const sourceHashes = [];

    // Process in batches for memory
    for (let i = 0; i < srcFiles.length; i++) {
        const file = srcFiles[i];
        try {
            const buffer = fs.readFileSync(path.join(SRC_DIR, file));
            const hash = await getAverageHash(buffer);
            if (hash) {
                sourceHashes.push({ file, hash });
            }
        } catch (e) { }
        if ((i + 1) % 100 === 0) console.log(`Mapped ${i + 1}/${srcFiles.length} source images...`);
    }

    // 3. Match them!
    console.log('\nMatching images using perceptive hashes...');
    let mappedCount = 0;
    for (const old of oldHashes) {
        let bestMatch = null;
        let bestDist = 999;

        for (const src of sourceHashes) {
            const dist = getDistance(old.hash, src.hash);
            if (dist < bestDist) {
                bestDist = dist;
                bestMatch = src;
            }
            if (dist === 0) break; // Perfect match
        }

        if (bestMatch && bestDist <= 5) { // Threshold for acceptable match
            // Merge metadata into current data.json using the NEW filename
            // but mapped correctly to the newly unrenamed file!
            currentData[bestMatch.file] = old.meta;
            mappedCount++;
        }
    }

    console.log(`\nSuccessfully mapped and restored ${mappedCount} tags to the new source filenames.`);

    // Save updated data.json
    fs.writeFileSync(SYSTEM_DATA_JSON, JSON.stringify(currentData, null, 2));
    console.log('Saved updated data.json');
}

run().catch(err => console.error(err));
