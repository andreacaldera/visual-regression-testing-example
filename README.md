# Visual Regression Testing Example

This is an example on how to run simple self hosted visual regression testing using Playwright and Github actions.

## Getting Started

Run the end-to-end tests:

```bash
    pnpm e2e-test
```

If visual regression are occurring, the end-to-end test should fail.

In order to update end-to-end snapshot run:

```bash
    pnpm e2e-test:e2e-test:update-snapshot
```

## PR validation

End-to-end tests run as part of PR validation, if visual regressions are occurring, the pipeline will fail and test results will be attached to the Github workflow run. These results should contain:

- Updated screenshot
- Original screenshot
- Visual differences

## Accepting visual changes

If visual changes are expected, snapshots should be updated and push to Github as part of the pull requests. Screenshots can then be reviewed and approved / rejected / be commented on.
