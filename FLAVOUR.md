# Flavourize

### Fork / Clone repository

- Fork this repository using your preferred Git service (e.g., GitHub, GitLab, Bitbucket), or clone the repository locally if you only want to keep a local copy without sharing or collaborating.
- Forking creates a copy in your own account for collaborative development, while cloning copies the repository directly to your local machine.

### Customize Scaffold Directory

- After forking, you have a scaffold directory—a basic project structure. Customize this directory by modifying or adding files and folders according to your project's needs. 
- This might include renaming files, adding new source code files, configuration files, or assets to tailor the scaffold as a personalized foundation for your specific use case.

### Personalize Sandbox Template

- The sandbox template provides a predefined example environment for testing and experimentation. 
- You can personalize it by modifying configuration files, sample code, or dependencies so that it matches the needs of your development or testing scenarios.

### Update Intro File

- Modify the intro.md file within the scaffold to update the introduction section of the auto-generated **README.md** file.
- When cloning this repository, ensure you keep the existing introduction unchanged. You can add any new content you want immediately after the original introduction, without modifying or removing it.
- This method preserves the original context and key information while allowing you to enrich the documentation with additional details.
- After making changes, run the **package.js** script to regenerate and update the **README.md** file with the revised content.


### Prepare Package Metadata

- Before publishing, update your package.json (or equivalent manifest for your ecosystem) so it correctly describes your package.
​- Set or review fields such as name, version, description, license, author, repository, main/exports, and files to ensure consumers get the right entry points and metadata.​
- If your project needs a build step, define scripts like "build" and "prepublishOnly" or "prepare" so that your package is automatically built and validated before it is packed and published

### Keep it Private or Public, Publish in Your Preferred Registry

- Decide whether to keep your forked repository private—in which case, access is restricted to you and collaborators—or public, allowing open community access. 
- Additionally, if your project includes packages or modules, you can publish them to registries like npm or GitHub Packages to facilitate easy sharing and installation by others.

### Maintanance

- Regularly pull updates from the original source repository to keep your fork in sync with the latest changes and binaries. This involves adding the original repo as an upstream remote and merging upstream changes into your local copy.
- Update your published package versions in your preferred registry to distribute fixes and new features, ensuring users get the latest stable releases.
