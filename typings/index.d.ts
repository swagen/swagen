/**
 * Represents a generator's contract.
 * All generators must export the members defined by this interface.
 */
export declare type Generator = GeneratorMode | GeneratorMode[];

/**
 * Represents a mode supported by the generator.
 */
export interface GeneratorMode {
    name: string;
    description: string;
    language: string;
    extension: string;
    prompts: any[];
    buildProfile: <TOptions>(options: TOptions, answers: {[key: string]: Object}, generalAnswers?: {[key: string]: Object}) => void;
    validateProfile: (profile: Profile) => void;
    generate: (definition: Definition, profile: Profile) => string;
}

/**
 * Represents a Swagen configuration.
 * This is the combination of the swagen.config.json and swagen.config.js files.
 */
export declare type Configuration = {[profileName: string]: Profile};

interface BaseProfile {
    /**
     * URL to retrieve the Swagger JSON.
     */
    url?: string;

    /**
     * Absolute or relative path to the file containing the Swagger JSON.
     */
    file?: string;

    /**
     * Absolute or relative path to the file where the generator output is to be written.
     */
    output: string;

    /**
     * Name of the swagen generator to use.
     */
    generator: string;

    /**
     * Optional output mode, in cases where the generator supports multiple types of output.
     * Typically, the mode is the output language, but could denote any aspect of the output.
     */
    mode?: string;

    /**
     * Debug configurations
     */
    debug?: {
        /**
         * If specified, writes an internal JSON representation of the parsed Swagger JSON to the specified file
         */
        definition: string;
    };

    /**
     * Options for filtering services and models in the generated output.
     */
    filters?: Filters;

    /**
     * Options for transforming parts of the generated output.
     */
    transforms?: Transforms;
}

/**
 * Represents a configuration profile.
 * A profile is the configuration for one swagger source and the details on how it should be used
 * to generate code.
 */
export interface Profile extends BaseProfile {
    options: any;
}

/**
 * Represents a strongly-typed configuration profile.
 * A profile is the configuration for one swagger source and the details on how it should be used
 * to generate code.
 */
export interface GeneratorProfile<TOptions> extends BaseProfile {
    /**
     * Generator-specific options.
     */
    options: TOptions;
}

export interface Filters {
    model?: (name: string, details: ModelDetails) => boolean;
    service?: (name: string, details: ServiceDetails) => boolean;
}

export interface Transforms {
    serviceName?: string | ServiceNameTransformFn | (string | ServiceNameTransformFn)[];
    operationName?: string | OperationNameTransformFn | (string | OperationNameTransformFn)[];
    parameterName?: string | ParameterNameTransformFn | (string | ParameterNameTransformFn)[];
    modelName?: string | ModelNameTransformFn | (string | ModelNameTransformFn)[];
    propertyName?: string | PropertyNameTransformFn | (string | PropertyNameTransformFn)[];
}

export declare type ServiceNameTransformFn = (serviceName: string, details: ServiceDetails) => string;
export declare type OperationNameTransformFn = (operationName: string, details: OperationDetails) => string;
export declare type ParameterNameTransformFn = (parameterName: string, details: any) => string;
export declare type ModelNameTransformFn = (modelName: string, details: ModelDetails) => string;
export declare type PropertyNameTransformFn = (propertyName: string, details: PropertyDetails) => string;

export interface ServiceDetails {
    service: ServiceDefinition;
}

export interface OperationDetails extends ServiceDetails {
    serviceName: string;
    operation: OperationDefinition;
}

export interface ParameterDetails extends OperationDetails {
    operationName: string;
    parameters: ParameterDefinition[];
}

export interface ModelDetails {
    modelType: 'complex'|'enum';
    model: ModelDefinition;
}

export interface PropertyDetails extends ModelDetails {
    modelName: string;
    property: DataType;
}

export interface Definition {
    metadata: {
        title: string;
        description: string;
        baseUrl: string;
    };
    services?: {[serviceName: string]: ServiceDefinition};
    models?: {[modelName: string]: ModelDefinition};
    enums?: {[enumName: string]: string[]};
}

export declare type ServiceDefinition = {[operationName: string]: OperationDefinition};

export interface OperationDefinition {
    path: string;
    verb: 'get'|'post'|'put'|'delete'|'patch'|'head';
    parameters: ParameterDefinition[];
    responses: {[statusCode: string]: ResponseDefinition};
    description?: string;
    description2?: string;
}

export interface ParameterDefinition {
    name: string;
    description?: string;
    type: 'path'|'query'|'body'|'header'|'formData';
    required: boolean;
    dataType: DataType;
}

export interface ResponseDefinition {
    dataType: DataType;
}

export declare type ModelDefinition = {[propertyName: string] : DataType};

export interface DataType {
    primitive?: string;
    subType?: string;
    complex?: string;
    enum?: string;
    isArray: boolean;
    required: string;
}
