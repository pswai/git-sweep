import 'babel-polyfill';
import program from 'commander';
import readlineSync from 'readline-sync';
import sweep from './sweep';
import pkg from '../package.json';

program
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
  .option('--password', 'Use password to authenticate instead of SSH key (Input later)')
  .parse(process.argv);

function run(args) {
  sweep({
    path: args.path,
    remote: args.remote,
    preview: args.preview,
    ignore: args.ignore,
    age: args.age,
    password: args.password
  });
}

if (program.password) {
  const password = readlineSync.question('Enter your git password: ', {
    hideEchoBack: true,
    mask: ''
  });
  run(Object.assign({}, program, {
    password: password
  }))
} else {
  run(program);
}
