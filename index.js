require('dotenv').config();
const { Octokit } = require('@octokit/rest');
const axios = require('axios').default;

const {
    GH_TOKEN
} = process.env;

const owner = "Nthily";
const repo = "KFC-Crazy-Thursday";

var jsonAry = [];
var jsonStr = "";

(async () => {
    try {

        const octokit = new Octokit({
            auth: GH_TOKEN,
        });

        const response = await octokit.rest.issues.listForRepo({
            owner: owner,
            repo: repo,
            labels: "文案提供",
            state: "all"
        });

        const issuesBody = response.data;
        issuesBody.forEach(value => {
            jsonAry.push({
                text: value.body
            });
        })
        jsonStr = JSON.stringify(jsonAry, null, 2);

        console.log(jsonStr);

        const {
            data: { sha: jsonSha }
        } = await octokit.git.createBlob({
            owner: owner,
            repo: repo,
            content: jsonStr
        });

        const commits = await octokit.repos.listCommits({
            owner: owner,
            repo: repo,
        });
        const lastSha = commits.data[0].sha;
        const {
            data: { sha: treeSHA }
        } =  await octokit.git.createTree({
            owner: owner,
            repo: repo,
            tree: [
                {
                    mode: '100644',
                    path: "kfc.json",
                    type: "blob",
                    sha: jsonSha
                }
            ],
            base_tree: lastSha,
        });

        const {
            data: { sha: newSHA }
        } =  await octokit.git.createCommit({
            owner: owner,
            repo: repo,
            author: {
                name: "github-actions[bot]",
                email: "41898282+github-actions[bot]@users.noreply.github.com",
            },
            committer: {
                name: "github-actions[bot]",
                email: "41898282+github-actions[bot]@users.noreply.github.com",
            },
            tree: treeSHA,
            message: 'Generate kfc.json',
            parents: [ lastSha ],
        });
        const result = await octokit.git.updateRef({
            owner: owner,
            repo: repo,
            ref: "heads/main",
            sha: newSHA,
        });
        console.log(`result: ${result}`);
    } catch(err) {
        console.error(`生成 Json 文件时发生了错误：${err}`);
    }
})();
