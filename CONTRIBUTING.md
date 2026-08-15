# Contributing

We are open to, and grateful for, any contributions made by the community.

## Requirements

This repository requires using [Bun](https://bun.sh/) as your runtime.

## Local Development

You can run a local development server by running `bun run start:dev` which will monitor for any changes and rebuild the examples on every code change. The output will be a bunch of `.pdf` files in the `/examples` directory for testing server-side `react-pdf` rendering.

To test client-side rendering, you can run `cd examples/client && bun install && bun start` which will start a web server that allows you to test the `react-pdf` client-side render support. Make sure to run `bun run build` in the root of the repo to rebuild the `react-pdf-charts` library before running the client example.

## Commit messages

This repo uses [semantic-release](https://semantic-release.gitbook.io/semantic-release) on `master`. Versions and GitHub releases are created from [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: …` — minor version (new functionality)
- `fix: …` — patch version (bug fix)
- `docs:`, `chore:`, `refactor:`, `test:`, `ci:` — no release unless you also include a `feat` or `fix`
- Breaking changes — add `BREAKING CHANGE:` in the commit body (or `feat!:` / `fix!:`) for a major version

Keep the subject short and in the imperative mood (`fix: Handle missing viewBox`).

## Building

To prepare a new release run `bun run build` which will generate the necessary output files in `/dist`.

