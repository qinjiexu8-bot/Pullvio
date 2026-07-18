import json
import sys
import unittest
from types import SimpleNamespace
from unittest.mock import Mock

sys.modules.setdefault("boto3", Mock())

from pullvio_worker.worker import MediaWorker


JOB_ID = "7a3fc784-77f1-48f3-a601-718a0357bf49"


class WorkerLifecycleTests(unittest.TestCase):
    def test_claim_rpc_error_keeps_message_for_retry(self):
        worker = MediaWorker.__new__(MediaWorker)
        worker.config = SimpleNamespace(
            queue_url="queue-url",
            worker_id="test-worker",
            lease_seconds=180,
        )
        worker.database = Mock()
        worker.database.rpc.side_effect = RuntimeError("database unavailable")
        worker.sqs = Mock()
        worker.s3 = Mock()

        worker.handle_message(
            {
                "ReceiptHandle": "receipt",
                "Body": json.dumps({"schemaVersion": 1, "jobId": JOB_ID}),
            }
        )

        worker.sqs.delete_message.assert_not_called()
        worker.sqs.change_message_visibility.assert_called_once_with(
            QueueUrl="queue-url",
            ReceiptHandle="receipt",
            VisibilityTimeout=15,
        )

    def test_source_slot_enforces_a_minimum_gap_between_jobs(self):
        worker = MediaWorker.__new__(MediaWorker)
        worker.config = SimpleNamespace(source_min_interval_seconds=10.0)
        worker._last_source_started_at = 95.0
        worker._monotonic = Mock(side_effect=[100.0, 105.0])
        worker._sleep = Mock()

        worker._wait_for_source_slot()

        worker._sleep.assert_called_once_with(5.0)
        self.assertEqual(worker._last_source_started_at, 105.0)

    def test_run_drains_large_stdout_without_pipe_deadlock(self):
        worker = MediaWorker.__new__(MediaWorker)
        output = worker._run(
            JOB_ID,
            "unused-receipt",
            [sys.executable, "-c", "import sys; sys.stdout.write('x' * 200000)"],
            timeout=5,
        )

        self.assertEqual(len(output), 200000)


if __name__ == "__main__":
    unittest.main()
