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

export async function getReadmez(repo, path, owner = OWNER) {
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
        accept: "application/vnd.github.html",
      },
    }
  );
  return data;
}
