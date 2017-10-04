# Swagen
Swagen is a pluggable command-line tool to generate code from [Swagger](https://swagger.io/) JSON definitions.

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
Swagen is a pluggable tool that uses generators plug-ins to perform the actual code generation. Each generator is a Node package following a naming convention of `swagen-xxxx` where `xxxx` is the name of the generator. Examples are `swagen-angular` or `swagen-dotnet-httpclient`. Having a concept of generator packages allows 3rd-parties to write their own generators and plug them into the tool.

### Further reading
TBD: Writing a generator package.

TBD: Writing local generators

## Configuration
Swagen uses configuration to specify how to generate files from one or more Swagger sources. The configuration file is called `swagen.config.json` and should be located in the same directory where the `swagen` command is run from.

You can create a configuration file by running the following command:
```sh
swagen init
```
This is an interactive command and ask you a series of questions before generating a `swagen.config.json` file in the current directory. In case a `swagen.config.json` file already exists in the current directory, it will add a new configuration to the existing file. A single `swagen.config.json` file can contain multiple configurations, each representing a separate Swagger source.

### Further reading
TBD: swagen.config.json schema and general options

[Advance configuration](https://github.com/swagen/swagen/wiki/Advanced-configuration)

TBD: Writing configuration in Typescript instead of JavaScript
