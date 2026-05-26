# mosvera.io

Public website, schema host, and live aesthetic demonstrator for Mosvera.

The site is intentionally static. It demonstrates the Mosvera model by letting
visitors switch between checked-in aesthetic compositions and see the same site
re-theme immediately. Production adopters bring Mosvera into their own
platforms; this repo is the reference public example, not a hosted runtime
dependency.

## Local Preview

```sh
python3 -m http.server 8099
```

Then open `http://localhost:8099/`.

## Verification

```sh
node scripts/verify.mjs
```

The verifier checks schema endpoint files, required v1 aesthetics, and common
public-release safety problems.
