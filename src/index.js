import 'babel-polyfill';
import minimist from 'minimist';
import sweep from './sweep';

const args = minimist(process.argv.slice(2), {
  string: ['path', 'remote', 'ignore', 'age'],
  boolean: ['preview']
});

sweep({
  repoPath: args.path,
  remote: args.remote,
  preview: args.preview,
  ignore: args.ignore ? args.ignore.split(',') : [],
  age: args.age
});
