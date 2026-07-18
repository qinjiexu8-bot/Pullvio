# Pullvio EC2 worker maintenance runbook

## Scope

This runbook describes how to maintain the Pullvio media worker host. It covers
direct SSH access, source-IP changes, routine health checks, safe restarts, the
SSM recovery path, and the containerized media-worker service.

Last verified: 2026-07-17.

## Current host

| Item | Value |
| --- | --- |
| AWS region | `us-east-1` |
| Instance ID | `i-0e0fe842a01633b73` |
| Instance type | `c7g.large` (ARM64) |
| Elastic IP | `3.212.192.122` |
| SSH user | `ubuntu` |
| Security group | `sg-0f1cc5ccd45ab4c14` (`pullvio-worker-sg`) |
| Root volume | 30 GB encrypted `gp3`, 3,000 IOPS, 125 MB/s |
| Worker runtime user | `pullvio` |
| Application directory | `/opt/pullvio` |
| Scratch directory | `/var/lib/pullvio/tmp` |
| Log directory | `/var/log/pullvio` |

The Elastic IP remains stable across normal stop/start cycles. Do not replace or
release it without updating this runbook and every SSH configuration that uses
it.

## Direct SSH

Keep the private key outside the repository. The expected key-pair filename is
`pullvio-01.pem`; its contents must never be committed, uploaded to issue
trackers, or sent through chat.

On a new Mac or Linux machine:

```bash
chmod 600 ~/.ssh/pullvio-01.pem
ssh -i ~/.ssh/pullvio-01.pem ubuntu@3.212.192.122
```

An optional local alias can be added to `~/.ssh/config`:

```sshconfig
Host pullvio-ec2
  HostName 3.212.192.122
  User ubuntu
  Port 22
  IdentityFile ~/.ssh/pullvio-01.pem
  IdentitiesOnly yes
  ServerAliveInterval 30
  ServerAliveCountMax 3
```

Then connect with:

```bash
ssh pullvio-ec2
```

Direct SSH does not require AWS CLI or the Session Manager plugin. The target
machine only needs OpenSSH and the private key.

## Media worker service

The media worker is managed by systemd and Docker Compose:

```bash
sudo systemctl status pullvio-media-worker
sudo systemctl restart pullvio-media-worker
sudo docker logs --tail 200 pullvio-media-worker
sudo docker logs --tail 100 pullvio-pot-provider
sudo docker exec pullvio-media-worker deno --version
sudo docker exec pullvio-media-worker yt-dlp --version
```

The deployed source lives at `/opt/pullvio/media-worker`. Runtime media scratch
space is `/var/lib/pullvio/tmp`; it is mounted into the container as `/work` and
must not be used for permanent storage. The container has no listening port,
drops all Linux capabilities, uses a read-only root filesystem, and runs as the
host `pullvio` runtime identity (UID 997 / GID 988 on the current host).

Do not put Supabase or AWS keys in Compose. The worker gets AWS credentials from
the EC2 instance profile and retrieves its Supabase backend secret from AWS
Secrets Manager (`pullvio/supabase/worker`).

The BgUtils PO Token provider is a Compose sidecar named
`pullvio-pot-provider`. It is reachable only by the worker at
`http://pot-provider:4416`; port 4416 must never be published in the host
security group or Compose `ports`. The provider receives no AWS, Supabase,
Clerk, source-account, or browser-cookie credentials. A `DOCKER-USER` firewall
rule blocks its static container address (`172.30.240.2`) from the EC2 metadata
range (`169.254.0.0/16`).

## SSH security policy

The server is intentionally configured with:

- public-key authentication enabled;
- password authentication disabled;
- root SSH login disabled;
- TCP port 22 restricted to an administrator `/32` source IP;
- SSM kept online as a recovery path.

Never change the SSH source to `0.0.0.0/0` or `::/0`. Automated scanners begin
probing public SSH endpoints quickly, even when password login is disabled.

As of 2026-07-17, the allowed administrator source is
`20.51.105.89/32`. This value is expected to change when the administrator
changes ISP, VPN, office, or mobile network.

## Updating the administrator source IP

Find the new public IPv4 address from the machine that will initiate SSH:

```bash
curl -4 https://checkip.amazonaws.com
```

In the AWS console:

1. Open **EC2 → Security Groups → pullvio-worker-sg**.
2. Open **Inbound rules → Edit inbound rules**.
3. Replace the existing SSH source with `<new-ip>/32`.
4. Keep protocol `TCP`, port `22`, and save.
5. Confirm `ssh -i ~/.ssh/pullvio-01.pem ubuntu@3.212.192.122` works.

When possible, add the new `/32`, test it, and only then remove the previous
source. That sequence avoids locking out the administrator.

## Routine health check

Run these after a deployment, restart, package upgrade, or incident:

```bash
systemctl is-active docker
systemctl is-active snap.amazon-ssm-agent.amazon-ssm-agent.service
ffmpeg -version | head -n 1
sudo -u pullvio /opt/pullvio/venv/bin/yt-dlp --version
df -h /
findmnt -no SOURCE,FSTYPE,OPTIONS /
```

Expected results:

- Docker and the SSM Agent report `active`.
- FFmpeg and yt-dlp print a version.
- `/` is mounted read-write and has sufficient free space.
- `/opt/pullvio`, `/var/lib/pullvio/tmp`, and `/var/log/pullvio` remain owned by
  `pullvio:pullvio` with mode `750`.

The `ubuntu` account is an operator account. The worker runtime is intentionally
isolated under the `pullvio` user, so invoke worker tools with `sudo -u pullvio`
rather than weakening directory permissions.

## Safe restart

Before restarting, confirm no production job is active. Once the worker exists,
the job-drain procedure must be used before this command.

```bash
sudo reboot
```

Wait about one minute, reconnect, and run the routine health check. The Elastic
IP should remain `3.212.192.122`.

For a stop/start operation, use the AWS console and verify both EC2 status checks
return `OK` before resuming work.

## Logs and diagnostics

Useful host-level commands:

```bash
sudo journalctl -u docker --since "30 minutes ago" --no-pager
sudo journalctl -u snap.amazon-ssm-agent.amazon-ssm-agent.service --since "30 minutes ago" --no-pager
sudo dmesg --level=err,warn | tail -n 100
docker ps --all
docker system df
```

Worker-specific diagnostics:

```bash
sudo systemctl status pullvio-media-worker --no-pager
sudo docker ps --filter name=pullvio-media-worker
sudo docker ps --filter name=pullvio-pot-provider
sudo docker logs --since 30m pullvio-media-worker
sudo docker logs --since 30m pullvio-pot-provider
sudo du -sh /var/lib/pullvio/tmp
```

## SSM recovery path

Use AWS Systems Manager Session Manager when direct SSH fails because the source
IP is stale, a local key is unavailable, or the SSH service is unhealthy:

1. Open **AWS Console → Systems Manager → Session Manager**.
2. Start a session for `i-0e0fe842a01633b73`.
3. Inspect `ssh.socket`, `/etc/ssh/sshd_config`, and the security group.
4. Do not broaden port 22 to the world as a recovery shortcut.

The active SSH listener is socket-managed on Ubuntu:

```bash
systemctl status ssh.socket
ss -ltnp | grep ':22 '
```

## Key compromise or loss

If the PEM key may have leaked:

1. Remove its public key from the instance immediately through SSM.
2. Create a new administrator key pair.
3. Test the new key in a second terminal before removing all old access.
4. Rotate any local copies and update this runbook if the filename changes.
5. Review CloudTrail, authentication logs, and recent instance activity.

If the only key is lost, do not create a globally open SSH rule. Recover through
SSM and install a replacement public key.

## Related AWS resources

- SQS queue: `pullvio-media-jobs`
- Dead-letter queue: `pullvio-media-jobs-dlq`
- S3 bucket: `pullvio` (Block Public Access enabled)
- CloudFront distribution: `E3TZ7LPQNNJJDM`
- Delivery hostname: `media.pullvio.com`
- CloudWatch log group: `/pullvio/worker`
- SNS topic: `pullvio-infrastructure-alerts`
- Alert email: `qinjiexu8@gmail.com`

CloudFront currently remains on the Free plan. Upgrade is an operational and
cost decision, not a prerequisite for private backend development.

## Download retention

Completed MP4, MP3, and cover artifacts are private and application-accessible
for 24 hours from the atomic completion transaction. Supabase owns the hard
expiry timestamp and Vercel never signs a CloudFront URL beyond it. The S3
`outputs/` lifecycle rule is the physical cleanup layer and must remain enabled
with a one-day expiration policy. Because S3 lifecycle execution is asynchronous,
objects may remain internally for a short period after the user-facing access
window closes, but they must not become downloadable again.

After changing storage policy, verify both layers:

1. `download_artifacts.expires_at` is approximately 24 hours after completion;
2. signed delivery stops at that timestamp;
3. the S3 lifecycle rule remains enabled for the `outputs/` prefix;
4. direct S3 and unsigned CloudFront requests continue to return `403`.

## Backend implementation status

The AWS foundation, database lifecycle, Vercel control API, and worker are
deployed. The API is same-origin at `https://pullvio.com/api/media/jobs`; no
`api.pullvio.com` DNS record or public EC2 HTTP listener is required. Public
processing remains disabled by `media_runtime_config.accepting_jobs` while the
source-site egress path is completed.

Ready infrastructure:

- encrypted EC2 worker host and runtime dependencies;
- private S3 storage and lifecycle cleanup;
- SQS queue and dead-letter queue;
- CloudFront OAC, signed-URL key group, TLS, and `media.pullvio.com`;
- IAM instance role, SSM, logs, alarms, and email notification channel.
- Vercel production OIDC producer role and environment configuration;
- queued, processing, ready, failed, canceled, and retry frontend states;
- Deno 2.9.3, yt-dlp 2026.07.04 EJS, and FFmpeg in the worker image;
- verified signed CloudFront delivery (`200`) with unsigned CloudFront and direct
  S3 access blocked (`403`).

Still required before public activation:

- choose and test a policy-compliant source-site egress strategy for YouTube;
- run one authorized source download end to end through yt-dlp;
- review production concurrency and cost limits;
- explicitly enable the database kill switch only after those gates pass.

Do not upload a maintainer's personal YouTube cookies to EC2. The current AWS
public IP receives YouTube's `LOGIN_REQUIRED` anti-bot response even though the
required Deno and EJS components are present.

The controlled egress experiment was completed on 2026-07-17. One fresh
Elastic IP (`54.167.31.14`) received the same immediate `LOGIN_REQUIRED`
response during a single authorized metadata probe. The experiment stopped
without rotating additional addresses. The worker was restored to
`3.212.192.122`, and the test address was released. Treat this as an AWS
data-center egress limitation, not as evidence that another random Elastic IP
will work.

Do not repeat Elastic IP rotation. The next source-site validation must use a
policy-compliant contracted egress path, or the product must exclude sources
that reject the worker network.
