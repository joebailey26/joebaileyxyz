<h1 align="center">Welcome to the Joe Bailey Website repo</h1>
<p align="center">This website showcases Joe Bailey's work.</p>
<p align="center"><a href="https://joebailey.xyz">Live Site</a> <a href="https://github.com/joebailey26/joebaileyxyz">GitHub Repo</a></p>
<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-1-blue.svg?cacheSeconds=2592000" />
  <a href="https://twitter.com/joebaileyphoto" target="_blank">
    <img alt="Twitter: joebaileyphoto" src="https://img.shields.io/twitter/follow/joebaileyphoto.svg?style=social" />
  </a>
  <a href="https://app.netlify.com/sites/heuristic-bell-6e94b3/deploys">
    <img alt="Netlify Status" src="https://api.netlify.com/api/v1/badges/0f6be2d7-6002-4d40-870b-9f3ad6ba7c49/deploy-status">
  </a>
</p>

## Install

```sh
yarn install
```

## Development

```sh
yarn start
```

## Build

```sh
yarn build
```

## Visual Style Guide

![Style Guide](docs/img/StyleGuide.jpg)

## Coding Style Guide

### HTML5 Doctype

```sh
<!DOCTYPE html>
```

### HTML Lang Attribute

```sh
<html lang=”en-GB”>
```

### Syntax

HTML will be indented consistently by a tab character or 4 spaces.
Nested elements will be indented once.
Self closing elements need a trailing slash such as the ```<img />``` element

#### Attributes

Attributes and elements should always be lowercase
Double quotes should always be used, never single

##### Attribute Order

HTML attributes should come in this particular order for easier reading of code.
```id```
```class```
```data-*```
```for | type | href | src```

### HTML Comments

Comments are to be used every time a div is closed. They will be on the same line as the closing ```</div>``` tag. Example below:

```sh
<div id=”foo” class=”bar”>
…
</div> <!-- #foo .bar -->
```

### HTML5 Tags

HTML5 tags such as ```<header>``` and ```<footer>``` are preferred over standard ```<div>``` tags.

## Branching Strategy

Master branch is for tested code and is deployed directly to **Netlify**. Do not push anything to master. Always create pull requests and test code.

Dev branch is for development work on the site. Should always contain close to production ready code requiring minimal commits to get to production status.

Branches should be created for big projects requiring more than one commit such as adding a new page. They should be titled the project name and then a pull request should be made with dev in order to test it.

## Testing

Use a local environment if possible otherwise use **Browserstack** to manually test the site by navigating to all pages and performing all actions

### List of browsers we support

* Last 2 versions of **Mozilla Firefox**
* Last 2 versions of **Microsoft Edge**
* Last 2 versions of **Google Chrome**
* Last 2 versions of **Opera**
* Last 1 versions of **Safari**
* Last 1 versions of **iOS Safari**
* Last 2 versions of **Chrome for Android**
* Last 2 versions of **Firefox for Android**
* Last 1 versions of **Samsung Internet**

## Author

👤 **Joe Bailey**

* Website: [joebailey.xyz](joebailey.xyz)
* Twitter: [@joebaileyphoto](https://twitter.com/joebaileyphoto)
* Github: [@joebailey26](https://github.com/joebailey26)
* LinkedIn: [@joe-bailey-b68b17171](https://linkedin.com/in/joe-bailey-b68b17171)
