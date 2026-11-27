# Contributing to Burnrate

Thanks for helping improve Burnrate!

## Reporting bugs and requesting features

Use the **Feedback** menu in the app, or open an issue directly with the
[bug report](https://github.com/lance6x5/meeting-cost-timer/issues/new?template=bug_report.yml) or
[feature request](https://github.com/lance6x5/meeting-cost-timer/issues/new?template=feature_request.yml)
form. Please don't include personal or confidential data.

## Triage flow

1. New issues are automatically labelled `triage` (plus `bug` or `enhancement`).
2. The maintainer reviews them, removes `triage` and relabels / prioritises (or closes with a reason).
3. Work happens on a branch, then a pull request whose description references `Fixes #N` so the issue
   closes automatically on merge.
4. Changes are recorded under `## [Unreleased]` in [CHANGELOG.md](CHANGELOG.md) and moved into a
   versioned section when released (see the Versioning section in the README).

## Licensing of contributions

Burnrate is licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE.md). By submitting a pull request, you agree that your contribution is licensed to Silverlight DevTech under the same terms, and that Silverlight DevTech may also offer it under its commercial licenses.

## Development

```bash
npm ci
npm test
npm run dev
```
