const fs = require('fs'); const os = require('os'); const path = require('path');
const DIR = path.join(os.homedir(), '.rinawarp');
const FILE = path.join(DIR, 'whatsnew.json');
function read(){ try{return JSON.parse(fs.readFileSync(FILE,'utf8'))}catch{return { lastSeenVersion:null, dismissedAt:0 }}}
function write(d){ if(!fs.existsSync(DIR)) fs.mkdirSync(DIR,{recursive:true}); fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }
module.exports = { read, write, FILE };
