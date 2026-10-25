"""Fail-closed transport, dated snapshot checks, and atomic bundle publication."""
import datetime
import json
import subprocess
from pathlib import Path


def fetch(url, path):
    path = Path(path)
    headers = path.with_suffix(path.suffix + '.headers')
    # Do not follow an official error redirect or retry access denials.
    result = subprocess.run([
        'curl', '--silent', '--show-error', '--max-time', '45',
        '--connect-timeout', '15', '--proto', '=https',
        '--dump-header', str(headers), '--write-out', '%{http_code}',
        url, '-o', str(path),
    ], capture_output=True, text=True)
    status = result.stdout.strip()
    header_text = headers.read_text(errors='replace') if headers.exists() else ''
    location = next((line.split(':', 1)[1].strip() for line in header_text.splitlines()
                     if line.lower().startswith('location:')), '')
    if result.returncode or status != '200':
        raise RuntimeError(f'{url}: HTTP {status or "unknown"}; curl={result.returncode}; '
                           f'location={location}; {result.stderr.strip()[:300]}')
    body = path.read_bytes().lstrip(b'\xef\xbb\xbf \t\r\n').lower()
    if not body or body.startswith((b'<', b'<!doctype')):
        raise RuntimeError(f'{url}: empty or HTML response; HTTP 200')


def validate_risk_rows(raw, as_of, parse_date):
    # A bare [] contains no publication date. It cannot prove that a daily
    # announcement feed is complete; do not stamp download time as coverage.
    for key in ('attention', 'warning', 'disposal'):
        rows = raw[key]
        if not isinstance(rows, list) or not rows:
            raise ValueError(f'{key}: no dated coverage for {as_of}; '
                             'an empty feed is unverified, not a download failure')
        dates = [parse_date(row['Date']) for row in rows]
        if max(dates) != as_of:
            raise ValueError(f'{key}: source date {max(dates)} does not match quote date {as_of}')


def publish_bundle(out, data):
    out = Path(out)
    datetime.date.fromisoformat(data['asOf'])
    old = json.loads(out.read_text()) if out.exists() else {}
    if old.get('asOf', '') > data['asOf']:
        raise ValueError('Refuse to replace newer data')
    # Identical verified content keeps its original retrieval time and avoids
    # misleading freshness changes and redundant data commits on holidays.
    previous, incoming = dict(old), dict(data)
    previous['provenance'] = {k: v for k, v in old.get('provenance', {}).items() if k != 'retrievedAt'}
    incoming['provenance'] = {k: v for k, v in data.get('provenance', {}).items() if k != 'retrievedAt'}
    if previous == incoming:
        return False
    tmp = out.with_suffix('.tmp')
    try:
        tmp.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':'), allow_nan=False))
        tmp.replace(out)
    finally:
        tmp.unlink(missing_ok=True)
    return True


def run_collection(collect, repo):
    """Keep the verified bundle intact on failure and expose an artifact reason."""
    status_path = Path(repo) / 'collection-status.json'
    status = {'attemptedAt': datetime.datetime.now(datetime.timezone.utc).isoformat()}
    try:
        result = collect()
        status.update(state='verified', **result)
        return result
    except Exception as error:
        status.update(state='failed', reason=f'{type(error).__name__}: {error}')
        out = Path(repo) / 'latest.json'
        if out.exists():
            status['retainedAsOf'] = json.loads(out.read_text()).get('asOf')
        raise
    finally:
        status_path.write_text(json.dumps(status, ensure_ascii=False, indent=2))
