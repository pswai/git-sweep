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

  describe('with `age`', () => {
    it('removes remote branches that are older than a month by default', async () => {
      const sweep = require('../sweep').default;
      const git = require('nodegit');
      const repoPath = '/path/to/repo';

      git.__setMockRepo(repoPath, {
        remoteBranches: {
          origin: [{
            name: 'old-branch',
            lastUpdated: moment().subtract(1, 'month').subtract(1, 'day').toDate()
          }, {
            name: 'one-month-branch',
            lastUpdated: moment().subtract(1, 'month').toDate()
          }, {
            name: 'new-branch',
            lastUpdated: moment().subtract(1, 'day').toDate()
          }]
        }
      });

      await sweep({
        path: repoPath
      });

      const referencesLeft = await git.__getMockRepo(repoPath).getReferenceNames();
      expect(referencesLeft).toMatchSnapshot();
    });

    it('removes remote branches that are older than specified age', async () => {
      const sweep = require('../sweep').default;
      const git = require('nodegit');
      const repoPath = '/path/to/repo';

      git.__setMockRepo(repoPath, {
        remoteBranches: {
          origin: [{
            name: 'super-old-branch',
            lastUpdated: moment().subtract(2, 'year').toDate()
          }, {
            name: 'a-little-old-branch',
            lastUpdated: moment().subtract(1, 'year').subtract(2, 'month').subtract(4, 'day').toDate()
          }, {
            name: 'almost-old-branch',
            lastUpdated: moment().subtract(1, 'year').subtract(2, 'month').subtract(3, 'day').toDate()
          }, {
            name: 'new-branch',
            lastUpdated: moment().subtract(1, 'day').toDate()
          }]
        }
      });

      await sweep({
        path: repoPath,
        age: '1y2m3d'
      });

      const referencesLeft = await git.__getMockRepo(repoPath).getReferenceNames();
      expect(referencesLeft).toMatchSnapshot();
    });
  });

  describe('with `ignore`', () => {
    it('ignores origin/master by default', async () => {
      const sweep = require('../sweep').default;
      const git = require('nodegit');
      const repoPath = '/path/to/repo';

      git.__setMockRepo(repoPath, {
        remoteBranches: {
          origin: [{
            name: 'feature-branch',
            lastUpdated: moment().subtract(2, 'month').toDate()
          }, {
            name: 'master',
            lastUpdated: moment().subtract(2, 'month').toDate()
          }]
        }
      });

      await sweep({
        path: repoPath
      });

      const referencesLeft = await git.__getMockRepo(repoPath).getReferenceNames();
      expect(referencesLeft).toMatchSnapshot();
    });

    it('ignores branches specified', async () => {
      const sweep = require('../sweep').default;
      const git = require('nodegit');
      const repoPath = '/path/to/repo';

      git.__setMockRepo(repoPath, {
        remoteBranches: {
          origin: [{
            name: 'feature-branch',
            lastUpdated: moment().subtract(2, 'month').toDate()
          }, {
            name: 'master',
            lastUpdated: moment().subtract(2, 'month').toDate()
          }]
        }
      });

      await sweep({
        path: repoPath,
        ignore: 'origin/feature-branch'
      });

      const referencesLeft = await git.__getMockRepo(repoPath).getReferenceNames();
      expect(referencesLeft).toMatchSnapshot();
    });

    it('ignores multiple branches delimited by comma', async () => {
      const sweep = require('../sweep').default;
      const git = require('nodegit');
      const repoPath = '/path/to/repo';

      git.__setMockRepo(repoPath, {
        remoteBranches: {
          origin: [{
            name: 'feature-branch',
            lastUpdated: moment().subtract(2, 'month').toDate()
          }, {
            name: 'dev',
            lastUpdated: moment().subtract(2, 'month').toDate()
          }, {
            name: 'master',
            lastUpdated: moment().subtract(2, 'month').toDate()
          }]
        }
      });

      await sweep({
        path: repoPath,
        ignore: 'origin/master,origin/dev'
      });

      const referencesLeft = await git.__getMockRepo(repoPath).getReferenceNames();
      expect(referencesLeft).toMatchSnapshot();
    });
  });
});

