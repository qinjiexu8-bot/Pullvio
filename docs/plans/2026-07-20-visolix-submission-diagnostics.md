# Visolix Submission Diagnostics Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Preserve safe diagnostics for failed Visolix submissions and stop retrying responses whose provider outcome cannot be safely resubmitted.

**Architecture:** Extend worker errors with a small, JSON-safe provider diagnostic and an explicit outcome classification. The worker records that diagnostic through a service-role-only RPC before failing the media job; known failures become terminal provider runs, while network-level unknown outcomes remain ambiguous so a duplicate paid request is never sent.

**Tech Stack:** Python worker, requests, unittest, Supabase Postgres migrations and RPCs.

---

### Task 1: Specify safe provider error behavior

**Files:**
- Modify: `services/media-worker/tests/test_visolix.py`
- Modify: `services/media-worker/tests/test_worker.py`

**Step 1:** Add a failing client test for an HTTP 200 response with an invalid Visolix payload.

**Step 2:** Assert that the error is terminal, outcome-known, and contains only bounded structural diagnostics.

**Step 3:** Add a failing worker test asserting that submission failures are persisted before being re-raised.

**Step 4:** Run the focused tests and confirm they fail for the missing behavior.

### Task 2: Add bounded diagnostics to worker errors

**Files:**
- Modify: `services/media-worker/pullvio_worker/domain.py`
- Modify: `services/media-worker/pullvio_worker/visolix.py`

**Step 1:** Add optional `provider_http_status`, `provider_outcome_known`, and `safe_diagnostic` fields to `WorkerError`.

**Step 2:** Build diagnostics from response status, content type, top-level field names, and scalar field types only.

**Step 3:** Mark invalid submission responses terminal and known; keep request transport failures terminal and ambiguous.

**Step 4:** Run the Visolix unit tests.

### Task 3: Persist provider submission failures

**Files:**
- Create: `supabase/migrations/202607200001_add_provider_submission_diagnostics.sql`
- Modify: `services/media-worker/pullvio_worker/worker.py`
- Modify: `lib/database.types.ts`

**Step 1:** Add a bounded `last_error_info` JSON object to provider runs.

**Step 2:** Add a service-role-only RPC that records known failures as `failed` and unknown outcomes as `ambiguous`.

**Step 3:** Call the RPC when Visolix submission raises a `WorkerError`, then re-raise the original error.

**Step 4:** Run worker tests and a Supabase dry-run.

### Task 4: Verify and document operations

**Files:**
- Modify: `docs/runbooks/visolix-media-provider.md`

**Step 1:** Document the new diagnostic fields and explain why ambiguous submissions must not be automatically replayed.

**Step 2:** Run the complete media-worker test suite.

**Step 3:** Run repository checks relevant to migrations and scan the diff for secrets.

**Step 4:** Review the final diff; do not submit, deploy, or replay the failed OK.ru job without separate authorization.
