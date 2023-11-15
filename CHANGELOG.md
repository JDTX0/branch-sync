# Changelog

## v1.5.0

- NodeJS changed to v16
- Rebuilt code against latest actions toolkit to fix `set-output` deprecated warnings
- Optimized code to search for existing PR's before opening a new one
- Return the correct PR URL in the GitHub actions output instead of an API URL
- Updated existing search PR code to look for a predefined title rather than simply
using the source/target branch as that can pick up PR's that aren't created by the action.
- Updated all dependencies/library versions
