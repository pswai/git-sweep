import 'babel-polyfill';
import program from 'commander';
import sweep from './sweep';
import pkg from '../package.json';

const args = program
  .version(pkg.version)
  .option('--path [path]', 'Path to target git repository')
  .option('--remote [remote]', 'Target remote to clean up')
  .option(
    '--ignore [branches]',
    [
      'Branches to be ignored. Must be specified in `<remote>/<branch>` format.',
      'Use comma to delimit multiple branches.',
      'This option will be merged with the configuration in .gitsweepignore'
    ].join(' '),
    (val) => val.split(','))
  .option(
    '--age [age]', [
      'Minimum age for a branch to be considered for deletion.',
      'Format `1y2m3d` means "older than 1 year 2 months and 3 days"'
    ].join(' ')
  )
  .option('--preview',
    [
      'Run `git-sweep` without actually deleting any branch.',
      'Useful for verifying the list of branches that will be deleted'
    ].join(' '))
  .parse(process.argv);

sweep({
  path: args.path,
  remote: args.remote,
  preview: args.preview,
  ignore: args.ignore,
  age: args.age
});
