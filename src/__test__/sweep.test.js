import lolex from 'lolex';
import moment from 'moment';

jest.mock('nodegit');

describe('sweep', () => {
  let clock;

  beforeEach(() => {
    jest.resetModules();

    clock = lolex.install(Date.now(), ['Date']);
  });

  afterEach(() => {
    clock.uninstall();
  });

  it('rejects when path is empty', async done => {
    const sweep = require('../sweep').default;

    try {
      await sweep({});
    } catch (e) {
      expect(e.message).toEqual('Path is required');
      done();
    }
  });

  it('removes remote branches that are older than a month', async () => {
    const sweep = require('../sweep').default;
    const git = require('nodegit');
    const repoPath = '/path/to/repo';

    git.__setMockRepo(repoPath, {
      remoteBranches: {
        origin: [{
          name: 'old-branch',
          lastUpdated: moment().subtract(1, 'month').subtract(1, 'day').toDate()
        }, {
          name: 'new-branch',
          lastUpdated: moment().subtract(1, 'day').toDate()
        }]
      }
    });

    await sweep({
      path: repoPath
    });

    const referenceLeft = await git.__getMockRepo(repoPath).getReferenceNames();
    expect(referenceLeft).toMatchSnapshot();
  });
});

