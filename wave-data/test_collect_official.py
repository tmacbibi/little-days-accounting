import csv
import datetime
import io
import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import collect_official as collector
import collector_io


class CollectorTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.repo = Path(self.temp.name)
        self.as_of = '2026-10-08'
        self.fail_source = None

    def fake_fetch(self, url, path):
        path = Path(path)
        if self.fail_source and self.fail_source in url:
            raise RuntimeError(f'{url}: HTTP 302; location=https://www.tpex.org.tw/errors')
        if path.name == 'quotes.csv':
            stream = io.StringIO()
            writer = csv.writer(stream)
            writer.writerow(['代號', '名稱', '資料日期', '收盤', '漲跌', '成交股數', '成交金額', '開盤', '最高', '最低'])
            for code in [str(code) for code in range(1000, 1701)] + ['7856']:
                writer.writerow([code, 'fixture', self.as_of.replace('-', '/'), 20, 1, '12,000', 240000, 19, 21, 18])
            path.write_text(stream.getvalue())
            return
        row = {'Date': self.as_of.replace('-', ''), 'SecuritiesCompanyCode': '1000',
               'DispositionPeriod': '115/10/01~115/10/15'}
        if path.name == 'actions.json':
            # Exactly the requested range, including a legitimate zero-event table.
            start, end = url.split('startDate=')[1].split('&endDate=')
            end = end.split('&')[0]
            body = {'stat': 'ok', 'date': start.replace('/', '') + '~' + end.replace('/', ''),
                    'tables': [{'totalCount': 0, 'data': []}]}
        elif path.name.startswith('history-'):
            body = {'tables': [{'data': []}]}
            if path.name.endswith('-0.json'):
                end = datetime.date.fromisoformat(self.as_of)
                body['tables'][0]['data'] = [[(end-datetime.timedelta(days=i)).isoformat(), 12, 0, 19, 21, 18, 20]
                                            for i in range(11)]
        else:
            body = [row]
        path.write_text(json.dumps(body))

    def collect(self):
        # Simulated clock permits the next trading-day fixture without using
        # the real download date as the fixture's official quote date.
        class Clock(datetime.datetime):
            @classmethod
            def now(cls, tz=None):
                return cls(2026, 10, 13, tzinfo=tz)
        with patch.object(collector, 'repo', self.repo), patch.object(collector, 'fetch', self.fake_fetch), \
                patch.object(collector.datetime, 'datetime', Clock):
            return collector_io.run_collection(collector.collect, self.repo)

    def test_cross_day_failure_and_recovery_preserves_old_bytes(self):
        first = self.collect()
        self.assertTrue(first['changed'])
        before = (self.repo/'latest.json').read_bytes()
        self.as_of = '2026-10-12'
        self.fail_source = 'tpex_trading_warning_note'
        with self.assertRaisesRegex(RuntimeError, 'HTTP 302'):
            self.collect()
        self.assertEqual((self.repo/'latest.json').read_bytes(), before)
        status = json.loads((self.repo/'collection-status.json').read_text())
        self.assertEqual(status['retainedAsOf'], '2026-10-08')
        self.assertIn('tpex_trading_warning_note', status['reason'])
        self.fail_source = None
        self.collect()
        latest = json.loads((self.repo/'latest.json').read_text())
        self.assertEqual(latest['asOf'], '2026-10-12')
        self.assertEqual(latest['risk']['asOf'], '2026-10-12')
        self.assertEqual(latest['actions']['asOf'], '2026-10-12')
        self.assertTrue(all(q['date'] == latest['asOf'] for q in latest['quotes']))

    def test_repeated_verified_content_keeps_original_download_time(self):
        self.collect()
        before = (self.repo/'latest.json').read_bytes()
        self.assertFalse(self.collect()['changed'])
        self.assertEqual((self.repo/'latest.json').read_bytes(), before)

    def test_short_history_is_real_and_volume_units_are_shares(self):
        self.collect()
        data = json.loads((self.repo/'latest.json').read_text())
        self.assertEqual(len(data['history']['7856']), 11)
        self.assertEqual(data['history']['7856'][-1]['volume'], 12000)
        self.assertEqual(data['quotes'][0]['volume'], 12000)
        self.assertEqual(data['actions']['events'], [])

    def test_old_concurrent_result_cannot_replace_newer_bundle(self):
        self.as_of = '2026-10-12'
        self.collect()
        before = (self.repo/'latest.json').read_bytes()
        self.as_of = '2026-10-08'
        with self.assertRaisesRegex(ValueError, 'newer data'):
            self.collect()
        self.assertEqual((self.repo/'latest.json').read_bytes(), before)

    def test_stale_announcement_does_not_complete_new_day(self):
        raw = {key: [{'Date': '1151008'}] for key in ('attention', 'warning', 'disposal')}
        with self.assertRaisesRegex(ValueError, '2026-10-08.*2026-10-12'):
            collector_io.validate_risk_rows(raw, '2026-10-12', collector.date)

    def test_incomplete_sources_leave_verified_previous_day_intact(self):
        self.collect()
        before = (self.repo/'latest.json').read_bytes()
        self.as_of = '2026-10-12'
        original = self.fake_fetch
        for failing_source in ('warning.json', 'actions.json', 'history-7856-0.json'):
            with self.subTest(source=failing_source):
                def incomplete(url, path):
                    original(url, path)
                    path = Path(path)
                    if path.name == failing_source:
                        data = json.loads(path.read_text())
                        if failing_source == 'warning.json':
                            data[0]['Date'] = '1151008'
                        elif failing_source == 'actions.json':
                            data['tables'][0]['totalCount'] = 1
                        else:
                            data['tables'][0]['data'] = []
                        path.write_text(json.dumps(data))
                with patch.object(self, 'fake_fetch', incomplete):
                    with self.assertRaises((ValueError, AssertionError, RuntimeError)):
                        self.collect()
                self.assertEqual((self.repo/'latest.json').read_bytes(), before)

    def test_invalid_json_reports_which_source_failed(self):
        self.collect()
        before = (self.repo/'latest.json').read_bytes()
        original = self.fake_fetch
        def invalid(url, path):
            original(url, path)
            if Path(path).name == 'warning.json':
                Path(path).write_text('{broken')
        with patch.object(self, 'fake_fetch', invalid):
            with self.assertRaisesRegex(ValueError, 'warning: invalid official JSON'):
                self.collect()
        self.assertEqual((self.repo/'latest.json').read_bytes(), before)

    def test_empty_undated_feed_is_unverified_and_identifies_source(self):
        raw = {key: [{'Date': '1151008'}] for key in ('attention', 'warning', 'disposal')}
        raw['warning'] = []
        with self.assertRaisesRegex(ValueError, 'warning: no dated coverage.*unverified'):
            collector_io.validate_risk_rows(raw, '2026-10-08', collector.date)

    def test_failed_encoding_cannot_damage_existing_bundle(self):
        self.collect()
        before = (self.repo/'latest.json').read_bytes()
        data = json.loads(before)
        data['quotes'][0]['close'] = float('nan')
        with self.assertRaises(ValueError):
            collector_io.publish_bundle(self.repo/'latest.json', data)
        self.assertEqual((self.repo/'latest.json').read_bytes(), before)
        self.assertFalse((self.repo/'latest.tmp').exists())

    def test_official_date_formats_and_invalid_dates(self):
        for date in ('1151008', '115/10/08', '20261008', '2026/10/08', '2026-10-08'):
            self.assertEqual(collector.date(date), '2026-10-08')
        for date in ('1150230', '', '2026-10-08T17:23:00', '115/13/01'):
            with self.assertRaises(ValueError):
                collector.date(date)
        self.assertIsNone(collector.n('NaN'))
        self.assertIsNone(collector.n('inf'))

    def test_transport_errors_are_bounded_and_do_not_follow_redirects(self):
        cases = [(0, '302', b'', 'Location: https://www.tpex.org.tw/errors\r\n', 'HTTP 302'),
                 (28, '000', b'', '', 'curl=28'),
                 (0, '500', b'{}', '', 'HTTP 500'),
                 (0, '200', b'<!doctype html><html>Error</html>', '', 'HTML'),
                 (0, '200', b'', '', 'empty'),
                 (0, '200', b'{}', '', None)]
        for code, status, body, headers, expected in cases:
            with self.subTest(status=status, code=code, body=body):
                def curl(args, **kwargs):
                    self.assertNotIn('--location', args)
                    self.assertNotIn('--insecure', args)
                    self.assertIn('--max-time', args)
                    Path(args[args.index('-o')+1]).write_bytes(body)
                    Path(args[args.index('--dump-header')+1]).write_text(headers)
                    return subprocess.CompletedProcess(args, code, status, 'timed out' if code else '')
                with patch.object(collector_io.subprocess, 'run', curl):
                    if expected:
                        with self.assertRaisesRegex(RuntimeError, expected):
                            collector_io.fetch('https://www.tpex.org.tw/test', self.repo/'response.json')
                    else:
                        collector_io.fetch('https://www.tpex.org.tw/test', self.repo/'response.json')


if __name__ == '__main__':
    unittest.main()
