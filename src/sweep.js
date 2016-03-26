import fs from 'fs';
import path from 'path';
import NodeGit from 'nodegit';

function getConfiguredIgnoresIfExist(repoPath) {
  return new Promise((resolve) => {
    fs.readFile(path.join(repoPath, '.gitsweepignore'), 'utf8', (err, data) => {
      if (err) {
        return resolve([]);
      }

      resolve(data.split('\n'));
    })
  });
}

function isIgnored(ref, ignoreList) {
  return ignoreList.includes(ref.replace(/^refs\/remotes\//, ''));
}

async function sweep({repoPath, remote, preview, ignore}) {
  try {
    const ignoreList = await getConfiguredIgnoresIfExist(repoPath);
    ignoreList.push(...ignore);

    const repo = await NodeGit.Repository.open(repoPath);
    await repo.fetch(remote, {
      prune: NodeGit.Fetch.PRUNE.GIT_FETCH_PRUNE
    });

    const refNames = await repo.getReferenceNames(NodeGit.Reference.TYPE.LISTALL);
    const sweepRefs = [];

    for (const ref of refNames) {
      if (ref.startsWith(`refs/remotes/${remote}`) && !isIgnored(ref, ignoreList)) {
        console.log(`- ${ref}`);
        sweepRefs.push(`:${ref.replace(`remotes/${remote}`, 'heads')}`);
      }
    }

    if (sweepRefs.length < 1) {
      console.log('No matching remote branch to sweep');
      return;
    }

    if (!preview) {
      const theRemote = await repo.getRemote(remote);
      theRemote.push(sweepRefs);

      console.log(`${sweepRefs.length} branches removed`);
    }
  } catch (e) {
    console.error(e.message);
  }
}

export default sweep;
