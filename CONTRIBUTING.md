# Contributing

We are open to, and grateful for, any contributions made by the community.

## Requirements

This repository requires using [Bun](https://bun.sh/) as your runtime.

## Local Development

You can run a local development server by running `bun run start:dev` which will monitor for any changes and rebuild the examples on every code change. The output will be a bunch of `.pdf` files in the `/examples` directory for testing server-side `react-pdf` rendering.

To test client-side rendering, you can run `cd examples/client && bun install && bun start` which will start a web server that allows you to test the `react-pdf` client-side render support.

## Building

To prepare a new release run `bun run build` which will generate the necessary output files in `/dist`.

