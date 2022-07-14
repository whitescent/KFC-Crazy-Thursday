require('dotenv').config();
const { Octokit } = require('@octokit/rest');
const axios = require('axios').default;

const {
    GH_TOKEN
} = process.env;

const owner = "Nthily";
const repo = "KFC-Crazy-Thursday";


var json = [];
var jsonStr = "";

(async () => {
    try {
        await axios
        .get('https://raw.githubusercontent.com/Nthily/KFC-Crazy-Thursday/main/README.md')
        .then(res => {
            const content = res.data;
            const regex = /(?<=^>)[\S\s]+?(?=---)/gm
            var contentAry = content.match(regex)
                .map(i => i.replace(/^\> */gm, ``));
            contentAry.forEach(element => {
                var data = {
                    text: element.trim(" ")
                }
                json.push(data);
            });
            jsonStr = JSON.stringify(json, null, 2);
        })
        .catch(error => {
            console.error(error);
        });
        const octokit = new Octokit({
            auth: GH_TOKEN,
        });

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
