async function test() {
    try {
        const res = await fetch('http://localhost:3088/api/images');
        const data = await res.json();
        console.log('Total files:', data.files.length);
        console.log('Has fileSources:', !!data.fileSources);
        if (data.fileSources) {
            const sources = Object.values(data.fileSources);
            const counts = sources.reduce((acc, s) => { acc[s] = (acc[s] || 0) + 1; return acc; }, {});
            console.log('Source counts:', counts);
        }
        
        // Check if specific files from 'new' folder are present
        const newFiles = Object.keys(data.fileSources || {}).filter(k => data.fileSources[k] === 'new');
        console.log('New files found in API:', newFiles.length);
        if (newFiles.length > 0) {
            console.log('Example new file:', newFiles[0]);
        }
    } catch (e) {
        console.error('Server not reachable or error:', e.message);
    }
}
test();
