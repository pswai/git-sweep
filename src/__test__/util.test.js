import path from 'path';
import moment from 'moment';

jest.mock('fs');

describe('getConfiguredIgnoresIfExist', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('rejects when `repoPath` is missing', async () => {
    const util = require('../util');

    try {
      await util.getConfiguredIgnoresIfExist()
    } catch (e) {
      expect(e.message).toEqual('`repoPath` is required');
    }
  });

  it('attempts to read ".gitsweepignore" file', () => {
    const fs = require('fs');
    const util = require('../util');
    fs.readFile = jest.fn();

    util.getConfiguredIgnoresIfExist('.');

    expect(fs.readFile.mock.calls[0][0]).toBe(path.join('.', '.gitsweepignore'));
  });

  it('resolves with empty array if file not found', async () => {
    const util = require('../util');
    const result = await util.getConfiguredIgnoresIfExist('.');

    expect(result).toEqual([]);
  });

  it('resolves with a list of ignored branches', async () => {
    require('fs').__setMockFiles({
      [path.join('.', '.gitsweepignore')]: `
        origin/master
        origin/dev
      `
    });
    const util = require('../util');

    const result = await util.getConfiguredIgnoresIfExist('.');

    expect(result).toEqual(['origin/master', 'origin/dev']);
  });
});

describe('getCutoffMoment', () => {
  let currentMoment;

  beforeEach(() => {
    currentMoment = moment('2017-01-01T00:00:00+0000');
  });

  it('recognizes `y` token', () => {
    const util = require('../util');

    const cutoffMoment = util.getCutoffMoment(currentMoment, '1y');

    expect(cutoffMoment).toMatchSnapshot();
  });

  it('recognizes `m` token', () => {
    const util = require('../util');

    const cutoffMoment = util.getCutoffMoment(currentMoment, '1m');

    expect(cutoffMoment).toMatchSnapshot();
  });

  it('recognizes `d` token', () => {
    const util = require('../util');

    const cutoffMoment = util.getCutoffMoment(currentMoment, '1d');

    expect(cutoffMoment).toMatchSnapshot();
  });

  it('gives correct cutoff moment for various combinations', () => {
    const util = require('../util');

    expect(util.getCutoffMoment(currentMoment, '1y2m3d')).toMatchSnapshot();
    expect(util.getCutoffMoment(currentMoment, '1y3d')).toMatchSnapshot();
    expect(util.getCutoffMoment(currentMoment, '2m3d')).toMatchSnapshot();
    expect(util.getCutoffMoment(currentMoment, '1y2m')).toMatchSnapshot();
  });
});

describe('isIgnored', () => {
  it('works when ignoreList is empty', () => {
    const util = require('../util');

    expect(util.isIgnored('refs/remotes/origin/dev', [])).toBe(false);
  });

  it('checks whether a ref is in ignoredList', () => {
    const util = require('../util');

    const list = ['origin/dev'];

    expect(util.isIgnored('refs/remotes/origin/dev', list)).toBe(true);
    expect(util.isIgnored('refs/remotes/origin/feature', list)).toBe(false);
  });
});
