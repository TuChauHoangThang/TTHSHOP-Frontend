const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const dbDir = path.join(__dirname, 'db');

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);

Object.keys(db).forEach(key => {
    fs.writeFileSync(path.join(dbDir, `${key}.json`), JSON.stringify(db[key], null, 2));
    console.log(`Created db/${key}.json`);
});
console.log('Split complete!');
