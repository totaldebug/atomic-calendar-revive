---
layout: default
title: Documentation
parent: Contribute
nav_order: 7
---

# Documentation

The documentation site for Atomic Calendar Revive is built using Github Pages

## Contribute to the documentation

There are two ways of contributing to the documentation:

- Editing the files on github.
- Locally changing

[Instructions on development cycle](/atomic-calendar-revive/development/devcycle)

## Contents

All documentation is located under the `docs` folder

## Referense Pages

Lets say you need to reference another page that is located under:

```md
/config/index.md
```

Then you need to use:

```md
[Config Index](/config/index)
```

## Referense images

Lets say you need to reference a image that is located under:

```md
/assets/img/screenshots/screenshot.png
```

Then you need to use:

```md
![screenshot](/assets/img/screenshots/screenshot.png)
```

# New pages

- Create a new .md file under the directory docs/ in a sub-directory if required that fits the purpose of the file.
- At the top of all pages you should have this:

```md
---
layout: default
title: A title for your page
parent: Parent category name e.g. "Development"
nav_order: "(int) Location on the navigation menu"
---
```
