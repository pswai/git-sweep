import path from 'path';

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
  const momentMock = {
    subtract: jest.fn(() => momentMock)
  };

  beforeEach(() => {
    jest.resetModules();

    jest.mock('moment', () => () => momentMock);
  });

  it('parses `age` correctly', () => {
    const util = require('../util');

    util.getCutoffMoment('1y2m3d');

    expect(momentMock.subtract.mock.calls).toEqual([
      ['1', 'years'],
      ['2', 'months'],
      ['3', 'days']
    ]);
  });
});
