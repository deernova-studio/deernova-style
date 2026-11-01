import {spawnSync} from 'node:child_process';
for(const name of ['tokens','ui','style']){const result=spawnSync('npm',['publish','--workspace',`@deernova/${name}`,'--access','public'],{stdio:'inherit'});if(result.status!==0){console.error(`Stopped at @deernova/${name}. Verify registry state before retrying; already published versions cannot be reused.`);process.exit(result.status||1);}}
