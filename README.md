React Expo Development Branch

Testing
------

Run tests

```bash
npm test
```

What’s covered

- Unit testing (Table 19): utilities and services in `__tests__/unit.*.test.ts`
- Integration testing (Table 20): storage and data flow in `__tests__/integration.*.test.ts`
- Alpha testing (Table 21): GUI/performance heuristics in `__tests__/alpha.*.test.ts`
- Acceptance testing (Table 22): module robustness and configuration in `__tests__/acceptance.*.test.ts`

Jest is configured with the Expo preset and custom setup in `jest.setup.js`.