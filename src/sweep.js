import NodeGit from 'nodegit';

function isIgnored(ref, ignoreList) {
  return ignoreList.includes(ref.replace(/^refs\/remotes\//, ''));
}

async function sweep({path, remote, preview, ignore}) {
  try {
    const repo = await NodeGit.Repository.open(path);
    await repo.fetch(remote, {
      prune: NodeGit.Fetch.PRUNE.GIT_FETCH_PRUNE
    });

    const refNames = await repo.getReferenceNames(NodeGit.Reference.TYPE.LISTALL);
    const sweepRefs = [];

    for (const ref of refNames) {
      if (ref.startsWith(`refs/remotes/${remote}`) && !isIgnored(ref, ignore)) {
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
