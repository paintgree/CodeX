# AgentForge Pro Coder

Original Codex-style AI coding assistant starter.

It can open a local repo folder by path, inspect files, read/write/create/delete code, run internal checks like tests/build/lint/typecheck, diagnose errors, fix code, re-run checks, and give a clean summary.

It is not OpenAI Codex and does not copy any proprietary product.

## Install

```bash
npm install
cp apps/api/.env.example apps/api/.env
```

Add your OpenAI key in `apps/api/.env`.

## Run

```bash
npm run dev
```

Open `http://localhost:5173`.

## Use

Paste your repo path into the app, then ask:

```text
Analyze this repo, find errors, fix them, and run the best available tests/build checks.
```

Cloud websites cannot directly access your computer folders. For cloud mode, use GitHub integration or ZIP upload.

## Agent response style

After every repair, AgentForge Pro explains the work like a professional developer:

```text
Fixed it.

What was wrong:
- Human-readable explanation of the bug.

I changed:
- file/path.ext — what changed and why.

Verified:
- Commands/tests/build checks that were run.

Next step:
- What you should do now.
```

This is designed so non-coders can understand what happened.
