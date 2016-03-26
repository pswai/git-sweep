import NodeGit from 'nodegit';

/*
* 1. Open repo
* 2. Fetch all from origin
* 3. Prune branches
* 4. Find all remote branches
* 5. Filter with criteria (age, name, exemption)
* 6. Ask confirmation
* 7. Delete
*/

async function run() {
  try {
    const repo = await NodeGit.Repository.open('../test2');
    await repo.fetch('origin', {
      prune: NodeGit.Fetch.PRUNE.GIT_FETCH_PRUNE
    });

    const refNames = await repo.getReferenceNames(NodeGit.Reference.TYPE.LISTALL);
    const remote = await repo.getRemote('origin');
    const sweepRefs = [];

    for (const ref of refNames) {
      if (/^refs\/remotes\/origin\/.+/.test(ref) && !/master/.test(ref)) {
        sweepRefs.push(`:${ref.replace('remotes/origin', 'heads')}`);
      }
    }

    await remote.push(sweepRefs);
  } catch (e) {
    console.log(e);
  }
}

run();