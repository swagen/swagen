# Swagen
CLI tool to generate client-side code based on Swagger definitions.

## Getting Started
> This section discusses installing the Swagen tool globally. We will also discuss installing it locally in your project to avoid global dependencies.

```sh
# Install Swagen CLI
npm install -g swagen

# Install a generator
npm install -g swagen-ng1-http

# Create configuration file (see below)

# Run swagen
swagen
```

In the root folder, create the Swagen configuration file (`swagen.config.js`):
```javascript
var petstore = {
    // Location of the Swagger JSON
    url: 'http://petstore.swagger.io/v2/swagger.json',
    
    // Location of the generated file
    output: './app/webservices/petstore.services.ts',
    
    // Generator and language to use
    generator: 'ng1-http',
    language: 'typescript',
    
    // Options to change identifiers in the generated code
    transforms: {
        serviceName: 'pascalCase',
        operationName: 'camelCase'
    },
    
    // Options specific to the generator package
    options: {
        moduleName: 'common',
        baseUrl: {
            provider: 'app.IConfig',
            variable: 'config',
            path: ['apiBaseUrl']
        },
        namespaces: {
            services: 'app.webservices',
            models: 'app.webservices'
        },
        references: [
            '../../../../typings/index.d.ts',
            '../../../../typings/app.d.ts'
        ]
};

module.exports = {
    petstore: petstore
};
```

### Further reading
[Installing Swagen locally in your project](https://github.com/angular-template/swagger-client/wiki/Installing-Swagen-locally-in-your-project)

## Generators
Swagen uses an ecosystem of generators to perform the actual code generation. Each generator is a Node package named `swagen-xxxx` where `xxxx` is the name of the generator. Examples are `swagen-ng1-http` or `swagen-dotnet`. Having a concept of generator packages allows 3rd-parties to write their own generators and plug them into the tool.

TBD: Writing a generator.

## Configuration
Swagen configuration is specified in a JavaScript file called `swagen.config.js`, typically located at the root of your project.
The `swagen.config.js` file exports a object literal, where each property represents one Swagger source that needs to be converted to code.

The available options for a single property are:
```javascript

```
TBD: Configuration file options
TBD: Writing configuration in JSON instead of JavaScript
TBD: Writing configuration in Typescript instead of JavaScript
