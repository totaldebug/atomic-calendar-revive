---
layout: default
title: Development Cycle
parent: Contribute
nav_order: 6
---

# Development Cycle

The below will provide a guide on how you should develop for this plugin to have your code reviewed and accepted.

## Setup Repository

* Fork the repo in [GitHub](https://github.com/marksie1988/atomic-calendar-revive)
* Clone the project from your fork
  ```shell
  git clone https://github.com/your-fork/atomic-calendar-revive.git
  ```

## Create topic branch
You should be working on a topic branch (not master). Also, make sure that you have pulled the latest master into your repo.

Start on your master branch, grab the latest upstream master, and merge it in:

```shell
git checkout master
```

```shell
git remote update
```

```shell
git merge origin/master
```

Create a new topic branch:

```shell
git checkout -b new_feature
```

---

NOTE:
The branch should have a relevant short name e.g. patch-1 or bugfix-67 where the number is the issue it relates to

---

## Make changes & Test

Make the changes that you were planning in impelmenting

If using DevContainer you can test the files with `npm start`, the file will be accessible on http://127.0.0.1:5000/app.js

To add this to your Home assistant configuration add the following:
```yaml
- url: "http://127.0.0.1:5000/app.js"
  type: module
```

## Commit your changes

Once you are happy with your work, commit your changes:

```shell
git add .
git commit -v
```

### Commit style guide

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move the option..." not "Moves the option...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Consider starting the commit message with an applicable emoji:
    * :art: `:art:` when improving the format/structure of the code
    * :racehorse: `:racehorse:` when improving performance
    * :non-potable_water: `:non-potable_water:` when plugging memory leaks
    * :memo: `:memo:` when writing docs
    * :bug: `:bug:` when fixing a bug
    * :fire: `:fire:` when removing code or files
    * :green_heart: `:green_heart:` when fixing the CI build
    * :white_check_mark: `:white_check_mark:` when adding tests
    * :lock: `:lock:` when dealing with security
    * :arrow_up: `:arrow_up:` when upgrading dependencies
    * :arrow_down: `:arrow_down:` when downgrading dependencies
    * :shirt: `:shirt:` when removing linter warnings

## Submit for review

Now you will need to submit a Pull Request to the main repo for review.
