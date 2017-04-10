/* Importing NodeGit fails on second run onwards when watched.
 * Probably caused by rebinding C binaries.
 * So we have to write full manual mock.
 */
import _ from 'lodash';

const repos = new Map();

class Repository {
  static async open(repoPath) {
    return git.__getMockRepo(repoPath);
  }

  constructor(options = {}) {
    const { remoteBranches } = options;

    this.remotes = {};
    this.refs = {};

    _.forEach(remoteBranches, (branches, remoteName) => {
      const remote = new Remote({
        name: remoteName,
        repo: this
      });
      this.remotes[remoteName] = remote;

      _.forEach(branches, branch => {
        const refName = `refs/remotes/${remoteName}/${branch.name}`;
        this.refs[refName] = branch;

        remote.__addBranch(branch);
      });
    });
  }

  async fetch(remote, options) {}

  async getReferenceNames() {
    return _.flatMap(
      this.remotes,
      remote => _.map(remote.refs, branch => `refs/remotes/${remote.name}/${branch.name}`)
    );
  }

  async getReferenceCommit(refName) {
    const ref = this.refs[refName];

    return new Commit({
      commitDate: ref.lastUpdated
    });
  }

  async getRemote(remote) {
    return new Remote({
      name: remote,
      repo: this
    });
  }
}

class Remote {
  constructor(options) {
    this.name = options.name;
    this.repo = options.repo;
    this.refs = {};
  }

  __addBranch(branch) {
    const refName = `refs/heads/${this.name}/${branch.name}`;
    this.refs[refName] = branch;
  }

  async push(refs) {
    refs.forEach(ref => {
      const [src, dest] = ref.split(':');

      console.log(this.refs);
      if (!src && this.refs[dest]) {
        delete this.refs[dest];
      }
    });
  }
}

class Commit {
  constructor(options) {
    this.commitDate = options.commitDate;
  }

  date() {
    return this.commitDate;
  }
}

const git = {
  Cred: {
    userpassPlaintextNew: jest.fn(),
    sshKeyFromAgent: jest.fn()
  },
  Fetch: {
    // These are the actual ones
    PRUNE: {
      GIT_FETCH_PRUNE_UNSPECIFIED: 0,
      GIT_FETCH_PRUNE: 1,
      GIT_FETCH_NO_PRUNE: 2
    }
  },
  Reference: {
    // These are the actual ones
    TYPE: {
      INVALID: 0,
      OID: 1,
      SYMBOLIC: 2,
      LISTALL: 3
    }
  },
  Repository
};

// Utility to facilitate testing process
git.__setMockRepo = (repoPath, options) => {
  const repo = new Repository(options);
  repos.set(repoPath, repo);
};

git.__getMockRepo = repoPath => repos.get(repoPath);

module.exports = git;
