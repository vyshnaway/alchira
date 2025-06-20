
---

# Git Submodules Quick Guide

Basic commands for managing portable-bundle and portable-native submodules.

## Essential Commands

```bash
# Add submodules
git submodule add <repository-url> xtyles/portables
git submodule add <repository-url> xtyles/portables

# Clone project with submodules
git clone <repository-url>
git submodule update --init --recursive

# Update submodules
git submodule update --remote
```

## Common Tasks

### Check Status
```bash
git submodule status
```

### Update a Submodule
```bash
cd xtyles/autogen/portable-bundle
git pull
cd ../../
git add xtyles/autogen/portable-bundle
git commit -m "Update submodule"
```

### Remove a Submodule
```bash
git submodule deinit -f xtyles/autogen/portable-bundle
git rm -f xtyles/autogen/portable-bundle
```

## Quick Reference

- Always run `git submodule update --init --recursive` after cloning
- Keep submodules up to date with `git submodule update --remote`
- Commit submodule changes in both the submodule and main project

## Additional Resources

- [Git Submodules Documentation](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [Git Submodule Tutorial](https://git-scm.com/docs/git-submodule)
- [Git Submodule Cheat Sheet](https://git-scm.com/docs/git-submodule#_commands) 

# FILE: manifest.json

- This file will be used by extension and Ai agents to refer active library and portables.
- Manifest will auto generated only by a active running "watch" command.

```json
{
    "constants": string[],
    // - array of all constants from `#constants.css`.

    "hashrule": map{hashrule: value},
    // - map active valid hashrules with assigned value.

    "file": map{
        filePath: {
            group: "axiom"|"cluster"|"binding"|"portable"|"stylesheet"|"target",
            id: filePath|index
        }
    },
    // - targetable file for by extension
    // - provide guidelines on how to accumulates style for a specific file

    "binding": map{filepath, xtyles[]},
    // - uses { "group": "binding", "id": filepath}
    // - xtyles scoped acrross target folders and within `portables` folder

    "portable": map{filepath, xtyles[]},
    // - uses { "group": "target", "id": filepath}
    // - xtyles scoped acrross target folders and within `portables` folder

    "local": map{filepath, xtyles[]},
    // - xtyles scoped within each file
    // - uses { "group": "target", "id": filepath}

    "global": map{filepath, xtyles[]},
    // - xtyles scoped across all proxy folders
    // - uses { "group": "target", "id": filepath}

    "axiom": map{index, xtyles[]},
    // - uses { "group": "axiom", "id": index}
    // - xtyles scoped across all proxy folders, and axioms with lesser index

    "cluster": map{index, xtyles[]},
    // - uses { "group": "cluster", "id": index}
    // - xtyles scoped across all proxy folders, all axioms and clusters with lesser index, indipendent of cluster group
}
```

# FOLDER: portable-bundle.json

- Includes external portables, bindings and corresponding mardown.
- Portable version of functional classes, and its bindings.
- Define as git submodule to use across multiple projects.

# FOLDER: portable-native.json

- Only native portables, bindings and `guidelines.md`.
- Portable version of functional classes, and its bindings.
- Define as git submodule to use across multiple projects.
# XCSS Documentation

## Introduction

XCSS is the world's first framework-independent MS2 (Modular Style Management System), revolutionizing how we approach CSS architecture. Unlike traditional CSS frameworks that lock you into specific ecosystems, XCSS provides a universal styling solution that works seamlessly across any framework, templating system, or plain HTML.

### What is MS2?

MS2 (Modular Style Management System) represents a new paradigm in CSS architecture:

- **Modular**: Self-contained, reusable style components
- **Style**: Universal styling capabilities
- **Management**: Automated style organization and optimization
- **System**: Complete ecosystem for style development

### Why XCSS?

- **Framework Independence**: The first truly universal styling system
- **Lightning Fast**: Compile 1K-2K styles in 200ms, 2-6x faster than Sass or Tailwind
- **Tiny Bundles**: 10-19KB CSS bundles, 40-60% smaller than alternatives
- **Zero Overhead**: Works with any framework or plain HTML, no JavaScript required
- **AI-Ready**: Built-in support for AI tools and future automation
- **15-Minute Learning Curve**: Intuitive syntax that feels like CSS but scales effortlessly

### Core Philosophy

XCSS follows three core principles:

1. **Predictability**: Styles behave consistently, eliminating cascading surprises
2. **Performance**: Near-instant runtime (<1ms) and minimal bundle size
3. **Productivity**: Debug styles in 30-60 seconds with built-in source mapping

### Key Features

#### Intuitive Structure
- Human-readable syntax (`$normals { @assemble d-flex; }`)
- Metaclasses for fast debugging (`L14__*` maps to source files)
- Perfect for SPAs, non-JS frameworks, or raw HTML

#### Dynamic Libraries
- 253 Axiom styles and 174 Library styles
- Auto-integrates new styles via `@assemble`
- Zero manual imports required

#### Two-Level Iteration
- Resolves dependencies in ~200ms
- Incremental updates in 8-15ms
- Scales to 10K+ classes effortlessly

#### Universal Compatibility
- Works with any framework or templating language
- Auto vendor prefixing
- No lock-in, plug and play with existing projects

#### AI-Ready Architecture
- Manifests for AI tool integration
- Self-commented origins for each property
- Built for future automation

#### Effortless Maintenance
- Near-zero technical debt
- Automated style management
- Self-updating libraries

### Framework Independence

XCSS's MS2 architecture provides unprecedented flexibility:

- **No Framework Lock-in**: Use with React, Vue, Angular, or plain HTML
- **Universal Integration**: Works with any templating system (Pug, Handlebars, etc.)
- **Zero Dependencies**: No JavaScript runtime required
- **Future-Proof**: Adapts to new frameworks automatically

### Getting Started

The rest of this documentation will guide you through:
1. Setting up XCSS in your project
2. Understanding the core concepts
3. Using the development workflow
4. Mastering the style categories
5. Following best practices
6. Implementing common patterns

## Quick Start (2 min)

### Initialization
```bash
# Install XCSS CLI
npm install -g xcss-init

# Initialize new project
xdev init
# Follow the interactive setup guide

# Verify configuration
xdev init
# Run in existing project to check health
```

### Build Modes

#### Development
```bash
xdev watch
```
Features:
- Live compilation
- Fast build times
- Full source maps
- Debug metadata
- Development comments
- Unminified output

#### Preview
```bash
xdev preview
```
Features:
- Pre-production build
- HTML optimization
- Basic minification
- Portable generation
- Basic tree-shaking
- Development metadata

#### Production
```bash
xdev publish {key}
```
Features:
- Access key required
- Advanced optimization
- Critical CSS extraction
- Vendor prefix optimization
- Metadata stripping
- Bundle splitting
- Cache optimization

### Optimization Levels

#### Development
- Full source maps
- Debug metadata
- Unminified output
- All vendor prefixes
- Complete class names
- Development comments

#### Preview
- Basic minification
- HTML optimization
- Portable generation
- Basic tree-shaking
- Preserved metadata
- Development comments

#### Production
- Advanced minification
- Critical CSS extraction
- Vendor prefix optimization
- Metadata stripping
- Comment removal
- Advanced tree-shaking
- Bundle splitting
- Cache optimization


### XTyles Directory
```
xtyles/
├── autogen/          # Auto-generated portables
├── library/          # Core library files
├── portables/        # Reusable components
├── themes/           # Theme definitions
└── utils/            # Utility functions
```

### Directory Details

#### `autogen/`
Auto-generated files from preview builds:
- Component styles
- Utility classes
- Theme variables
- Media queries
- Animation keyframes
- Bundle optimizations

#### `library/`
Core framework files:
- `#elements.css` - Base element styles
- `#utilities.css` - Utility classes
- `#animations.css` - Animation definitions
- `#typography.css` - Typography system
- `#colors.css` - Color system
- `#spacing.css` - Spacing system
- `#breakpoints.css` - Responsive breakpoints

#### `portables/`
Reusable component definitions:
- `#buttons.css` - Button components
- `#cards.css` - Card components
- `#forms.css` - Form components
- `#navigation.css` - Navigation components
- `#tables.css` - Table components
- `#modals.css` - Modal components

#### `themes/`
Theme configuration:
- `#default.css` - Default theme
- `#dark.css` - Dark mode theme
- `#light.css` - Light mode theme
- `#custom.css` - Custom theme template

#### `utils/`
Utility functions and helpers:
- `#mixins.css` - CSS mixins
- `#functions.css` - CSS functions
- `#variables.css` - Global variables
- `#helpers.css` - Helper classes

### File Naming Conventions
- `#` prefix: Core framework files
- `$` prefix: Utility classes
- `$$` prefix: Global classes
- `@` prefix: Theme files
- `anim$` prefix: Animation classes
- `key$` prefix: Keyframe definitions

### Usage Examples

### Best Practices
1. Keep component styles in `portables/`
2. Use `autogen/` for generated files only
3. Extend themes in `themes/`
4. Add utilities in `utils/`
5. Follow naming conventions
6. Use relative paths for imports



### Portable Generation
Preview builds automatically generate portables in `xtyles/autogen`:
- Component styles
- Utility classes
- Theme variables
- Media queries
- Animation keyframes

### Production Features
- Access key validation
- Bundle optimization
- Cache headers
- CDN integration
- Performance metrics
- Error tracking

## Core Concepts (5 min)

### File Structure
- `#` prefix: Framework-specific files
  - `#elements.css`: Base styles
  - `#constants.css`: Variables
  - `#at-rules.css`: Media queries

### Proxy System
- `xrc/`: Source directory
- `src/`: Compiled output
- `proxy-map.jsonc`: Maps source to output

### Class Naming
- `$` prefix: Utility classes
  - `$bg-primary-500`: Background color
  - `$text-bright`: Text color
  - `$p-4`: Padding

### Theme System
```html
<!-- Light Theme -->
<html data-light-mode>

<!-- Dark Theme -->
<html data-dark-mode>

<!-- Default Theme -->
<html>
```

## Development Workflow (3 min)

### Live Development
```bash
xdev watch
```
- Watches `xrc` directory
- Compiles to `src`
- Updates in real-time

### File Organization
```
xtyles/
├── autogen/
|   ├── 
|
├── library/
├── portables/
├── #at-rules.css
├── #constants.css
├── #elements.css
├── hash-rules.json
├── proxy-map.json
└── readme.md 
```

## Style Categories (5 min)

These are extracted from `xtyles/libray

### Axiom Styles (Utilities)
- Basic utilities
- belongs to unclustered css from library folder, like `1.fonts.css`.
- Example: `$bg-primary-500`, `$p-4`

### Cluster Styles (Patterns)
- Complex patterns
- belongs to clustered css from library folder, like `key.1.keyframes.css`.
- Example: `anim$all`, `key$fade-in`

### Binding Styles
- Portable style bindings
- Example: `/portables/$/@keyframes animate`

### Portable Styles
- Reusable component level styles
- Self-contained modules
- Example: `/portables/$$vector-glow`

## Hash-rules
