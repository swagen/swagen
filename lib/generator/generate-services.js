'use strict';

const _ = require('lodash');
const getDataType = require('./get-data-type');

function getReturnType(operation) {
    if (!operation.responses || !operation.responses.success) {
        return 'void';
    }

    let returnType = '';
    for (let successKey in operation.responses.success) {
        if (returnType) {
            returnType += ' | ';
        }
        returnType += getDataType(operation.responses.success[successKey]);
    }
    return returnType;
}

function getMethodSignature(operationName, operation) {
    let parameters = '';
    for (let p = 0; p < (operation.parameters || []).length; p++) {
        let parameter = operation.parameters[p];
        if (parameters) {
            parameters += ', '
        }
        parameters += `${parameter.name}: ${getDataType(parameter.dataType, parameter.name)}`;
    }

    let returnType = getReturnType(operation);

    let methodSig = `${operationName}(${parameters}): Observable<${returnType}>`;
    return methodSig;
}

function generateInterface(definition, serviceName, service, code) {
    code.push(`export interface I${serviceName}Client {`);

    for (let operationName in service) {
        let operation = service[operationName];
        code.push(`    ${getMethodSignature(operationName, operation)};`)
    }

    code.push('}');
}

function generateBuildUrlFunction(code) {
    code.push(
        `function buildServiceUrl(baseUrl: string, resourceUrl: string, queryParams?: {[name: string]: string}): string {`,
        `    let url: string = baseUrl;`,
        `    let baseUrlSlash: boolean = url[url.length - 1] === '/';`,
        `    let resourceUrlSlash: boolean = resourceUrl[0] === '/';`,
        `    if (!baseUrlSlash && !resourceUrlSlash) {`,
        `        url += '/';`,
        `    } else if (baseUrlSlash && resourceUrlSlash) {`,
        `        url = url.substr(0, url.length - 1);`,
        `    }`,
        `    url += resourceUrl;`,
        ``,
        `    if (queryParams) {`,
        `        let isFirst: boolean = true;`,
        `        for (let p in queryParams) {`,
        `            if (queryParams.hasOwnProperty(p) && queryParams[p]) {`,
        `                let separator: string = isFirst ? '?' : '&';`,
        `                url += separator + p + '=' + queryParams[p];`,
        `                isFirst = false;`,
        `            }`,
        `        }`,
        `    }`,
        ``,
        `    return url;`,
        `}`
    );
}

function generateImplementation(definition, serviceName, service, code) {
    code.push(
        `@Injectable()`,
        `export class ${serviceName}Client implements I${serviceName}Client {`,
        `    private baseUrl: string;`,
        ``,
        `    constructor(`,
        `        @Inject(Http) private http: Http,`,
        `        @Optional @Inject(API_BASE_URL) baseUrl?: string`,
        `    ) {`,
        `        this.baseUrl = baseUrl || '${definition.metadata.baseUrl}';`,
        `    }`,
        ``
    );

    for (let operationName in service) {
        let operation = service[operationName];

        code.push(
            `    /**`,
            `     * ${operation.description || '<No description>'}`,
            `     */`,
            `    public ${getMethodSignature(operationName, operation)} {`
        );

        let requiredParams = (operation.parameters || []).filter(p => !!p.required);
        for (let i = 0; i < requiredParams.length; i++) {
            let requiredParam = requiredParams[i];
            code.push(
                `        if (${requiredParam.name} == undefined || ${requiredParam.name} == null) {`,
                `            throw 'The parameter \\'${requiredParam.name}\\' must be defined.';`,
                `        }`
            )
        }

        let pathParams = (operation.parameters || []).filter(p => p.type === 'path');
        let hasPathParams = pathParams.length > 0;
        code.push(`        let resourceUrl: string = '${operation.path}'${hasPathParams ? '' : ';'}`);
        for (let i = 0; i < pathParams.length; i++) {
            let isLastParam = i === pathParams.length - 1;
            code.push(`            .replace('{${pathParams[i].name}}', encodeURIComponent('' + ${pathParams[i].name}))${isLastParam ? ';' : ''}`);
        }

        let queryParams = (operation.parameters || []).filter(p => p.type === 'query');
        let hasQueryParams = queryParams.length > 0;
        if (hasQueryParams) {
            code.push(`        let queryParams: {[key: string]: string} = {`);
            for (let i = 0; i < queryParams.length; i++) {
                let isLastParam = i === queryParams.length - 1;
                code.push(`            ${queryParams[i].name}: encodeURIComponent('' + ${queryParams[i].name})${isLastParam ? '' : ','}`);
            }
            code.push(`        };`)
        }

        let bodyParam = (operation.parameters || []).find(p => p.type === 'body');
        let content = bodyParam ? `JSON.stringify(${bodyParam.name})` : `''`;
        let returnType = getReturnType(operation);
        code.push(
            `        const content: string = ${content};`,
            `        return this.http.request(buildServiceUrl(this.baseUrl, resourceUrl, ${hasQueryParams ? 'queryParams' : 'undefined'}), {`,
            `            body: content,`,
            `            method: '${operation.verb}'`,
            `        }).map((response: Response) => {`,
            `            return this.__process_${operationName}(response);`,
            `        }).catch((response: any, caught: any) => {`,
            `            if (response instanceof Response) {`,
            `                try {`,
            `                    return Observable.of(this.__process_${operationName}(response));`,
            `                } catch (e) {`,
            `                    return <Observable<${returnType}>><any>Observable.throw(e);`,
            `                }`,
            `            } else {`,
            `                return <Observable<${returnType}>><any>Observable.throw(response);`,
            `            }`,
            `        });`
        );

        code.push(`    }`);

        code.push('');

        code.push(
            `    private __process_${operationName}(response: Response): ${returnType} {`,
            `        const data: string = response.text();`,
            `        const status: number = response.status;`
        );
        if (!operation.responses || !operation.responses.success) {
            code.push(
                `        if (status >= 200 && status < 300) {`,
                `            return;`,
                `        }`
            );
        } else {
            for (let statusKey in operation.responses.success) {
                let successType = getDataType(operation.responses.success[statusKey], `${operationName}Result`);
                code.push(
                    `        if (status === ${statusKey}) {`,
                    `            let result: ${successType} = data === '' ? undefined : <${successType}>JSON.parse(data);`,
                    `            return result;`,
                    `        }`
                )
            }
        }
        code.push(
            `        throw 'error_no_callback_for_status' + status;`,
            `    }`
        );

        code.push('');
    }

    code.push(`}`);
}

module.exports = function(definition, code) {
    for (let serviceName in definition.services) {
        let service = definition.services[serviceName];
        let transformedServiceName = _.upperFirst(_.camelCase(serviceName));
        generateInterface(definition, transformedServiceName, service, code);
        code.push('');
        generateImplementation(definition, transformedServiceName, service, code);
        code.push('');
    }
    generateBuildUrlFunction(code);
}
