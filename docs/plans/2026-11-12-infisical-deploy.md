# Infisical deployment credentials

## Objective

Make the existing one-command SSH deployment use One's Infisical shared credentials, following HandyPick's `one exec --global --env prod --path ... --keys ...` pattern. Maintainers authenticate to their organization instead of copying private keys between computers. Public repository access does not grant server access.

## Implementation

- `scripts/deploy-one.mjs` selects only five SSH variables from `shared-credentials`, environment `prod`, path `/deernova-website`. Preview, build and tests do not read secrets. Missing credentials fail without falling back to a local identity.
- `scripts/deploy-credentials.mjs` validates the supplied host, user, port, OpenSSH private key and verified host record. It creates private temporary SSH files, removes credential values from the deployment child's environment, forwards termination signals, and cleans up on success, failure and normal termination.
- `scripts/deploy-ssh.mjs` accepts an explicit SSH config file for both SSH and SCP, retaining strict host verification. The previous direct SSH entry remains an explicit recovery option.
- Existing npm and One commands use the Infisical entry. The server's Nginx configuration and TLS certificates remain on the server.
- Administrator setup uses `one env set --stdin` for key material. One 0.1.25 rejected missing shared folders, so the initial folder was created with Infisical's documented folder API before importing credentials. No secret contents or login token are committed.

## Verification

- All 84 Node tests passed, including the Python deployment suite.
- Tests cover scoped credential loading, preview without authentication, private file permissions, strict host checks, sanitizing the child environment, failure cleanup, signal cleanup, and SSH/SCP config propagation.
- Real Infisical login and import of the five variables completed. The real doctor command fetched and validated the cloud credentials; no temporary credential directory remained afterward.
- With the user's explicit approval, added the current network's single-source TCP 22 security-group rule and preserved the existing rules. The real One doctor and deployment both succeeded using Infisical credentials.
- Production release `/var/www/releases/deernova-20261111T164640221102Z` passed both domains' HTTPS content hashes, HTTP redirects and 404 checks. The previous release is retained for rollback. No temporary credential directories remained after completion.

## Limits

Reading the shared private key grants the corresponding root account's server permissions. Restrict Infisical folder readers to administrators. The existing SSH key's `restrict` option disables forwarding and PTY, not root command execution. Network allowlisting still applies. Forced `SIGKILL` or power loss cannot run cleanup; CI machine-identity authentication and generic server provisioning are outside this change.
