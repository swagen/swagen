# Swagen

[![Build Status](https://travis-ci.org/swagen/swagen.svg?branch=master)](https://travis-ci.org/swagen/swagen)
[![Greenkeeper badge](https://badges.greenkeeper.io/swagen/swagen.svg)](https://greenkeeper.io/)

Swagen is a pluggable command-line tool to generate code and documentation from [Swagger](https://swagger.io/) definitions.

## Getting Started
> This section discusses installing the Swagen tool globally. We will also discuss installing it locally in your project to avoid global dependencies.

```sh
# Install Swagen CLI
npm install -g swagen

# Install a generator
npm install -g swagen-angular

# Create configuration file
# This will ask you some questions and create a swagen.config.json file in the local directory.
swagen init --generator angular --mode ng-typescript

# Generate the code
swagen
```

### Further reading
[Command-line reference](https://github.com/swagen/swagen/wiki/Command-line-reference)

[Installing Swagen locally in your project](https://github.com/angular-template/swagger-client/wiki/Installing-Swagen-locally-in-your-project)

## Generators
Swagen is a pluggable tool that uses generator plug-ins to perform the actual code generation. Each generator is a Node package following a naming convention of `swagen-xxxx` where `xxxx` is the name of the generator. Examples are `swagen-angular` or `swagen-dotnet-httpclient`. Having a concept of generator packages allows 3rd-parties to write their own generators and plug them into the tool.

### Further reading
[Writing a generator package](https://github.com/swagen/swagen/wiki/Writing-a-generator-package)

If you want to write a custom generator specific to your project, and not have to publish it, Swagen also support local generators.

[Writing local generators](https://github.com/swagen/swagen/wiki/Writing-local-generators)

## Configuration
Swagen uses configuration to specify how to generate files from one or more Swagger sources. The configuration file is called `swagen.config.json` and should be located in the same directory where the `swagen` command is run from.

You can create a configuration file by running the following command:
```sh
swagen init
```
This is an interactive command and ask you a series of questions before generating a `swagen.config.json` file in the current directory. In case a `swagen.config.json` file already exists in the current directory, it will add a new configuration to the existing file. A single `swagen.config.json` file can contain multiple configurations, each representing a separate Swagger source.

### Further reading
[Swagen configuration schema and general options](https://github.com/swagen/swagen/wiki/Swagen-configuration-schema-and-general-options)tio

[Advance configuration](https://github.com/swagen/swagen/wiki/Advanced-configuration)

[Writing configuration in Typescript instead of JavaScript](https://github.com/swagen/swagen/wiki/Writing-configuration-in-Typescript)

## Documentation
Swagen documentation can be found in the [wiki](https://github.com/swagen/swagen/wiki).
