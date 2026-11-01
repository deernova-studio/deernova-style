#!/usr/bin/env node
import { cp, mkdir, readFile, readdir, rename, rm, lstat } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const pkg = fileURLToPath(new URL('../',import.meta.url));
const args=process.argv.slice(2); let command=args.shift()||'help';
const options={};let positional;
for(let i=0;i<args.length;i++){const a=args[i];if(['--global','--force'].includes(a))options[a.slice(2)]=true;else if(['--dir','--agent','--repo'].includes(a)){if(!args[i+1]||args[i+1].startsWith('--'))throw Error(`${a} needs a value`);options[a.slice(2)]=args[++i];}else if(a.startsWith('-'))throw Error(`Unknown option: ${a}`);else if(positional)throw Error('Too many arguments');else positional=a;}
async function exists(p){try{return await lstat(p);}catch(e){if(e.code==='ENOENT')return null;throw e;}}
async function main(){
 if(['help','--help','-h'].includes(command)){console.log(`deernova-style install|update|doctor [--repo <existing-repository>] [--global] [--agent codex|claude|agents] [--dir <skills-parent>] [--force]\ndeernova-style init [existing-repository]  (alias for install --repo)\ndeernova-style version\nInstalls design reference files only; does not add app code or package dependencies. Default: project .agents/skills/deernova-style. --global defaults to CODEX_HOME/skills.\nupdate installs the version bundled in this CLI; use npx @deernova/style@latest update to fetch latest.\n--force keeps a timestamped backup before replacing a locally modified skill.`);return;}
 const manifest=JSON.parse(await readFile(join(pkg,'skill/manifest.json'),'utf8'));
 if(command==='version'){console.log(manifest.version);return;}
 if(command==='init'){if(options.repo&&positional)throw Error('Specify the repository once');options.repo=positional||options.repo||process.cwd();positional=undefined;command='install';}
 if(!['install','update','doctor'].includes(command))throw Error(`Unknown command: ${command}`);
 if(positional)throw Error('Use --repo to specify a repository or --dir to specify a skills parent');
 if([options.repo,options.global,options.dir].filter(Boolean).length>1)throw Error('--repo, --global and --dir are mutually exclusive');
 const repo=resolve(options.repo||process.cwd());
 if(!options.global&&!options.dir&&!(await exists(repo))?.isDirectory())throw Error('Repository must be an existing directory');
 const agent=options.agent||(options.global?'codex':'agents');if(!['codex','claude','agents'].includes(agent))throw Error('Agent must be codex, claude or agents');
 const base=options.dir?resolve(options.dir):options.global?(agent==='codex'?join(process.env.CODEX_HOME||join(homedir(),'.codex'),'skills'):join(homedir(),'.'+agent,'skills')):join(repo,'.'+agent,'skills');
 const dest=join(base,'deernova-style');const state=await exists(dest);
 if(state?.isSymbolicLink()||(state&&!state.isDirectory()))throw Error('Destination is not a regular directory');
 let installed=null;try{installed=JSON.parse(await readFile(join(dest,'manifest.json'),'utf8'));}catch{}
 const clean=state&&installed?.installedHash ? await installedDigest(dest)===installed.installedHash:false;
 if(command==='doctor'){console.log(JSON.stringify({path:dest,installedVersion:installed?.version||null,bundledVersion:manifest.version,sourceMatches:installed?.sourceHash===manifest.sourceHash,localChanges:state?!clean:null},null,2));if(!installed||!clean||installed.sourceHash!==manifest.sourceHash)process.exitCode=1;return;}
 if(command==='update'&&!installed)throw Error('No managed installation found. Run install first.');
 if(state&&!options.force&&(!clean||command==='install'))throw Error('Skill exists or contains local changes. Use update for clean installs, or --force to back up and replace.');
 await mkdir(base,{recursive:true});const temp=join(base,`.deernova-style-${process.pid}-${Date.now()}`);let backup;
 try{await cp(join(pkg,'skill'),temp,{recursive:true});const hash=await installedDigest(temp);const {writeFile}=await import('node:fs/promises');await writeFile(join(temp,'manifest.json'),JSON.stringify({...manifest,installedHash:hash},null,2)+'\n');if(state){backup=dest+'.backup-'+Date.now();await rename(dest,backup);}try{await rename(temp,dest);}catch(e){if(backup)await rename(backup,dest);throw e;}if(backup&&clean&&!options.force)await rm(backup,{recursive:true});console.log(`Installed Deernova v${manifest.version}: ${dest}`);if(backup&&(!clean||options.force))console.log(`Backup: ${backup}`);}finally{await rm(temp,{recursive:true,force:true});}
}
async function installedDigest(dir){const manifestPath=join(dir,'manifest.json');const original=JSON.parse(await readFile(manifestPath,'utf8'));const hash=createHash('sha256');async function walk(p,relative=''){for(const e of (await readdir(p,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const name=relative+e.name;if(name==='manifest.json')continue;if(e.isSymbolicLink())throw Error('Symlink in installed skill');hash.update(name);if(e.isDirectory())await walk(join(p,e.name),name+'/');else hash.update(await readFile(join(p,e.name)));}}await walk(dir);hash.update(original.sourceHash);hash.update(original.version);return hash.digest('hex');}
main().catch(e=>{console.error(`deernova-style: ${e.message}`);process.exitCode=1;});
