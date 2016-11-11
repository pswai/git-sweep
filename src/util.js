import fs from 'fs';
import path from 'path';
import moment from 'moment';

export function getConfiguredIgnoresIfExist(repoPath) {
  return new Promise((resolve, reject) => {
    if (!repoPath) {
      reject(new Error('`repoPath` is required'));
      return;
    }

    fs.readFile(path.join(repoPath, '.gitsweepignore'), 'utf8', (err, data) => {
      if (err) {
        return resolve([]);
      }

      const branches = data
        .split('\n')
        .reduce((result, line) => {
          if (line.trim()) {
            result.push(line.trim());
          }

          return result;
        }, []);

      resolve(branches);
    })
  });
}

export function getCutoffMoment(age) {
  const [, year, month, day] = age.match(/(?:(\d+)y)?(?:(\d+)m)?(?:(\d+)d)?/);

  return moment()
    .subtract(year, 'years')
    .subtract(month, 'months')
    .subtract(day, 'days');
}
