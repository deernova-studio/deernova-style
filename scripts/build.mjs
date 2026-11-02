import { buildSite } from './build-site.mjs';
import { buildSkill } from './build-skill.mjs';

await buildSite();
const manifest = await buildSkill();
console.log(`Built website and skill ${manifest.version}.`);
