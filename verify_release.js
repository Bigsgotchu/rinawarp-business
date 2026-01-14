const https = require('https');

const REPO = "Bigsgotchu/rinawarp-business";
const TAG = "v0.1.6";

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  try {
    console.log("== Latest VSIX Release workflow runs ==");
    const runsData = await fetch(`https://api.github.com/repos/${REPO}/actions/runs?per_page=50`);
    const runs = JSON.parse(runsData);
    let count = 0;
    for (const run of runs.workflow_runs) {
      if (run.name === "VSIX Release") {
        console.log(`id=${run.id} status=${run.status} conclusion=${run.conclusion} event=${run.event} branch=${run.head_branch} sha=${run.head_sha} created=${run.created_at}`);
        count++;
        if (count >= 10) break;
      }
    }
    
    console.log("\n== Release for tag " + TAG + " (and assets) ==");
    const releaseData = await fetch(`https://api.github.com/repos/${REPO}/releases/tags/${TAG}`);
    const release = JSON.parse(releaseData);
    console.log(`name=${release.name}`);
    console.log(`prerelease=${release.prerelease}`);
    console.log(`draft=${release.draft}`);
    console.log("\nASSETS:");
    if (release.assets && release.assets.length > 0) {
      for (const asset of release.assets) {
        console.log(` - ${asset.name} (${asset.size} bytes)`);
      }
    } else {
      console.log(" - No assets found");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
