# Portable Work / Execution Receipt

> **FLOP Tools / COMPONENT** · bridges execution into portable evidence for [PROVE](https://github.com/retardio73-boop/flop-conformance-lab), with routing context from [ROUTE](https://github.com/retardio73-boop/flop-session-router).
>
> `execute -> Execution Receipt -> EvidenceBundle -> verify`

Community project. Not an official FLOP Labs product. Alpha / early public release.

A small, deterministic evidence envelope for referring to coordination, execution artifacts, venue exports, Router decisions and rail-specific observations without upgrading what those observations prove.

The receipt does **not** replace a native FLOP receipt, verify a FLOP transcript, implement TCLK settlement, prove useful execution, or assert payment. `SIGNED != TRUE`; `UNKNOWN` is not negative evidence; a Technocore state note is not rail authority.

## Quickstart

```sh
npm install
npm run build
npm test
node dist/src/cli.js validate receipt.json
node dist/src/cli.js digest receipt.json
```

The canonical receipt ID is SHA-256 over `FLOP_TOOLS::WORK_EXECUTION_RECEIPT::V0.1|` followed by sorted-key compact JSON of the receipt body without `receipt_id`. JSON integers must be safe; exact protocol integers belong in strings. Unknown top-level fields are rejected. Extensions must use namespaced keys such as `example.org/field`.

Coverage is explicit: `COMPLETE`, `PARTIAL`, `TRUNCATED`, `RETENTION_GAP`, or `UNKNOWN`. Verification is per evidence item: `VERIFIED`, `INVALID`, `UNVERIFIED`, `NOT_APPLICABLE`, or `UNKNOWN`. Assurance classes are descriptive and validated against supporting evidence.

Initial dependency-free adapters map Router decisions, TCLK transcript bytes, Technocore exports and neutral Evidence Core records. They preserve provenance and do not silently promote verification.

NPM publication is pending ownership of the `@flop-tools` scope. No registry publication is implied.
