module.exports = class Package {
  constructor(
    name,
    fullName,
    repoUrl,
    dependencies = [],
    devDependencies = [],
    isNpmModule = true,
    githubId = -1,
    stars = -1,
    issues = -1,
    weeklyDownloads = -1
  ) {
    this.name = name;
    this.fullName = fullName;
    this.repoUrl = repoUrl;
    this.dependencies = dependencies;
    this.devDependencies = devDependencies;
    this.isNpmModule = isNpmModule;
    this.githubId = githubId;
    this.stars = stars;
    this.issues = issues;
    this.weeklyDownloads = weeklyDownloads;
  }
};
