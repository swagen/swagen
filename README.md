# Swagen
CLI tool to generate client-side code based on Swagger definitions.

## Getting Started
> This section discusses installing the Swagen tool globally. We will also discuss installing it locally in your project to avoid global dependencies.

Install the Swagen CLI tool globally
```sh
npm install -g swagen
```

Install the generator(s) you wish to use. In this section, we'll use the `swagen-ng1-http` generator which generates Typescript code for the Angular 1.x `$http` service.
```sh
npm install -g swagen-ng1-http
```

In the root folder, create the Swagen configuration:
```javascript
var petstore = {
    url: 'http://petstore.swagger.io/v2/swagger.json',
    output: './app/webservices/petstore.services.ts',
    generator: 'ng1-http',
    language: 'typescript',
    transforms: {
        serviceName: 'pascalCase',
        operationName: 'camelCase'
    },
    options: {
        moduleName: 'common',
        baseUrl: {
            provider: 'app.IConfig',
            variable: 'config',
            path: ['apiBaseUrl']
        },
        namespaces: {
            services: 'common.webservices',
            models: 'common.webservices'
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

## Generators
Swagen uses an ecosystem of generators to perform the actual code generation. Each generator is a Node package named `swagen-xxxx` where `xxxx` is the name of the generator. Examples are `swagen-ng1-http` or `swagen-dotnet`. Having a concept of generator packages allows 3rd-parties to write their own generators and plug them into the tool.

TBD: Writing a generator.

## Configuration
Swagen configuration is specified in a JavaScript file called `swagen.config.js`, typically located at the root of your project.
