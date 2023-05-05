import { Octokit } from "@octokit/core";

export async function URLtoFile(url) {
  const res = await fetch(url);
  const blob = await res.blob();
  // Gets URL data and read to blob

  console.log(blob);

  const mime = blob.type;
  const ext = mime.slice(mime.lastIndexOf("/") + 1, mime.length);
  // Gets blob MIME type (e.g. image/png) and extracts extension

  const file = new File([blob], `filename.${ext}`, {
    type: mime,
  });
  // Creates new File object using blob data, extension and MIME type

  console.log(file);
  return file;
}

export async function URLtoFile2(url) {
  const res = await fetch(url, {
    // method: "get",
    mode: "no-cors",
    // referrerPolicy: "no-referrer",
    headers: new Headers({ "content-type": "application/zip" }),
  });
  console.log("view res");
  console.log(res);
  const blob = await res.blob();
  // Gets URL data and read to blob

  console.log(blob);

  const mime = blob.type;
  const ext = mime.slice(mime.lastIndexOf("/") + 1, mime.length);
  // Gets blob MIME type (e.g. image/png) and extracts extension

  const file = new File([blob], `filename.${ext}`, {
    type: mime,
  });
  // Creates new File object using blob data, extension and MIME type

  console.log(file.name);
  return file;
}

export function downloadFile(url, fileName) {
  fetch(url, {
    //   method: "get",
    mode: "cors",
    referrerPolicy: "no-referrer",
    // headers: new Headers({ "content-type": "application/zip" }),
  })
    .then((res) => {
      console.log(res.status);
      res.blob();
    })
    .then((res) => {
      // const aElement = document.createElement("a");
      // aElement.setAttribute("download", fileName);
      // const href = URL.createObjectURL(res);
      // aElement.href = href;
      // aElement.setAttribute("target", "_blank");
      // aElement.click();
      // URL.revokeObjectURL(href);
      console.log(res);
    });
}

/* Author: Daniel Ellis 2022 */

export async function getgit(owner, repo, path) {
  // A function to fetch files from github using the api

  let data = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/branches/main`,
    {
      mode: "cors",
      headers: new Headers({
        auth: "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",
      }),
    }
  )
    .then((d) => {
      const x = d.json();
      return x;
    })
    .then((d) => {
      console.log(d);
      return fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/blobs/${d.commit.commit.tree.sha}`
      );
    })
    .then((d) => {
      const y = d.json();
      //console.log(y);
      return y;
    })
    .then((d) => JSON.parse(atob(d.content)));

  return data;
}

// export async function getgit2(owner, repo, path) {
//   const octokit = new Octokit({
//     auth: "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",
//   });

//   let data = await octokit
//     .request("GET /repos/{owner}/{repo}/branches/main", {
//       owner: owner,
//       repo: repo,
//       headers: {
//         "X-GitHub-Api-Version": "2022-11-28",
//       },
//     })
//     .then((d) => {
//       const tree_sha = d.data.commit.commit.tree.sha;
//       return tree_sha;
//     })
//     .then((d) => {
//       return octokit.request(`GET /repos/{owner}/{repo}/git/blobs/${d}`, {
//         owner: owner,
//         repo: repo,
//         headers: {
//           "X-GitHub-Api-Version": "2022-11-28",
//         },
//       });
//     });

//   return data;
// }

export async function getgit2(owner, repo, path) {
  const octokit = new Octokit({
    auth: "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",
  });

  let data = await octokit.request("GET /repos/{owner}/{repo}/zipball", {
    owner: owner,
    repo: repo,
    // path: path,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
      accept: "application/vnd.github+json",
    },
  });
  return data;
}
