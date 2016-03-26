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

async function sweep({path, remote, preview}) {
  try {
    const repo = await NodeGit.Repository.open(path);
    await repo.fetch(remote, {
      prune: NodeGit.Fetch.PRUNE.GIT_FETCH_PRUNE
    });

    const refNames = await repo.getReferenceNames(NodeGit.Reference.TYPE.LISTALL);
    const sweepRefs = [];

    for (const ref of refNames) {
      if (ref.match(`refs/remotes/${remote}`) && !/master/.test(ref)) {
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