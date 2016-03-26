import minimist from 'minimist';
import sweep from './sweep';

const args = minimist(process.argv.slice(2), {
  default: {
    path: '.',
    remote: 'origin',
    preview: false
  },
  string: ['path', 'remote'],
  boolean: ['preview']
});
// console.log(args);
sweep({
  path: args.path,
  remote: args.remote,
  preview: args.preview
});
