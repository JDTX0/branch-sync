# Changelog

## v1.5.0

- Optimized code to search for existing PR's before opening a new one
- Added helpful GitHub action summaries to link to the created PR or provide
a reason why the PR wasn't created (e.g. no diff)
- Return the correct PR URL in the GitHub actions output instead of an API URL
- Updated existing search PR code to look for a predefined title rather than simply
using the source/target branch as that can pick up PR's that aren't created by
the action.
- NodeJS changed to v16
- Rebuilt code against latest actions toolkit to fix `set-output` deprecated warnings
- Updated all dependencies/library versions
