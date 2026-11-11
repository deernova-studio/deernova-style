import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { parseArgs, run, verifyPublic } from '../scripts/deploy-ssh.mjs';

const current = '/var/www/releases/deernova-20261111T120000Z';
const previous = '/var/www/releases/deernova-20261110T120000Z';
const bundle = { archive: '/local path/site.tgz', sha256: 'a'.repeat(64), checks: { 'index.html': 'b'.repeat(64) } };
const switched = { current, previous, checks: bundle.checks };
const log = () => {};

test('deployment accepts SSH aliases and rejects option and shell injection', () => {
  assert.equal(parseArgs(['deploy'], {}).host, 'deernova');
  assert.equal(parseArgs(['check'], { DEERNOVA_SSH_HOST: 'deploy@website.example' }).host, 'deploy@website.example');
  for (const host of ['-oProxyCommand=evil', 'host;echo nope', 'host\nwhoami', 'host:22', '$(id)', 'a b']) {
    assert.throws(() => parseArgs(['deploy'], { DEERNOVA_SSH_HOST: host }));
  }
  for (const args of [['unknown'], ['deploy', '--release', current], ['rollback', '--release'], ['rollback', '--release', '/etc'], ['deploy', '--force']]) {
    assert.throws(() => parseArgs(args, {}));
  }
});

test('dry-run does not build, contact SSH or verify public servers', async () => {
  const no = () => { throw Error('unexpected side effect'); };
  await run(parseArgs(['deploy', '--dry-run'], {}), { exec: no, pack: no, verify: no, log });
});

test('SSH preflight failure stops before building or uploading', async () => {
  let built = false;
  await assert.rejects(run(parseArgs(['deploy'], {}), {
    exec: () => { throw Error('no SSH access'); }, pack: () => { built = true; }, log,
  }), /no SSH access/);
  assert.equal(built, false);
});

test('deployment uploads this build, enforces host checks, and verifies its contents', async () => {
  const calls = [];
  let verified;
  const exec = (command, args, options) => {
    calls.push({ command, args, options });
    assert.ok(args.includes('BatchMode=yes'));
    assert.ok(args.includes('StrictHostKeyChecking=yes'));
    if (command === 'scp') return '';
    const remote = args.at(-1);
    if (remote.includes('mktemp')) return '/tmp/deernova-upload.abcd1234';
    if (remote.includes('rm -f')) return '';
    assert.match(options.input, /class Site:/);
    return JSON.stringify(remote.includes("'deploy'") ? switched : { ready: true });
  };
  const result = await run(parseArgs(['deploy'], {}), { exec, pack: async () => bundle,
    verify: async checks => { verified = checks; }, log });
  assert.equal(result.current, current);
  assert.deepEqual(verified, bundle.checks);
  const upload = calls.find(call => call.command === 'scp');
  assert.deepEqual(upload.args.slice(-2), [bundle.archive, 'deernova:/tmp/deernova-upload.abcd1234/site.tgz']);
  const deploy = calls.find(call => call.args.at(-1).includes("'deploy'"));
  assert.match(deploy.args.at(-1), new RegExp(bundle.sha256));
  assert.match(calls.at(-1).args.at(-1), /rm -f.*site.tgz.*rmdir/);
});

test('upload failure cleans staging and never switches the website', async () => {
  const commands = [];
  const exec = (command, args) => {
    commands.push(args.at(-1));
    if (command === 'scp') throw Error('upload interrupted');
    if (args.at(-1).includes('mktemp')) return '/tmp/deernova-upload.abc123';
    return '{}';
  };
  await assert.rejects(run(parseArgs(['deploy'], {}), { exec, pack: async () => bundle, log }), /upload interrupted/);
  assert.ok(!commands.some(command => command.includes("'deploy'")));
  assert.match(commands.at(-1), /rmdir/);
});

test('rollback passes an explicit version and reports public failures after a successful switch', async () => {
  let command;
  await assert.rejects(run(parseArgs(['rollback', '--release', previous], {}), {
    exec: (_, args) => { command = args.at(-1); return JSON.stringify(switched); },
    verify: async () => { throw Error('DNS unavailable'); }, log,
  }), /Server switched successfully.*public verification failed.*DNS unavailable/);
  assert.ok(command.includes(`'rollback' '${previous}'`));
});

test('public verification checks content, HTTPS redirects and private-file boundaries', async () => {
  const expected = createHash('sha256').update('release').digest('hex');
  const fetched = [];
  const fake = async url => {
    fetched.push(url);
    if (url.startsWith('http:')) return new Response(null, { status: 301, headers: { location: url.replace('http:', 'https:') } });
    if (url.includes('.git') || url.includes('__deernova')) return new Response(null, { status: 404 });
    return new Response('release');
  };
  await verifyPublic({ 'index.html': expected }, fake);
  assert.equal(fetched.length, 8);
  await assert.rejects(verifyPublic({ 'index.html': expected }, async () => new Response('stale')), /does not match/);
  await assert.rejects(verifyPublic({ 'index.html': expected }, async url => url.includes('.git') ? new Response('private') : fake(url)), /should return 404/);
  await assert.rejects(verifyPublic({ 'index.html': expected }, async url => url.startsWith('http:') ? new Response(null, { status: 301, headers: { location: 'https://other.example/' } }) : fake(url)), /redirect failed/);
});

test('server deployment handles invalid archives, failed switches, locks and rollback in isolation', () => {
  const result = spawnSync('python3', ['-m', 'unittest', 'discover', '-s', 'tests/deploy', '-v'], {
    encoding: 'utf8', env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' },
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
