import {readFile,writeFile} from 'node:fs/promises';
const next=process.argv[2];if(!/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(next||''))throw Error('Usage: npm run release:version -- 0.2.0');
for(const file of ['package.json','packages/style/package.json']){const p=JSON.parse(await readFile(file,'utf8'));p.version=next;await writeFile(file,JSON.stringify(p,null,2)+'\n');}
console.log('Updated versions. Run npm install --package-lock-only, npm test and commit before publishing.');
