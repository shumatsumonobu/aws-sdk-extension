# Changelog

All notable changes to this project will be documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/).

## [1.0.1] - 2026-03-08

### Fixed

- `detectFaces()` now correctly propagates errors instead of silently returning an empty array.
- `RekognitionCollectionDeleteException` reported an incorrect error name internally.
- `SESClient.body()` could throw when `null` was passed as template variables.

### Changed

- Switched template engine from `handlebars-extd` to the official [Handlebars](https://handlebarsjs.com/) package. No API changes — template syntax works the same.
- Improved error messages for `FaceMissingException` and `MultipleFacesException`.
- Updated all dependencies to latest versions (AWS SDK v3.1004+, Handlebars 4.7, etc.).

## [1.0.0] - 2024-03-24

Initial release.

### Added

- **RekognitionClient** — Face detection, face comparison, and collection management (create, list, delete, index, search, list faces, delete faces).
- **SESClient** — Email sending with fluent builder API, Handlebars template support, and multibyte sender name encoding.
- Exception classes: `FaceMissingException`, `MultipleFacesException`, `FaceIndexException`, `RekognitionCollectionCreateException`, `RekognitionCollectionDeleteException`.
- CJS and ESM dual-format builds.

[1.0.1]: https://github.com/shumatsumonobu/aws-sdk-extension/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/shumatsumonobu/aws-sdk-extension/releases/tag/v1.0.0
