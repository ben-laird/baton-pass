# TypeLaunch Turbo

![GitHub](https://img.shields.io/github/license/ben-laird/typelaunch-turbo) ![GitHub all releases](https://img.shields.io/github/downloads/ben-laird/typelaunch-turbo/total) ![GitHub issues](https://img.shields.io/github/issues-raw/ben-laird/typelaunch-turbo) ![GitHub commit activity](https://img.shields.io/github/commit-activity/m/ben-laird/typelaunch-turbo) ![GitHub last commit](https://img.shields.io/github/last-commit/ben-laird/typelaunch-turbo) ![Snyk Vulnerabilities for GitHub Repo](https://img.shields.io/snyk/vulnerabilities/github/ben-laird/typelaunch-turbo)

TypeLaunch Turbo is an opinionated, public template repository made to easily bootstrap a TypeScript monorepo for applications and packages with the latest features and best practices.

## Pipeline

### Setup

To use this template

There are multiple edits that should be made to personalize TypeLaunch Turbo. Below is a checklist in order of importance.

1. Add a `name` beyond the placeholder in `package.json` and `vite.config.ts` in _each public-facing package using Vite as the build tool_. Change the `name` field in all public facing packages, regardless of build tool.
2. Add a `SCOPED_REPO_TOKEN` and `NPM_TOKEN` to your repo's secrets. This allows GitHub Actions to manage deploying to npm. See [this issue](https://github.com/peter-evans/create-pull-request/issues/48) for more information, and see [this issue](https://github.com/changesets/action/issues/220) as well as [this issue](https://github.com/changesets/action/issues/268) for a list of permissions to give to the `SCOPED_REPO_TOKEN`.
3. Replace the placeholder name "John Appleseed" with the project owner's name in each [`LICENSE`](../LICENSE.md) for all public-facing packages
4. Replace all instances of the placeholder email "johnnyappleseed@example.com" with the project owner's email address in the [`CODE_OF_CONDUCT.md`](../.github/CODE_OF_CONDUCT.md)
5. Add or customize these fields in _each public-facing_ [`package.json`](../package.json):
   1. `author`
   2. `email`
   3. `description`
   4. `repository`: provide a link to the GitHub repo the entire project resides in
   5. `homepage`: provide a link to one of these resources
      1. Front-facing webpage
      2. Documentation (we have an [app specifically for documentation](../apps/docs/src/pages/index.astro) in the `app` directory for that!)
      3. GitHub repo
   6. `bugs.url`: provide a link to your bug tracker
   7. `keywords`

### Cycle

#### Opening

When opening the project, create a new terminal window and run `pnpm run dev`. This will set up Vitest every time the project is saved. Best practice is to stop this terminal when closing the project, though that's not entirely necessary.

#### CI/CD

##### VSCode

When a commit is ready to be made, head to the Version Control pane and stage the files you'd like to commit. Next, look for the circle above the commit field labeled "Conventional Commits", or hit `Ctrl/Cmd + Shift + P` to open the Command Palette and find it that way. In the Command Palette, type "Conventional Commits" and find the command with that title.

The Conventional Commits extension will walk you through the steps to making a conventional commit.

##### GitHub

When enough commits have been made, make a changeset and push your changes to GitHub! There are two types of commit sets: release, and non-release.

The commit set is a release set if the commit set changes your project's features (i.e. if there are any feat commits). Any other commit set will not require a release and can be considered a non-release set.

To push a release set, run `pnpm run change` and note the features you've added, changed, or removed. Commit this and push to a `dev` branch. To publish a non-release set, run `pnpm run change:empty` and commit and push to the `main` branch.

##### Releasing

When you're ready to release, take a look at the Pull Request to main that the Changeset GitHub Action has created under your name. Follow the instructions there and only merge the Pull Request when you're comfortable with it. When you do merge, GitHub Actions and Changset will take care of publishing to npm and tagging your release on GitHub.

## Conventions

This project adheres to the following conventions to keep code writing and reviewing easy.

1. [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
2. [Semantic Versioning](https://semver.org)
3. ESLint recommended rules
4. Prettier recommended rules

## Dependencies

This project makes use of some dev dependencies that enforce following the above conventions and overall improve code quality.

- Essentials - [TypeScript](https://www.typescriptlang.org/), a type-safe superset of JavaScript
- Testing and Coverage - [Vitest](https://vitest.dev), a fast, batteries-included test runner
- Linting and Formatting
  - [ESLint](https://eslint.org) for potential bugs and convention adherence
  - [Prettier](https://prettier.io) for styling
- Version Control and CI/CD
  - [Changesets](https://github.com/changesets/changesets/tree/main) for tracking changes and maintaining a changelog
  - [GitHub Actions](https://docs.github.com/en/actions) for the wider CI/CD pipeline

## Recommendations

- TypeScript is provided for type-safety and is intended to be used instead of JavaScript. The [base tsconfig](../packages/config/tsconfig/tsconfig.base.json) included uses strict mode, so the TypeScript compiler will complain about a lot of things. Remember, TypeScript errors are your friend.
- Usage of docstrings is highly encouraged, as it provides an easy way to produce documentation. The docstrings you make allow IDE's like VSCode (my personal favorite) to provide inline documentation and tab completion directly in the editor!
- Use Vitest for test-driven or behavior-driven development. Before working on the project, run `pnpm run dev` to get Vitest going. See the [Commands](typelaunch.md#commands) section for more details.

## Opinions and Philosophy

TypeLaunch is an opinionated template. The most important tenets of TypeLaunch are:

- Clutter bad, :x: intuitive structure good :white_check_mark:
- Rigidity bad, :x: easy customization good :white_check_mark:
- Looseness bad, :x: constructive strictness good :white_check_mark:
- Manual bad, :x: automatic help good :white_check_mark:

The more granular opinions are described below:

- ESLint is pre-configured in [a separate package](../packages/config/eslint/index.cjs), and Prettier is pre-configured at the [project root](../.prettierrc.cjs). This is where most of the opinions are.
  - All recommended Prettier presets are followed
  - All recommended ESLint presets are followed, with the exception of two additional rules. They are set to warn and not throw an exception because they are slightly pedantic.
    - `spaced-comment` is in `always` mode, which will "enforce consistent spacing after the // or /\* in a comment". See [here](https://eslint.org/docs/latest/rules/spaced-comment#rule-details) for details.
    - `yoda` is in `never` mode, which will disallow "Yoda conditions" where a literal is compared to a variable and not the other way around. See [here](https://eslint.org/docs/latest/rules/yoda#rule-details) for details.
- I've worked on projects where the root directory is a mess of config files with no way to hide them because they all had to be at the root. Therefore, I've tried to hide as much of the config in packages as I can. This also aligns with the second tenet of TypeLaunch.
- In the same spirit, the [code of conduct](../.github/CODE_OF_CONDUCT.md) is in the `.github` folder, but can be moved to the project root.
- Part of the reason I made this template is to have full control over what tools I used and how I used them. I brought this design philosophy to TypeLaunch as much as I could; if a package is getting in your way, you just need to uninstall it or delete it; the only one that needs some extra config is changesets because that's integrated into the CI build. Otherwise, it's as simple as `pnpm uninstall <package>` and/or `rm -rf <directory>`.
- TypeLaunch is also dependency-free for a reason: the thing shouldn't get in the way of what your application needs and should only help you if you develop it. Usage of TypeLaunch not contributing to build sizes is also a nice plus.
- Errors are your friend. No seriously. I've configured TypeLaunch to berate the developer with errors, exceptions, and test failures. Errors are also the lifeblood of test-driven development, a practice I'm getting better at following. Adding these errors is meant to make sure the code, docs, and tests are in tip-top shape.
- Turborepo is great. Oftentimes you won't need to worry about messing around with a single package or app because Turborepo handles building, linting, and so on. And Turborepo is ridiculously aggressive about doing as little work as possible; it caches as much as it can so you don't have to manually look through what files changed and which didn't. With TypeLaunch, you still have full control over your builds; run `pnpm uncache` to force Turborepo to recalculate everything. It's like a language server reset for your build/lint system!
- Although they're available just in case, you should be careful when running any commands at the project root that spin up a persistent process, like a dev server or a process in watch mode. Turborepo will try to spin up _all_ persistent processes at once, making for a rather cluttered terminal and potentially serving conflicts as dev servers try to use the same host and port to serve web apps. Know what your dev and test commands do before running a dev or test command at the project root!

## Commands

Utilize these commands in your development pipeline by running `pnpm run <command>` (or `pnpm <command>` if the command name doesn't conflict with any core pnpm scripts). For convenience, a table for these commands is included here:

| Command             | Description                                                         |
| ------------------- | ------------------------------------------------------------------- |
| start               | Run your projects' `start` command (if it exists)                   |
| dev                 | Run Vitest tests in watch mode and/or spin up dev servers           |
| build:dev           | Build a dev-friendly/dev-readable build of the project              |
| build               | Build the project, optimized for production                         |
| preview             | Run your projects' `preview` command (if it exists)                 |
| suite               | Run a suite of commands to check your code, tailored to development |
| suite:ci            | Run a suite of commands to check/fix your code, tailored to ci      |
| test                | Run Vitest tests once                                               |
| test:watch          | Run Vitest tests in watch mode                                      |
| cov                 | Run Vitest tests and provide a coverage report                      |
| cov:watch           | Run Vitest tests in watch mode and provide a coverage report        |
| lint                | Lint the project with TSC, ESLint, and Prettier                     |
| mono-lint           | Lint the structure of the monorepo using `manypkg`                  |
| format              | Format the project with TSC, ESLint, and Prettier                   |
| mono-fix            | Fix the project structure of the monorepo using `manypkg`           |
| uncache             | Delete all Turborepo caches                                         |
| clean               | Delete all `node_modules` directories                               |
| resinstall          | Clean the project then reinstall packages                           |
| reset               | Clean the project, delete the lockfile, then reinstall packages     |
| change              | Create a changeset                                                  |
| change:empty        | Create a special changeset with no changes noted                    |
| review              | Review your changeset changes                                       |
| release             | Build the project and create or update the changelog                |
| typelaunch-generate | Recover this directory (and template projects!)                     |
