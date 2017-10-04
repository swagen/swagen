declare namespace swagen {
    /**
     * Represents a generator's contract.
     * All generators must export the members defined by this interface.
     */
    interface IGenerator<TOptions> {
        supportedModes: SupportedMode<TOptions>[];
        generate(definition: Definition, profile: Profile<TOptions>): string;
        getDefaultOptions(mode: string): TOptions;
        validateProfile(profile: Profile<TOptions>): void;
    }

    /**
     * Represents a mode supported by the generator.
     */
    interface SupportedMode<TOptions> {
        name: string;
        description: string;
        language: string;
        extension: string;
        prompts: any[];
        configBuilderFn: (options: TOptions, answers: {[key: string]: Object}, generalAnswers?: {[key: string]: Object}) => void;
    }

    /**
     * Represents a configuration profile.
     */
    interface Profile<TOptions> {
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

        /**
         * Generator-specific options.
         */
        options: TOptions;
    }

    interface Filters {
        model: (name: string, details: ModelDetails) => boolean;
        service: (name: string, details: ServiceDetails) => boolean;
    }

    interface Transforms {
        serviceName?: string | ServiceNameTransformFn | (string | ServiceNameTransformFn)[];
        operationName?: string | OperationNameTransformFn | (string | OperationNameTransformFn)[];
        parameterName?: string | ParameterNameTransformFn | (string | ParameterNameTransformFn)[];
        modelName?: string | ModelNameTransformFn | (string | ModelNameTransformFn)[];
        propertyName?: string | PropertyNameTransformFn | (string | PropertyNameTransformFn)[];
    }

    type ServiceNameTransformFn = (serviceName: string, details: ServiceDetails) => string;
    type OperationNameTransformFn = (operationName: string, details: OperationDetails) => string;
    type ParameterNameTransformFn = (parameterName: string, details: any) => string;
    type ModelNameTransformFn = (modelName: string, details: ModelDetails) => string;
    type PropertyNameTransformFn = (propertyName: string, details: PropertyDetails) => string;

    interface ServiceDetails {
        service: ServiceDefinition;
    }

    interface OperationDetails extends ServiceDetails {
        serviceName: string;
        operation: OperationDefinition;
    }

    interface ParameterDetails extends OperationDetails {
        operationName: string;
        parameters: ParameterDefinition[];
    }

    interface ModelDetails {
        modelType: 'complex'|'enum';
        model: ModelDefinition;
    }

    interface PropertyDetails extends ModelDetails {
        modelName: string;
        property: PropertyDefinition;
    }

    interface Definition {
        metadata: {
            title: string;
            description: string;
            baseUrl: string;
        };
        services?: {[serviceName: string]: ServiceDefinition};
        models?: {[modelName: string]: ModelDefinition};
        enums?: {[enumName: string]: string[]};
    }

    type ServiceDefinition = {[operationName: string]: OperationDefinition};

    interface OperationDefinition {
        path: string;
        verb: 'get'|'post'|'put'|'delete'|'patch'|'head';
        parameters: ParameterDefinition[];
        responses: {[statusCode: string]: ResponseDefinition};
        description?: string;
        description2?: string;
    }

    interface ParameterDefinition {
        name: string;
        description?: string;
        type: 'path'|'query'|'body'|'header'|'formData';
        required: boolean;
        dataType: DataType;
    }

    interface ResponseDefinition {
        dataType: DataType;
    }

    type ModelDefinition = {[propertyName: string] : DataType};

    interface DataType {
        primitive?: string;
        subType?: string;
        complex?: string;
        enum?: string;
        isArray: boolean;
        required: string;
    }
}
