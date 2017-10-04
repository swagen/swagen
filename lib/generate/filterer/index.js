'use strict';

module.exports = class Filterer {
    constructor(profile) {
        this.profile = profile;
    }

    filterDefinition(definition) {
        if (!this.canFilter()) {
            return;
        }
        const serviceFilter = this.profile.filters.service;
        const modelFilter = this.profile.filters.model;

        if (serviceFilter) {
            for (const serviceName in definition.services) {
                const service = definition.services[serviceName];
                if (!serviceFilter(serviceName, { service })) {
                    delete definition.services[serviceName];
                }
            }
        }

        if (modelFilter) {
            for (const modelName in definition.models) {
                const model = definition.models[modelName];
                if (!modelFilter(modelName, {
                    modelType: 'complex',
                    model
                })) {
                    delete definition.models[modelName];
                }
            }
            for (const enumName in definition.enums) {
                const enumDef = definition.enums[enumName];
                if (!modelFilter(enumName, {
                    modelType: 'enum',
                    model: enumDef
                })) {
                    delete definition.enums[enumName];
                }
            }
        }
    }

    canFilter() {
        if (!this.profile.filters) {
            return false;
        }
        if (Object.keys(this.profile.filters).length === 0) {
            return false;
        }
        if (this.profile.filters.service && typeof this.profile.filters.service !== 'function') {
            return false;
        }
        if (this.profile.filters.model && typeof this.profile.filters.model !== 'function') {
            return false;
        }
        return true;
    }
};
