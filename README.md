git-sweep
---------
> Git utility to clean up remote branches


### Install
```
npm install -g git-sweep
```

### Options

#### path

Type: `String`
Default: `.`

Path to target git repository.

#### remote

Type: `String`
Default: `origin`

Target remote to clean up.

#### ignore

Type: `String`
Default: `origin/master`

Branches to be ignored. Must be specified in `<remote>/<branch>` format. Use comma to delimit multiple branches.
This option will be merged with the configuration in [`.gitsweepignore`](#config-file).

#### preview

Type: `Boolean`
Default: `false`

Run `git-sweep` without actually deleting any branch. Useful for verifying the list of branches that will be deleted.

#### age

Type: `String`
Default: `1m`

Minimum age for a branch to be considered for deletion. Format `1y2m3d` means "older than 1 year 2 months and 3 days".


### Example Usage

#### Delete remote branches that are older than 1 month except `origin/master`
```
git-sweep
```

#### Delete older than 1 year, 2 month and 3 days
```
git-sweep --age 1y2m3d
```

#### Delete except `origin/master` and `origin/dev`
```
git-sweep --ignore origin/master,origin/dev
```

#### Delete from another remote
```
git-sweep --remote fork
```

#### Dry run
```
git-sweep --preview
```


### Config file
A `.gitsweepignore` can be added to configure the `ignore` option.
When used together with `--ignore`, their entries will be merged.


### Authentication
`git-sweep` currently supports `ssh-agent` only.


### Roadmap
- Authentication methods
  - username/password
  - HTTPS
  - github 2FA
  - Manual ssh key files
- Filters
  - Merged branch
  - Cutoff date (similar to age)
- CLI help


### License
[MIT](LICENSE)


### Changelog

#### v0.1.1
- Add support to authenticate using `ssh-agent`

#### v0.1.0
- First release
