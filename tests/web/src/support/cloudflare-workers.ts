// A stand-in for the Workers runtime's `cloudflare:workers` module (aliased in
// vitest.config.ts): the app reads its bindings from `env`, and each test
// puts the ones it needs there.
export const env: Record<string, unknown> = {};
