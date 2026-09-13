# Publication readiness

Status: `LOCAL_RELEASE_CANDIDATE / GITHUB_REPOSITORY_NOT_CREATED`.

No productive DID, key, passphrase, wallet, rail, runtime or API credential is required. NPM publication is `NPM_PUBLICATION_PENDING_SCOPE_OWNERSHIP`.

The publication script requires an already authenticated GitHub CLI, refuses a dirty tree or conflicting remote, creates only `OWNER/flop-work-execution-receipt`, runs all checks, packs fresh artifacts and creates an alpha release. It contains no credentials and never starts interactive authentication.
