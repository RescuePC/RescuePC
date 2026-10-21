# Profile maintenance

The profile uses standard GitHub Markdown and two repository-owned SVGs. Its main content, links, and illustrations do not depend on third-party image services, tracking pixels, or statistics hosts.

## Editing the profile

- Update the introduction, projects, toolkit, and contact links in `README.md`.
- Edit `assets/header.svg` to change the banner. Keep its title and description meaningful.
- Keep project descriptions concise and link only to public repositories.
- Preserve the `STATS:START` and `STATS:END` comments. The updater replaces only the text between them and `assets/github-snapshot.svg`.

## Public snapshot

The workflow runs daily at 09:23 UTC, can be triggered manually from Actions, and runs after changes to its script or workflow land on `main`. Scheduled runs may be delayed by GitHub. GitHub can disable scheduled workflows after 60 days without repository activity; re-enable the workflow in Actions if necessary.

It uses `GET /users/RescuePC/repos` with pagination to count public repositories, original public repositories (excluding forks), and stars on those originals. Empty or archived public repositories are included. It does not count private repositories, private contributions, commit totals, WakaTime hours, or a coding streak.

The workflow uses GitHub's built-in `GITHUB_TOKEN`; no personal access token or extra secrets are needed. The refresh job needs repository contents write permission to commit the two generated files. Pull requests run tests with read-only permissions and never refresh or push. Protected branches may require adapting the commit step to your repository rules.

An API failure leaves the previous committed snapshot visible, with its last successful date. If repository settings disable Actions, the profile still displays normally; only the snapshot stops refreshing.

## Local checks

Requires Node.js 22 or later, with no packages to install:

```sh
node --test scripts/update-profile.test.mjs
node scripts/update-profile.mjs
```

For an offline refresh from a saved public GitHub API response:

```sh
node scripts/update-profile.mjs --from-json /path/to/public-repos.json
```

Preview `README.md` in GitHub before merging. On a profile, GitHub serves relative images from this repository. All key information is also written as text, including the stats, so images are optional for understanding the profile.
