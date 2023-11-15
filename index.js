const core = require("@actions/core");
const github = require("@actions/github");

const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

async function run() {
  try {
    const fromBranch = core.getInput("FROM_BRANCH", { required: true });
    const toBranch = core.getInput("TO_BRANCH", { required: true });
    const githubToken = core.getInput("GITHUB_TOKEN", { required: true });
    const pullRequestTitle = core.getInput("PULL_REQUEST_TITLE");
    const pullRequestBody = core.getInput("PULL_REQUEST_BODY");
    const pullRequestAutoMergeMethod = core.getInput("PULL_REQUEST_AUTO_MERGE_METHOD");
    const pullRequestIsDraft =
      core.getInput("PULL_REQUEST_IS_DRAFT").toLowerCase() === "true";
    const contentComparison =
      core.getInput("CONTENT_COMPARISON").toLowerCase() === "true";
    const reviewers = JSON.parse(core.getInput("REVIEWERS"));
    const team_reviewers = JSON.parse(core.getInput("TEAM_REVIEWERS"));
    const labels = JSON.parse(core.getInput("LABELS"));
    let isMerged = false;

    console.log(
      `Determining if ${fromBranch} should be synced to ${toBranch}...`
    );

    const octokit = new github.getOctokit(githubToken);

    // Find all current open PR's that are from the source branch to the target branch
    const { data: currentPulls } = await octokit.rest.pulls.list({
      owner,
      repo,
      state: "open",
      head: `${owner}:${fromBranch}`,
      base: toBranch,
    });

    // Check if there's a current pull request for syncing our branches.
    // First check if the title matches a custom provided pullRequestTitle,
    // otherwise check if the title matches the default title.
    const currentPull = currentPulls.find((pull) => {
      return pull.title == pullRequestTitle ? pullRequestTitle : `sync: ${fromBranch} to ${toBranch}`;
    });

    // If there's no current PR open, then go through the steps of creating one
    if (!currentPull) {
      // Run content comparison (if enabled) to determine if we should create a PR
      let shouldCreatePullRequest = true;
      if (contentComparison) {
        shouldCreatePullRequest = await hasContentDifference(
          octokit,
          fromBranch,
          toBranch
        );
      }

      if (shouldCreatePullRequest) {
        const { data: pullRequest } = await octokit.rest.pulls.create({
          owner,
          repo,
          head: fromBranch,
          base: toBranch,
          title: pullRequestTitle
            ? pullRequestTitle
            : `sync: ${fromBranch} to ${toBranch}`,
          body: pullRequestBody
            ? pullRequestBody
            : `sync-branches: New code has just landed in ${fromBranch}, so let's bring ${toBranch} up to speed!`,
          draft: pullRequestIsDraft,
        });

        // Add reviewers/team reviewers if they're set in the inputs
        if (reviewers.length > 0 || team_reviewers.length > 0) {
          octokit.rest.pulls.requestReviewers({
            owner,
            repo,
            pull_number: pullRequest.number,
            reviewers,
            team_reviewers,
          });
        }

        // Add labels if they're set in the inputs
        if (labels.length > 0) {
          octokit.rest.issues.addLabels({
            owner,
            repo,
            issue_number: pullRequest.number,
            labels
          })
        }
        // Auto-merge the PR if it's enabled
        if (pullRequestAutoMergeMethod) {
          try {
            await octokit.rest.pulls.merge({
              owner,
              repo,
              pull_number: pullRequest.number,
              merge_method: pullRequestAutoMergeMethod
            });
            isMerged = true;
          } catch (err) {
            isMerged = false;
          }
        }

        console.log(
          `Pull request (${pullRequest.number}) successfully created${isMerged ? ' and merged' : ''}! You can view it here: ${pullRequest.html_url}`
        );

        core.setOutput("PULL_REQUEST_URL", pullRequest.html_url.toString());
        core.setOutput("PULL_REQUEST_NUMBER", pullRequest.number.toString());
      } else {
        console.log(
          `There is no content difference between ${fromBranch} and ${toBranch}.`
        );
      }
    } else {
      // PR already exists, nothing to do. Just output a message.
      console.log(
        `There is already a pull request (${currentPull.number}) to ${toBranch} from ${fromBranch}.`,
        `You can view it here: ${currentPull.url}`
      );

      core.setOutput("PULL_REQUEST_URL", currentPull.url.toString());
      core.setOutput("PULL_REQUEST_NUMBER", currentPull.number.toString());
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function hasContentDifference(octokit, fromBranch, toBranch) {
  const { data: response } = await octokit.rest.repos.compareCommits({
    owner,
    repo,
    base: toBranch,
    head: fromBranch,
    page: 1,
    per_page: 1,
  });
  return response.files.length > 0;
}

run();
