import os from 'os';
import path from 'path';
import moment from 'moment';
import NodeGit from 'nodegit';
import readlineSync from 'readline-sync';
import * as util from './util';

function getRemoteCallbacks(password) {
  const {
    USERPASS_PLAINTEXT,
    SSH_KEY,
    SSH_CUSTOM,
    DEFAULT
  } = NodeGit.Cred.TYPE;

  // Cred types not supported:
  // - Cred.TYPE.SSH_MEMORY
  // - Cred.TYPE.USERNAME
  // - Cred.TYPE.SSH_INTERACTIVE
  const supportedTypes = 0b0001111;
  let attemptedTypes = 0b0000000;

  return {
    certificateCheck: function() { return 1; },
    credentials: function(url, username, allowedTypes) {
      const possibleTypes = allowedTypes & (~attemptedTypes & supportedTypes);

      if (possibleTypes & SSH_KEY) {
        attemptedTypes |= SSH_KEY;

        const home = os.homedir();
        return NodeGit.Cred.sshKeyNew(
          username,
          path.resolve(home, '.ssh', 'id_rsa.pub'),
          path.resolve(home, '.ssh', 'id_rsa'),
          ''
        );
      } else if (possibleTypes & SSH_CUSTOM) {
        attemptedTypes |= SSH_CUSTOM;
        return NodeGit.Cred.sshKeyFromAgent(username);

      } else if (possibleTypes & DEFAULT) {
        attemptedTypes |= DEFAULT;
        return NodeGit.Cred.defaultNew();

      } else if (possibleTypes & USERPASS_PLAINTEXT) {
        attemptedTypes |= USERPASS_PLAINTEXT;

        if (!username) {
          username = readlineSync.question('Enter your git username: ');
        }

        if (!password) {
          password = readlineSync.question('Enter your git password: ', {
            hideEchoBack: true,
            mask: ''
          });
        }

        return NodeGit.Cred.userpassPlaintextNew(username, password);
      } else {
        throw new Error('No supported credential type found. Supported types are USERPASS_PLAINTEXT, SSH_KEY, SSH_CUSTOM, DEFAULT');
      }
    }
  };
}

export default async function sweep({
  repoPath,
  remote = 'origin',
  preview = false,
  ignore = 'origin/master',
  age = '1m',
  password
}) {
  if (!repoPath) {
    throw new Error('repoPath is required');
  }

  try {
    const currentMoment = moment();
    const cutoffMoment = age ? util.getCutoffMoment(currentMoment, age) : null;
    const ignoreList = await util.getConfiguredIgnoresIfExist(repoPath);
    ignoreList.push(...(ignore.split(',')));

    const repo = await NodeGit.Repository.open(repoPath);

    await repo.fetch(remote, {
      callbacks: getRemoteCallbacks(password),
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
      const theRemote = await repo.getRemote(remote);
      await theRemote.push(sweepRefs, {
        callbacks: getRemoteCallbacks(password)
      });

      console.log(`${sweepRefs.length} branch removed`);
    }
  } catch (e) {
    console.error(e.message);
  }
}
