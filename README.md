# Branch sync

GitHub Action to sync one branch when another is updated.

This is a fork of [sync-branches](https://github.com/TreTuna/sync-branches)
as that project is unmaintained. See the [CHANGELOG](./CHANGELOG.md) for more
info on what has changed.

## Required permissions

By default, GitHub actions isn't allowed to create pull requests. You must allow
actions to create pull requests in the settings of your repository. The setting
can be found under `Settings -> Actions -> General` under `Workflow permissions`,
just tick `Allow GitHub Actions to create and approve pull requests`

## Inputs

:small_red_triangle: in an input name denotes required value.

| Name                              | Description                                                                      | Default                                                                                            | Example                     |
| ------------------------------    | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------- |
| GITHUB_TOKEN :small_red_triangle: | The token to be used for creating the pull request                               |                                                                                                    | `${{secrets.GITHUB_TOKEN}}` |
| FROM_BRANCH :small_red_triangle:  | The branch you want to make the pull request from                                |                                                                                                    | `develop`                   |
| TO_BRANCH :small_red_triangle:    | The branch you want to make the pull request to                                  |                                                                                                    | `main`                      |
| PULL_REQUEST_TITLE                | What you would like as the title of the pull request                             | `sync: {FROM_BRANCH} to {TO_BRANCH}`                                                               |                             |
| PULL_REQUEST_BODY                 | What you would like as the body of the pull request                              | `sync-branches: New code has just landed in {FROM_BRANCH} so let's bring {TO_BRANCH} up to speed!` |                             |
| PULL_REQUEST_IS_DRAFT             | Whether to set the pull request as a draft                                       | `false`                                                                                            |                             |
| CONTENT_COMPARISON                | Check content between branches to prevent PR's with no changes from being opened | `false`                                                                                            |                             |
| REVIEWERS                         | JSON array of GitHub usernames to request as reviewers.                          | `[]`                                                                                               | `'["tretuna"]'`             |
| TEAM_REVIEWERS                    | JSON array of GitHub team names to request as reviewers.                         | `[]`                                                                                               | `'["js-team"]'`             |
| PULL_REQUEST_AUTO_MERGE_METHOD    | Set a method for auto merging. Can be one of `merge`, `squash` or `rebase`       | `false`                                                                                            |                             |

## Outputs

| Name                | Description                                                                           |
| ------------------- | ------------------------------------------------------------------------------------- |
| PULL_REQUEST_URL    | Set to the URL of the created pull request, or existing pull request if one is found. |
| PULL_REQUEST_NUMBER | Pull request number from the generated pull request or currently open one             |

## Example usage

```yaml
name: Sync
on:
  push:
    branches:
    # Change this to whatever branch you want this action to trigger on.
    # Ideally it should match the "FROM_BRANCH" setting below.
      - main

permissions:
  # Needed to read branches
  contents: read
  # Needed to create PR's
  pull-requests: write

jobs:
  sync-branches:
    runs-on: ubuntu-latest
    name: Syncing branches
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Opening pull request
        id: pull
        uses: jdtx0/branch-sync@v1.5.1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          FROM_BRANCH: "main"
          TO_BRANCH: "develop"
```

## Development

For local development, you should first install all of the deps of the project by
running `yarn install`

You can then lint & build the project by simply running `yarn lint && yarn package`
