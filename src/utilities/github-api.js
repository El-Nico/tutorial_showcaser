import { Octokit } from "@octokit/core";

export const OWNER = "El-Nico";
export async function getRepoContents(owner, repo, path) {
  const octokit = new Octokit({
    auth: process.env.REACT_APP_GITHUB_TOKEN,
  });

  let data = await octokit.request(
    "GET /repos/{owner}/{repo}/contents/{path}",
    {
      owner: owner,
      repo: repo,
      path: path,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
        accept: "application/vnd.github.json",
      },
    }
  );
  return data;
}

export async function getReadme(owner, repo, dir) {
  const octokit = new Octokit({
    auth: process.env.REACT_APP_GITHUB_TOKEN,
  });

  let data = await octokit.request("GET /repos/{owner}/{repo}/readme/{dir}", {
    owner: owner,
    repo: repo,
    dir: dir,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  return data;
}

export async function create_update_file(
  owner,
  repo,
  path,
  message,
  committer,
  content,
  sha
) {
  const octokit = new Octokit({
    auth: process.env.REACT_APP_GITHUB_TOKEN,
  });

  const data = await octokit.request(
    "PUT /repos/{owner}/{repo}/contents/{path}",
    {
      owner: owner,
      repo: repo,
      path: path,
      message: message,
      committer: committer,
      content: content,
      sha: sha,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  return data;
}
