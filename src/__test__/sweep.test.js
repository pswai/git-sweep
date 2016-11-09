import sweep from '../sweep';

describe('sweep', () => {
  it('rejects when path is empty', async () => {
    try {
      await sweep({});
    } catch (e) {
      expect(e.message).toEqual('Path is required');
    }
  });
});
