import moment from 'moment';
import NodeGit from 'nodegit';
import * as util from './util';

export default async function sweep({
  path,
  remote = 'origin',
  preview = false,
  ignore = 'origin/master',
  age = '1m',
  password
}) {
  if (!path) {
    throw new Error('Path is required');
  }

  try {
    const currentMoment = moment();
    const cutoffMoment = age ? util.getCutoffMoment(currentMoment, age) : null;
    const ignoreList = await util.getConfiguredIgnoresIfExist(path);
    ignoreList.push(...(ignore.split(',')));

    const repo = await NodeGit.Repository.open(path);

    const authTrials = {
      agent: false,
      userpassPlaintext: false
    };
    await repo.fetch(remote, {
      callbacks: {
        certificateCheck: function() { return 1; },
        credentials: function(url, username) {
          // Do not try ssh-agent if password is specified
          if (password) {
            if (!authTrials.userpassPlaintext) {
              authTrials.userpassPlaintext = true;
              return NodeGit.Cred.userpassPlaintextNew(username, password);
            }
          } else if (!authTrials.agent) {
            authTrials.agent = true;
            return NodeGit.Cred.sshKeyFromAgent(username);
          }
        }
      },
      prune: NodeGit.Fetch.PRUNE.GIT_FETCH_PRUNE
    });

    const refNames = await repo.getReferenceNames(NodeGit.Reference.TYPE.LISTALL);
    const sweepRefs = [];

    for (const ref of refNames) {
      if (ref.startsWith(`refs/remotes/${remote}`) && !util.isIgnored(ref, ignoreList)) {
        const commit = await repo.getReferenceCommit(ref);
        const commitMoment = moment(commit.date());

        if (!cutoffMoment || commitMoment.isBefore(cutoffMoment)) {
          console.log(`- ${ref}\t${commitMoment.fromNow()}`);
          sweepRefs.push(`:${ref.replace(`remotes/${remote}`, 'heads')}`);
        }
      }
    }

    if (sweepRefs.length < 1) {
      console.log('No matching remote branch to sweep');
      return;
    } else if (!!cutoffMoment) {
      console.log(`${sweepRefs.length} branch found with last commit before ${cutoffMoment.toString()}`);
    } else {
      console.log(`${sweepRefs.length} branch found`);
    }

    if (!preview) {
      const authTrials = {
        agent: false,
        userpassPlaintext: false
      };

      const theRemote = await repo.getRemote(remote);
      await theRemote.push(sweepRefs, {
        callbacks: {
          certificateCheck: function() { return 1; },
          credentials: function(url, username) {
            // Do not try ssh-agent if password is specified
            if (password) {
              if (!authTrials.userpassPlaintext) {
                authTrials.userpassPlaintext = true;
                return NodeGit.Cred.userpassPlaintextNew(username, password);
              }
            } else if (!authTrials.agent) {
              authTrials.agent = true;
              return NodeGit.Cred.sshKeyFromAgent(username);
            }
          }
        }
      });

      console.log(`${sweepRefs.length} branch removed`);
    }
  } catch (e) {
    console.error(e.message);
  }
}
