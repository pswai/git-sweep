import 'babel-polyfill';
import minimist from 'minimist';
import sweep from './sweep';

const args = minimist(process.argv.slice(2), {
  default: {
    path: '.',
    remote: 'origin',
    preview: false,
    ignore: ''
  },
  string: ['path', 'remote', 'ignore'],
  boolean: ['preview']
});

sweep({
  repoPath: args.path,
  remote: args.remote,
  preview: args.preview,
  ignore: args.ignore.split(',')
});
