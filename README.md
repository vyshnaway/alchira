# Documentation

## End-User License Agreement (EULA)

By using this software, you agree to the terms and conditions outlined in the [End-User License Agreement](https://www.xtatix.io/agreements/license).
For details, please read the full EULA document provided in this repository.

---

## What is Xtatix?

![Preview](https://github.com/yshelldev/xtatix-vscode/raw/HEAD/preview.png)

Xtatix is a constraint-driven CSS build-time kernel designed to be the foundational engine for building custom CSS frameworks. Rather than being a traditional CSS framework loaded with predefined classes, Xtatix provides a powerful structural abstraction that preserves the full flexibility of vanilla CSS while adding native dependency management and modular composition. It works seamlessly across any text-based environment, is framework agnostic, and integrates effortlessly with existing design systems and token libraries.

By focusing on modular style blocks, logical constraint-based syntax, and automatic cascading and dependency resolution, Xtatix empowers teams to build maintainable, predictable, and optimized stylesheets tailored precisely to their project needs.

## Why Use Xtatix?

Xtatix strikes a careful balance between raw flexibility and developer experience without sacrificing either. It:

- Enables fully customizable framework creation with minimal initial setup, reducing context switching between CSS and HTML.
- Resolves style dependencies and cascading order natively at build time, minimizing manual overrides and conflicts.
- Supports reusable modular blocks that grow with your application, eliminating brittle selectors and tangled overrides.
- Delivers production-ready optimized builds with debloated, dependency-aware styles for faster and cleaner deployment.
- Acts as a robust kernel platform, giving you complete control and transparency while providing structural best practices and optimization out of the box.

In short, Xtatix is the essential, extensible core upon which efficient, scalable, and maintainable CSS frameworks can be built—offering the power and performance that modern design systems and large-scale projects demand.

# 0. Installation

For using Xtatix in non-JavaScript based codebases, install Xtatix globally. After that, the usage remains the same as in other environments.

## Using NPM

### Global Installation

Install Xtatix Central globally with:

```bash
npm install -g xtatix-central
```

Run Xtatix commands directly:

```bash
xtatix {command}
```

### Local Installation

Install Xtatix Central as a development dependency locally:

```bash
npm install --save-dev xtatix-central
```

Run Xtatix commands locally using npm scripts:

```bash
npx xtatix {command}
```
# 1. Command Line

### `init` : Initialize and Healthcheck

- Sets up the project by importing the configuration folder, and makes necessary changes to `configure.jsonc`.
- If run inside an already initialized directory, it will create the necessary sub-folders as defined.

### `debug` : Compiles with full verbosity and traceability

- Verbose output
- Traceable class-names and properties.
- Larger output size
- Use `debug -w` for live compilation with identical output.

### `preview` : Optimized compilation for lightweight builds:

- Hashed class-names (≥ 3 characters)
- Minified CSS.
- Partial dependency resolution
- Optimized for minimal class footprint
- Use `preview -w` for live compilation.

## Developer Commands

### `server` : Starts language server

- Helps in active language assistance in editors.
- Start server, use `help` for available command list.
- Used by extension developers.

## Experimental Commands

### `iamai` : Communication bridge for AI Agents

- Helps in context aware styling by AI Agnets.
- This command is a combination of `preview` and `server` commands.
# 2. Example Demo

## Input

- The following is fragmented preview of input to output compilation.

```html
<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <!-- style -->
</head>
```
- `<!-- style -->`, a reserved comment tag, which will be replaced by compiled stylesheet.

```html

<body 
data-sveltekit-preload-data="hover" 
class="=bg$pattern-checkerboard =$custom-pattern" 
_$custom-pattern="
  --pattern-checker-bg1: #456734;
  --pattern-checker-bg2: #2bb43d;
  --pattern-checker-size: var(---delta-block-lg);
"
{@media (min-width:512px)}&="
  --pattern-checker-bg1: var(---primary-100);
  --pattern-checker-bg2: var(---secondary-900);
">
```

- You can compose classes with in html tags with attribute representing **symbolic classes (symclasses)** `bg$pattern`, and attribute which ends with `&` is considered **wrappers** for the symbolic class.
- `@--assign` / `=` can be used for initial compose of a symbolic class using **symclasses from libraries**. These will be hoisted to block scope and any explicit properties will easily override them. 
- Use `&` attribute to write comment, which can be used multiple times in the same tag. 
- To use a symbolic class use `={sym-class}` with in attributes. 

```html
  <stitch amorphous$--container>
    <svg xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="#glass-distortion" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92"
            result="noise" />
          <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
          <feDisplacementMap in="SourceGraphic" in2="blurred" scale="77" xChannelSelector="R"
            yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  </stitch>
```

-  `<stitch ... > ... </stitch>` a special tag used to create a **dependency to text-block with a symclass**. The content with-in the tag will be only deployed if the corresponding symclass is used compiled CSS.

```html
  <sketch style="
    background-size: 18px 18px;
    background-image: linear-gradient(#ffffff 0.9px, transparent 0.9px), 
      linear-gradient(to right, oklab(100% 0 -0.00011) 0.9px, #cacaca 1px);
  " data-amorphous-type="liquid" amorphous$$$container="
    ~ amorphous$--container ;
    = p-12 m-0 border-0 d-flex align-center justify-center position-fixed;
    = tx$decoration-none isolate an$transition-all an$animation-delay-500;
    animation: .5s fade-in forwards;
    &:hover {
      = tf$scale-105;
    }
    &::after {
      = position-absolute inset-0 layer-neg-2 radius-16 tx$content-clear;
      filter: url(#\#glass-distortion);
    }
    &::before {
      = position-absolute inset-0 layer-neg-1 radius-16 tx$content-clear;
      box-shadow: inset 0 0 15px -5px #ffffffec;
    }
    &[data-glass-type=]& {
      &['liquid'] {
        &::after { backdrop-filter: blur(.5px); }
        &::before { background-color: #e7fffa73; }
      }
      &['frosted'] {
        &::after { backdrop-filter: blur(1px); }
        &::before { background-color: lab(93.8 1 -5.7 / 0.713); }
      }
    }
  ">
    Template
  </sketch>
```
- `<sketch ... > ... </sketch>`, a special tag which lets you create portable template for component level **symclasses**, which can be used for preview in a live sand-boxed environment while using language server. 
- `@--attach` / `~` can be used to add a dependency attachment of a symbolic class. These will be used for dependency tracking.

```html
  <div data-amorphous-type='liquid' class="~amorphous$$$container"> Content </div>
```
- Symbolic classes can  defined anywhere and used where-ever within the provided scope.

```html
  <!-- stitch -->
</body>
</html>
```
- `<!-- stitch -->` a reserved tag which will be replaced with stitch content of tracked dependencies.

## Output

```html
<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <style>
    
    ._8h {
      --pattern-checker-bg1: var(---tertiary-300, #e0e0e0);
      --pattern-checker-bg2: transparent;
      --pattern-checker-size: 40px;
      background: linear-gradient(45deg, var(--pattern-checker-bg1) 25%, var(--pattern-checker-bg2) 25%, var(--pattern-checker-bg2) 75%, var(--pattern-checker-bg1) 75%, var(--pattern-checker-bg1)), linear-gradient(45deg, var(--pattern-checker-bg1) 25%, var(--pattern-checker-bg2) 25%, var(--pattern-checker-bg2) 75%, var(--pattern-checker-bg1) 75%, var(--pattern-checker-bg1));
      background-size: var(--pattern-checker-size) var(--pattern-checker-size);
      background-position: 0 0, calc(var(--pattern-checker-size) / 2) calc(var(--pattern-checker-size) / 2);
      display: flex;
      justify-content: center;
      align-items: center;
      min-width: 100vw;
      min-height: 100vh;
    }

    ._8i {
      padding: 6rem;
      margin: 0;
      border-width: 0;
      border-radius: 4rem;
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;
      text-decoration: none;
      cursor: pointer;
      background: none;
      font-size: var(---font-size-h1);
      isolation: isolate;
      transition: all 300ms ease;
      box-shadow: 0px 6px 12px -6px #77777777;
    }

    ._8i.glass-type[data-amorphous-type='frosted']::after {
      backdrop-filter: blur(1px);
    }

    ._8i.glass-type[data-amorphous-type='frosted']::before {
      background-color: rgba(255, 255, 255, 0.6);
    }

    ._8i.glass-type[data-amorphous-type='liquid']::after {
      backdrop-filter: blur(.5px);
    }

    ._8i.glass-type[data-amorphous-type='liquid']::before {
      background-color: rgba(255, 255, 255, 0.25);
    }

    ._8i:hover {
      transform: scale(1.25);
    }

    ._8i::after {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: -2;
      border-radius: 4rem;
      content: "";
      filter: url(#glass-distortion);
    }

    ._8i::before {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: -1;
      border-radius: 4rem;
      content: "";
      box-shadow: inset 0 0 15px -5px #00000044;
    }

    @media (min-width:512px) {
      ._8h {
        --pattern-checker-bg1: var(---primary-100);
        --pattern-checker-bg2: var(---secondary-900);
      }
    }
  </style>
</head>

<body data-sveltekit-preload-data="hover" class="_8h">

  <div class="_8i" data-amorphous-type='liquid'>
    Content
  </div>

  <div>
    <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
      <defs>
        <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92"
            result="noise" />
          <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
          <feDisplacementMap in="SourceGraphic" in2="blurred" scale="77" xChannelSelector="R"
            yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  </div>
</body>

</html>
```
# 3. Directory

## Setup folder
```
    xtyles/
    ├── libraries
    |   ├── _scaffold_
    |   |    └── *.css
    |   └── *.css
    ├── #at-rules.css
    ├── #constants.css
    ├── #elements.css
    ├── #extends.css
    ├── configure.jsonc
    ├── hashrules.jsonc
    └── vendors.jsonc
```

### `./#at-rules.css`
- Defines preface directives for exported stylesheets.
- Declares preface-level directives for exported stylesheets, such as `@import`, `@layer`, `@charset`, `@font-face` etc.

### `./#constants.css`
- Defines the core design tokens—colors, spacing, typography, and themes.
- Constants are context-aware and surfaced via LSP suggestions in valid scopes, enabling consistent styling.

> **Convention:**
> To prevent naming collisions and maintain clarity, all constants should follow the standard prefix format:  **`---{...}`**. This naming convention ensures safe resolution across files and avoids unintended conflicts in symbolic or dynamic contexts
---

### `./#elements.css`
- Encourages semantic usage of tags by styling native tags directly.
- Offers classless CSS that dynamically adapts to the design system defined in `constants.css`, promoting minimal markup and clean semantics.

### `./#extends.css`
- Augments the base CSS with additional declarations and overrides.
- Ideal for post-compilation definitions, utility extensions, and scoped enhancements that build on the compiled source stylesheet.

---
### `./configure.jsonc`

```json
{
  "vendors": "none",
  "proxymap": [
    {
      "source": "src",
      "target": "xrc",
      "stylesheet": "styles.css",
      "extensions": {
        "html": [
          "class"
        ]
      }
    }
  ],
  "environment": "browser",
}
```

- **`vendors`**  
    Specifies vendor prefixing behavior.  
    Accepts `"none"` or a list of vendor targets (e.g., `"webkit"`, `"moz"`).
- **`proxymap`**  
    Defines proxy compilation behavior for source-to-target transformation.
	- **`source`**  
	    Path to the original source directory containing raw project files.
	- **`target`**  
	    Proxy output directory. Acts as a working compilation target for the source folder.
	- **`stylesheet`**  
	    Stylesheet appended to the final compiled output. Located within the target directory.
	- **`extensions`**  
	    Maps file types to attributes where symbolic classes will be injected.  
	    Example: `"html": ["class"]` targets HTML files and assist merge tooltip via extension for given attributes.
- **`environment`**  
    Used by Editor extention for standerd css completion in compilation blocks.  
    Refer Extention walkthorugh to see in action at [../tutorial/0.extention.md](../tutorial/0.extention.md).

### `./hashrules.jsonc`

```json
{
  "-DesignApproach": "#{-MobileFirst}",
  // Values for #DesignApproach
  "-MobileFirst": "min-width",
  "-DesktopFirst": "max-width",  
  // @media standards
  "Ms4": "media@(#{-DesignApproach}:0320px)",
  "Ms3": "media@(#{-DesignApproach}:0384px)",
  "Ms2": "media@(#{-DesignApproach}:0448px)",
  "Ms1": "media@(#{-DesignApproach}:0512px)",
  "Mmd": "media@(#{-DesignApproach}:0640px)",
  "Ml1": "media@(#{-DesignApproach}:0768px)",
  "Ml2": "media@(#{-DesignApproach}:0896px)",
  "Ml3": "media@(#{-DesignApproach}:1024px)",
  "Ml4": "media@(#{-DesignApproach}:1152px)",
  // @container standards
  "Cs4": "container@(#{-DesignApproach}:160px)",
  "Cs3": "container@(#{-DesignApproach}:192px)",
  "Cs2": "container@(#{-DesignApproach}:224px)",
  "Cs1": "container@(#{-DesignApproach}:256px)",
  "Cmd": "container@(#{-DesignApproach}:320px)",
  "Cl1": "container@(#{-DesignApproach}:384px)",
  "Cl2": "container@(#{-DesignApproach}:449px)",
  "Cl3": "container@(#{-DesignApproach}:512px)",
  "Cl4": "container@(#{-DesignApproach}:576px)",
  // Global States
  "Load": "body[data-loading='true']"
}
```

- `hashrules` define reusable **wrapper-attribute-snippets** as key-value pairs, where keys are restricted to characters: `A–Z`, `a–z`, `0–9`, and `-`.
-  Support **recursive loading**, enabling inheritance across definitions.
- To use a `hashrules` in a script, use the `#{___}` within **wrapper-attribute** of a tag. The `hashrule` will only take effect if the tag already includes a declared style.
- If a recursion loop is detected due to conflicting shorthand definitions, those entries will be ignored during compilation, with errors.

> For clarity and conflict avoidance, any `hashrule` used as a variable should begin with a **`-` prefix**.

### `./vendors.jsonc`

- If `configure.jsonc | vendors: none` : Paste custom vendor data in this file
- If `configure.jsonc | vendors: {url}` has a valid URL source file will by automatically updated occasionally for vendor provider data.

### `./libraries`

- Organize classes into groups with up to 6 levels of inheritance based on existing classes.
- Details on managing libraries are covered in the next section.

### `./libraries/_scaffold_`

- This folder contains the immutable part of your library supplied by the initalized flavour.
- It includes static class sources used for symclass generation.
# 4. Libraries

Composing libraries is essentially like managing a set of CSS files—sensibly grouping classes and naming them according to established standards. This approach ensures clarity, maintainability, and consistency across your stylesheets.

Well-structured grouping and naming conventions help in scalable CSS architecture and make it easier to extend or modify the libraries over time.

## Naming Files
```
{cluster}.{order}.{name}.css
``` 

- **cluster** : `string[A-Z a-z 0-9 -]`
- **order** : `0|1|2`
- **name** : `string[A-Z a-z 0-9 -]`

## Managing Library Files

```
{cluster}{'$'*order}{Normalized(selector)}
```
#### Example

The classes defined in this file are accessed from other files using the following symbolic class references.

```css
/* anim.1.animation.css */

.none {
  transition: none;
} /* Sym-class: anim$none */

.all {
  transition: all 300ms ease;
} /* Sym-class: anim$all */

.transform {
  transition: transform 300ms ease;
} /* Sym-class: anim$transform */

.opacity {
  transition: opacity 300ms ease;
} /* Sym-class: anim$opacity */

.fade-in {
  @--attach anim$_keyframes_fade-in;
  animation-name: fade-in;
} /* Sym-class: anim$fade-in */

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
} /* Sym-class: anim$_keyframes_fade-in */
```

All the first order blocks of each file will have a corresponding symbolic class generated. This will be use full in cases where custom rule block has to be linked with classes.

## Special CSS Directives

```css
.classname {
  @--assign $class-1 $class-2 $class-1;
  @--attach $attach-1 $attach-2;
}
```

### `@--assign`
- Compose styles from predefined classes from libraries using sym-classes.
- Values derived from this action is overridden by explicit properties

### `@--attach`
- Creates dependency with other classes using its symbolic-class representation.
- Library classes have dependent-style and composable-style of same value.  

## Inheritence Pattern:

- `order` is the hierarchy level for library inheritance. Lower order files provide base/axiom styles; higher order files can reference and extend lower orders. Use `order` to control assignment (`@--assign`) and attachment (`@--attach`) visibility and override behavior.

### Types of Libraries

- Provided editor intergration are aware of these libraries and give only appropriate suggestions according to active files.

#### Axiom

- `cluster` = `''`
- A special cluster without a cluster-name. ( Example: 0.display.css )

- In a file of **Order `n`**, symbolic classes may be referenced from other files using two distinct directives, with in the scope of `axiom` where permitted sources are:
	-  `@--assign`: Files of **Order ≤ n−1**
	-  `@--attach`: Files of **Order ≤ n**

#### Clusters

- Named clusters can access all symbolic classes from Axioms.
- In a file of **Order `n`**, symbolic classes may be referenced from other files using two distinct directives, with in the scope of whole `axiom` and `cluster` were permitted sources are:
	-  `@--assign`: Files of **Order ≤ n−1**
	-  `@--attach`: Files of **Order ≤ n**
# 5. Hash Loader

# Hash Loaders

The Hash Loader operator dynamically imports unique hashes for files, enabling their seamless use as identifiers in HTML attributes, CSS styles, and JavaScript code for efficient tracking and updates.

## Watch Attributes Configuration

Define which HTML attributes should watch for hashes based on file extensions. For example, to watch class and id attributes in HTML files, use this configuration:

```json
"extensions": { "html": [ "class", "id" ] }
```
This setup allows the Hash Loader to recognize and link hashes within those attributes automatically.

## Using Hashes in Watch Attributes

Place hashes directly as values in watched attributes by prefixing them with `#`:

```xml
<section id="#reg-id" class="#reg-class">
```
This links the hash dynamically to the HTML elements for tracking or live updates, enabling reactive styling or scripting tied to these unique identifiers.

### Using Hashes Outside Watch Attributes

When using hashes in other places like JavaScript, CSS, or non-watched attributes, prefix the hash follower with a backslash `\` to escape it, ensuring valid usage without conflicts:

```html
<div onload="func('\#reg-id')">

<style>
  .\#reg-class { ... }  
</style>

<script>
  const id = "\#reg-id";
  const className = "\#reg-class";

  const className = ".\#unreg-class";
  // Note: Unregistered hashes like ".\#unreg-class" will not appear in the rendered output.

  function func(str) {
    // Your function implementation
  }
</script>
```

Using this escaping keeps hashes valid across different contexts whether in HTML, styles, or scripts.

### Additional Tips

- Always escape hashes with `\#` outside watch attribute values.

> This method ensures consistency and correctness when importing and using unique identifiers across your project files.
# 6. Class Loader

Class Loaders are special operators in Xtatix that signal the use of symbolic classes (sym-classes) within watch attributes. They distinguish sym-classes from conventional CSS classes, enabling their simultaneous use without conflicts or style collisions in complex projects.

Unlike traditional CSS cascading, which applies styles globally, Class Loaders implement localized cascade control rules at the element level. This allows developers to precisely layer and control how sym-classes interact with each other and with existing styles, eliminating global cascade conflicts.

### Core Concept

Class Loaders create scoped cascade layers within an individual HTML element, applied in a strict sequence during compilation:

> Scattered (~) → Ordered (+) → Final (=)

Each variant represents a distinct cascade layer:

- **Scattered (~):** Utility and atomic classes applied first, in a non-deterministic order.
- **Ordered (+):** Classes applied after scattered, with explicit order-based control.
- **Final (=):** Classes applied last, typically for dynamic or externally controlled styles.

### Practical Cascade Flow

```html
<p class="~atomic +component =dynamic-prop">
  <!-- 
    1. `~` classes load first (atomic utilities, no strict cascade)
    2. `+` classes override next based on declared order (component-level styles)
    3. `=` classes apply last and have final precedence (dynamic props or conditional styles)
  -->
</p>
```

### Real-World Use Cases

- `~`: For atomic utilities such as padding and margins where no precise cascade ordering is needed.
- `+`: For component styles that require explicit override control.
- `=`: For state or property-driven styles in frameworks that need last-layer authority.

> Enable project theme option in the sandbox toolbar enables global design tokens from your current design system, so turn it on to see live changes.

## Scattered Class Loader (`~`)

The Scattered Class Loader (`~`) applies utility and atomic classes in a non-deterministic way. It avoids reliable style cascading, especially in complex or deeply nested components, providing low-specificity control without predictable inheritance.

### Key Limitations
- Does not cascade styles reliably in nested components, making inheritance unpredictable.
- Styles may change continuously due to this unpredictable loading behavior.

### Syntax and Usage
- Prefix sym-classes with a backslash when used outside watch attribute values: `\~`.

```html
<sketch class-loader$scattered>
    <p class="~tx$size-h1 ~tx$size-h2" onload="func('\~align-center')">Paragraph</p>
</sketch>
<p class="~tx$size-h1 ~tx$size-h2" onload="func('\~align-center')">Paragraph</p>
<script>
    const classname = `\~tx$size-h1`;
</script>
```
Escape the tilde in JavaScript template literals or event handlers to maintain functionality.

### When to Use

- Best suited for utilities and atomic classes that do not overlap.
- Avoid using it when stable or nested style propagation is required.


## Ordered Class Loader (`+`)

The Ordered Class Loader (+) applies classes after scattered classes, allowing explicit control over cascading order within a single element.

### Usage Restrictions

- This operator can only be used inside the values of HTML tag attributes.
- It cannot be used outside tag attributes (e.g., in JavaScript or styles).

### Example

```html
<sketch class-loader$ordered>
    <p class="~tx$size-h1 ~tx$size-h2 +tx$size-h3 +tx$size-h2" onload="func('\+align-center')">Paragraph</p>
</sketch>
<p class="~tx$size-h1 ~tx$size-h2 +tx$size-h2 +tx$size-h3" onload="func('\+align-center')">Paragraph</p>
<script>
    const classname = `\=tx$size-h1`; // Operator not allowed outside tag attributes
</script>
```

### Cascading Behavior

- The cascade follows the exact order of classes within the attribute's value.
- Classes with `+` are applied after scattered ~ classes, overriding them if necessary.
- In the example, `tx$size-h2` applied with `+` comes last and thus takes precedence.

### When to Use

- Use to control precisely which styles override others within the same element.
- Handy when combining conflicting utility classes or higher order component classes, to make style application predictable.

## Final Class Loader (`=`)

The Final Class Loader operator `=` applies classes after both scattered `~` and ordered `+` classes, but it does not provide explicit control over the cascading order.

### Usage and Syntax

- It is used inside tag attribute values.
- Outside watch attribute values (e.g. JavaScript), escape with a backslash: `\=`.

```html
<sketch class-loader$final>
     <p class="~tx$size-h1 ~tx$size-h2 +tx$size-h3 =tx$size-h4 =tx$size-h5"> paragraph </p>
</sketch>
<p class="~tx$size-h1 ~tx$size-h2 +tx$size-h3 =tx$size-h4 =tx$size-h5"> paragraph </p>
<script>
    const classname = `\=tx$size-h1`;
</script>
```

### Behavior

- The final classes are applied last and may cause continuous style changes due to their unpredictable cascading.
- The cascade order is less explicit compared to the Ordered Class Loader.

### When to Use

- Ideal for external actions that come from outside the element's usual style scope, such as prop passing in JavaScript frameworks.
- Useful for conditional logic where styles are applied dynamically and may change frequently.
- This loader helps handle dynamic styling situations where final overrides are necessary but strict cascading order control is not required.
# 6. Composition

## Symbolic-Class 

``` 
{cluster}{scope}{identifier}
```

- **`cluster`**: Collection of classes, or use '-' to delegate to open cluster. 
  - Available characters: `A-Z`, `a-z`, `0-9`, and `-`.
  - `-` or `_`  is only for delegating open cluster at declaration. It will be hidden in other cases.
- **`scope`**: Scope of access of declared styles
  - `$` | **Local:** with in the declared file.
  - `$$` | **Global:** across all valid files in target folders.
- **`identifier`**: Specific identifier within the cluster.
  - Available characters: `A-Z` `a-z` `0-9` and `-`.

- While composing styles, you can use any of the following for external grouping:
  - **\` ... \`**
  - **\[ ... \]**
  - **\{ ... \}**
  - **\( ... \)**
  - **\' ... \'**
  - **\" ... \"**
- Be careful not to use the same internal quotes as the external grouping to avoid conflicts.

### Example
```html
<div -$button=" ... ">
<div _$button-2={ ... }>
<div animate$$fade-in=' ... '>
```

## Wrapper Attributes

- Each wrapper-attribute generates a corresponding wrapper element around the class, with selectors derived directly from the attribute name.
- Wrapper-attributes enable highly flexible conditional logic—styles can be scoped, toggled, or layered based on attribute presence or value.
- Responsive design breakpoints are implemented using wrapper-attributes, allowing layout and style shifts based on contextual constraints.

### Rule Specification
- Must terminate with an `&` token
- `hashrules` (`#{rule}`) are valid within these attributes.
- use `{...}` brackets for raw string formatting for not breaking at spaces.
- Within `identifier@{ ... }`, shorthand expressions map to style constraints:
  - `width>=` : `min-width:`
  - `width<=` : `max-width:`
  - `height>=` : `min-height:`
  - `height<=` : `max-height:` 
  
### Example
```html
<!-- Assume Hashrule `#{Load}` == "body[data-loading]" from hashrules.jsonc  -->
<div
  _$class="..."
  #{Load}&="..." 
  {@supports not (backdrop-filter: blur(1px))}&="..."
  container@{(max-width: 320px)}&="...">
  {Placeholder}
</div>
```
Gets structurally gets transformed into:
```css
.$class { ... }
body[data-loading] .$class { ... }
@supports not (backdrop-filter: blur(1px)) { 
  .$class { ... } 
}
@container (max-width: 320px) { 
  .$class { ... } 
}
```

## Compiled Classnames

- Each compilation command uses different stratagies for cascading and create classes.

### `debug`

- Unoptimized cascading order, and verbose classnames representing source-data.
- **Scattered Classes:**
  - Format: `{Type}|{Definition-Source}_{Symbolic-Class}`
  - Example: `PUBLIC|xrc/content/demo.html:30:2_glass$$$container`
- **Ordered Classes:**
  - Format: `TAG|{Import-Source}__{Type}|{Definition-Source}_{Symbolic-Class}`
  - Example: `TAG|xrc/content/demo.html:16:58__PUBLIC|xrc/content/demo.html:30:2_glass$$$container`
- **Final Classes:**
  - Format: `{Type}|{Definition-Source}_{Symbolic-Class}_Final`
  - Example: `PUBLIC|xrc/content/demo.html:30:2_glass$$$container_Final`

### `preview`

- Unoptimized cascading order, and respective classnames.
- Classname is enumered hash followed by cascade position index.
- **Scattered Classes:**
  - Format: `~{classname}_{hash}`
  - Example: `~scatter-class_g3` 
- **Ordered Classes:**
  - Format: `!{classname}_{hash}-{cascade-counter}`
  - Example: `!ordered-class_g3-134` 
- **Final Classes:**
  - Format: `={classname}_{hash}`
  - Example: `=final-class_g3` 

### `publish`

- Unoptimized cascading order, and respective classnames.
- Classname is enumered hash followed by cascade position index.
- **Scattered Classes:**
  - Format: `_{hash}`
  - Example: `__k9`, `__8i` 
- **Ordered Classes:**
  - Format: `__{hash}-{cascade-counter}`
  - Example: `__H9`, `__8h` 
- **Final Classes:**
  - Format: `___{hash}`
  - Example: `___k9`, `___8i`
# 7. Custom Tags

## Declaration Tags (Paired Tags)

- If a symbolic-class is found as attribute with in special tags, the content between tags is considered bound to it.
- Paired tags are collapsed, and self closing tags are replaced with proper value while compiling.

```html 
<style local$-class>
  ...
</style>
<stitch local$--class>
  ...
</stitch>
<sketch
  attribute-1="attr-value-1"
  attribute-2="attr-value-2"
  attribute-3="attr-value-3"
  local$class="
    ~ local$-class local$--class;
    = $class-1 $$class-2 $class-3;
    property-1: value-1;
    property-2: value-2;
    property-3: value-3;
  "
>
  Template
</sketch>
```

### `<style> ... </style>` 
- This tag is a special case, as it’s the standard HTML tag for writing CSS content inside markup.
- If a sym-class is found in the opening tag, the content between tags is considered a dependent snippet of that corresponding sym-class.
- Declared using a sym-class where - immediately follows the final $ (e.g., style$-class-name).

### `<stitch> ... </stitch>`
- Snippets are imported in a minified form but remain unprocessed.
- Useful for direct association without transformation or validation.
- Declared using a sym-class where -- immediately follows the final $ (e.g., stitch$--class-name).

### `<sketch> ... </sketch>`
- Used to declare component-level styles and generate corresponding style templates.
- The snippet inside these tags is used for live preview of the given classes.
- Style attributes are passed to the sandbox body, while other attributes are passed directly to the preview sandbox.

## Replacement Placeholders (Self-Closing Tags && Reserved HTML Comments)

```html
<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8" />
  <meta 
    name="viewport"
    content="width=device-width, initial-scale=1" 
  />
  <!-- style -->
</head>

<body 
  data-sveltekit-preload-data="hover" 
  class="=bg$pattern-checkerboard =$custom-pattern" 
  _$custom-pattern="
    --pattern-checker-bg1: #456734;
    --pattern-checker-bg2: #2bb43d;
    --pattern-checker-size: var(---delta-block-lg);
  "
>

  <stitch amorphous$--container>
    <svg xmlns="http://www.w3.org/2000/svg">
      <defs> ... </defs>
    </svg>
  </stitch>


  <sketch 
    data-glass-type="liquid" 
    amorphous$$$container="
      ~ amorphous$--container;
      &::after {
        filter: url(#\#glass-distortion);
      }
    "
  >
    Template
  </sketch>

  <div 
    id="#scoped-id" 
    data-glass-type='liquid' 
    class="~amorphous$$$container"
  > Content </div>
  <!-- stitch -->
</body>

</html>
```

### `<sketch />` /  `<!-- sketch -->` 

- Used as a placeholder for deploying `stylesheet` and `stitch-snippets` together in the compiled output.
- Intended for rapid prototyping, not recommended for production use.

### `<style />` /  `<!-- style -->`

- Embed stylesheet using these tags with in any targeted files. 

### `<stitch />` / `<!-- stitch -->`

- Acts as a placeholder for injecting attached `stitch-snippets` into the compiled output.
# 8. Appendix

## Errors & diagnostics

- Build errors and diagnostics are emitted to the terminal and surfaced through the language server (LSP) for editor tooling.
- Running compilation in `watch` mode enables live diagnostics: errors and warnings are updated in the terminal as files change.

## Symbolic-class uniqueness rules

- Local symbolic-classes (single `$`) must be unique within the declaring file.
- Global symbolic-classes (`$$`) must be unique across the entire project workspace.
- Neither local nor global symbolic-classes should collide with symbolic-classes generated by libraries; library-derived symbolic-classes are considered a separate namespace and collisions will produce warnings or errors during compilation.

## Proxymap behavior

- On `init`, if a `proxymap` entry specifies a `target` folder that does not exist, the `target` will be cloned from the `source` to create a working proxy folder.
- During compilation, the `target` (proxy) folder is used as the compilation source. The compiler reads the `target` files and writes compiled artifacts into the `source` folder; treat `target` as a local source copy watched by the tool.

## Dependency resolution

- Dependency resolution is automated. The compiler traverses the attachment tree for symbolic-class `@--attach`/`~` links and deploys all interconnected dependencies together after symbolic classes are composed.
- `stitch` snippets are replaced with the `<stitch />` placeholder at compile time; ensure your attached stitch snippets are present where expected to avoid missing assets.

## Hashing Methodology

- Class names that start with an underscore (`_`) are reserved for compiler-generated identifiers.
- The hashing/name generation uses a continuous counter encoded in base62 (0-9, A-Z, a-z) to produce short, deterministic names, and uses different method in different builds commands. This approach ensures compact identifiers while remaining deterministic across runs when the input and library ordering are unchanged.

## Hoisting semantics

- Hoisting is a default behavior: assigned (`@--assign` / `=`) and attached (`@--attach` / `~`) styles are pulled toward the top during compilation. Variables are promoted to an even higher preface level.
- Under a single scope, a variable may only have a single effective value; later overrides declared in the same scope replace earlier ones during hoisting.
- Prefer declaring state-affecting variables in the base class declaration and rely on compound selectors to update variables.

## Miscellaneous

- Source maps are not provided. Because the tool operates on plain text files and is intentionally language-independent, there is no meaningful source-map mapping to generate for generic text inputs.
- Vendor prefixes and compatibility data are fetched from external sources at build or release time so the tool can adapt to platform changes without embedding large datasets.
- Rarely-used color palettes will be provided additional fall back to literal hex codes.

## Runtime integration

- No runtime integration or API/plugins required
- The compiler produces a static stylesheet artifact which can be included in your app like any other CSS file.

## Extensibility & contributions

- The compiler binary is intentionally a closed distribution for runtime execution: contributions to the binary itself are not expected. The tool is a structural processor and does not validate or understand CSS properties or values — **it operates on document structure and symbolic classes**.
- Extending the system: users can add CSS files to the `xtyles/libraries` folder to create custom libraries/frameworks; the six-level inheritance model allows rapid propagation of changes across a project.
- Conditional definitions (media queries, custom at-rules, container-dependent variants, etc.) are generated using wrapper-attributes. `hashrules` provide reusable snippets for wrapper attributes.
- Users may fork or clone the repository, personalize their own variants, and distribute them as needed. For detailed guidance on customization, refer to the Flavourize documentation. Be sure to review the EULA for any usage constraints and legal requirements associated with redistribution and modification.
