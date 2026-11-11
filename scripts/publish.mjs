import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Publishes every workspace package whose current version is not on npm yet. @deernova/style moves with
// each release; icons keeps its own version and is skipped until someone bumps it.
for (const name of ['style', 'icons']) {
  const { version } = JSON.parse(readFileSync(`packages/${name}/package.json`, 'utf8'));
  const spec = `@deernova/${name}@${version}`;
  const published = spawnSync('npm', ['view', spec, 'version'], { encoding: 'utf8' });
  if (published.status === 0 && published.stdout.trim() === version) {
    console.log(`Skipping ${spec}: already on npm.`);
    continue;
  }
  const result = spawnSync('npm', ['publish', '--workspace', `@deernova/${name}`, '--access', 'public'], { stdio: 'inherit' });
  if (result.status !== 0) {
    console.error(`Stopped at ${spec}. Verify registry state before retrying; already published versions cannot be reused.`);
    process.exit(result.status || 1);
  }
}
