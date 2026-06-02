"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
var common_1 = require("@nestjs/common");
var class_transformer_1 = require("class-transformer");
var class_validator_1 = require("class-validator");
var Environment;
(function (Environment) {
    Environment["Development"] = "development";
    Environment["Production"] = "production";
    Environment["Test"] = "test";
})(Environment || (Environment = {}));
var EnvironmentVariables = function () {
    var _a;
    var _NODE_ENV_decorators;
    var _NODE_ENV_initializers = [];
    var _NODE_ENV_extraInitializers = [];
    var _PORT_decorators;
    var _PORT_initializers = [];
    var _PORT_extraInitializers = [];
    var _DATABASE_URL_decorators;
    var _DATABASE_URL_initializers = [];
    var _DATABASE_URL_extraInitializers = [];
    var _JWT_SECRET_decorators;
    var _JWT_SECRET_initializers = [];
    var _JWT_SECRET_extraInitializers = [];
    var _JWT_EXPIRATION_decorators;
    var _JWT_EXPIRATION_initializers = [];
    var _JWT_EXPIRATION_extraInitializers = [];
    var _FHIR_SERVER_URL_decorators;
    var _FHIR_SERVER_URL_initializers = [];
    var _FHIR_SERVER_URL_extraInitializers = [];
    var _KAFKA_BROKERS_decorators;
    var _KAFKA_BROKERS_initializers = [];
    var _KAFKA_BROKERS_extraInitializers = [];
    var _KAFKA_CLIENT_ID_decorators;
    var _KAFKA_CLIENT_ID_initializers = [];
    var _KAFKA_CLIENT_ID_extraInitializers = [];
    return _a = /** @class */ (function () {
            function EnvironmentVariables() {
                this.NODE_ENV = __runInitializers(this, _NODE_ENV_initializers, Environment.Development);
                this.PORT = (__runInitializers(this, _NODE_ENV_extraInitializers), __runInitializers(this, _PORT_initializers, 3000));
                this.DATABASE_URL = (__runInitializers(this, _PORT_extraInitializers), __runInitializers(this, _DATABASE_URL_initializers, void 0));
                this.JWT_SECRET = (__runInitializers(this, _DATABASE_URL_extraInitializers), __runInitializers(this, _JWT_SECRET_initializers, void 0));
                this.JWT_EXPIRATION = (__runInitializers(this, _JWT_SECRET_extraInitializers), __runInitializers(this, _JWT_EXPIRATION_initializers, '24h'));
                this.FHIR_SERVER_URL = (__runInitializers(this, _JWT_EXPIRATION_extraInitializers), __runInitializers(this, _FHIR_SERVER_URL_initializers, 'http://localhost:3001/fhir'));
                this.KAFKA_BROKERS = (__runInitializers(this, _FHIR_SERVER_URL_extraInitializers), __runInitializers(this, _KAFKA_BROKERS_initializers, 'localhost:9092'));
                this.KAFKA_CLIENT_ID = (__runInitializers(this, _KAFKA_BROKERS_extraInitializers), __runInitializers(this, _KAFKA_CLIENT_ID_initializers, 'smarthealth-backend'));
                __runInitializers(this, _KAFKA_CLIENT_ID_extraInitializers);
            }
            return EnvironmentVariables;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _NODE_ENV_decorators = [(0, class_validator_1.IsEnum)(Environment)];
            _PORT_decorators = [(0, class_validator_1.IsNumber)()];
            _DATABASE_URL_decorators = [(0, class_validator_1.IsString)()];
            _JWT_SECRET_decorators = [(0, class_validator_1.IsString)()];
            _JWT_EXPIRATION_decorators = [(0, class_validator_1.IsString)()];
            _FHIR_SERVER_URL_decorators = [(0, class_validator_1.IsString)()];
            _KAFKA_BROKERS_decorators = [(0, class_validator_1.IsString)()];
            _KAFKA_CLIENT_ID_decorators = [(0, class_validator_1.IsString)()];
            __esDecorate(null, null, _NODE_ENV_decorators, { kind: "field", name: "NODE_ENV", static: false, private: false, access: { has: function (obj) { return "NODE_ENV" in obj; }, get: function (obj) { return obj.NODE_ENV; }, set: function (obj, value) { obj.NODE_ENV = value; } }, metadata: _metadata }, _NODE_ENV_initializers, _NODE_ENV_extraInitializers);
            __esDecorate(null, null, _PORT_decorators, { kind: "field", name: "PORT", static: false, private: false, access: { has: function (obj) { return "PORT" in obj; }, get: function (obj) { return obj.PORT; }, set: function (obj, value) { obj.PORT = value; } }, metadata: _metadata }, _PORT_initializers, _PORT_extraInitializers);
            __esDecorate(null, null, _DATABASE_URL_decorators, { kind: "field", name: "DATABASE_URL", static: false, private: false, access: { has: function (obj) { return "DATABASE_URL" in obj; }, get: function (obj) { return obj.DATABASE_URL; }, set: function (obj, value) { obj.DATABASE_URL = value; } }, metadata: _metadata }, _DATABASE_URL_initializers, _DATABASE_URL_extraInitializers);
            __esDecorate(null, null, _JWT_SECRET_decorators, { kind: "field", name: "JWT_SECRET", static: false, private: false, access: { has: function (obj) { return "JWT_SECRET" in obj; }, get: function (obj) { return obj.JWT_SECRET; }, set: function (obj, value) { obj.JWT_SECRET = value; } }, metadata: _metadata }, _JWT_SECRET_initializers, _JWT_SECRET_extraInitializers);
            __esDecorate(null, null, _JWT_EXPIRATION_decorators, { kind: "field", name: "JWT_EXPIRATION", static: false, private: false, access: { has: function (obj) { return "JWT_EXPIRATION" in obj; }, get: function (obj) { return obj.JWT_EXPIRATION; }, set: function (obj, value) { obj.JWT_EXPIRATION = value; } }, metadata: _metadata }, _JWT_EXPIRATION_initializers, _JWT_EXPIRATION_extraInitializers);
            __esDecorate(null, null, _FHIR_SERVER_URL_decorators, { kind: "field", name: "FHIR_SERVER_URL", static: false, private: false, access: { has: function (obj) { return "FHIR_SERVER_URL" in obj; }, get: function (obj) { return obj.FHIR_SERVER_URL; }, set: function (obj, value) { obj.FHIR_SERVER_URL = value; } }, metadata: _metadata }, _FHIR_SERVER_URL_initializers, _FHIR_SERVER_URL_extraInitializers);
            __esDecorate(null, null, _KAFKA_BROKERS_decorators, { kind: "field", name: "KAFKA_BROKERS", static: false, private: false, access: { has: function (obj) { return "KAFKA_BROKERS" in obj; }, get: function (obj) { return obj.KAFKA_BROKERS; }, set: function (obj, value) { obj.KAFKA_BROKERS = value; } }, metadata: _metadata }, _KAFKA_BROKERS_initializers, _KAFKA_BROKERS_extraInitializers);
            __esDecorate(null, null, _KAFKA_CLIENT_ID_decorators, { kind: "field", name: "KAFKA_CLIENT_ID", static: false, private: false, access: { has: function (obj) { return "KAFKA_CLIENT_ID" in obj; }, get: function (obj) { return obj.KAFKA_CLIENT_ID; }, set: function (obj, value) { obj.KAFKA_CLIENT_ID = value; } }, metadata: _metadata }, _KAFKA_CLIENT_ID_initializers, _KAFKA_CLIENT_ID_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
var ConfigService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ConfigService = _classThis = /** @class */ (function () {
        function ConfigService_1() {
            this.env = (0, class_transformer_1.plainToInstance)(EnvironmentVariables, process.env, {
                enableImplicitConversion: true,
            });
            var errors = (0, class_validator_1.validateSync)(this.env, { skipMissingProperties: false });
            if (errors.length > 0) {
                throw new Error("Configuration validation failed:\n".concat(this.formatErrors(errors)));
            }
        }
        ConfigService_1.prototype.formatErrors = function (errors) {
            return errors
                .map(function (error) { return "  - ".concat(error.property, ": ").concat(Object.values(error.constraints).join(', ')); })
                .join('\n');
        };
        Object.defineProperty(ConfigService_1.prototype, "nodeEnv", {
            get: function () {
                return this.env.NODE_ENV;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ConfigService_1.prototype, "port", {
            get: function () {
                return this.env.PORT;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ConfigService_1.prototype, "databaseUrl", {
            get: function () {
                return this.env.DATABASE_URL;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ConfigService_1.prototype, "jwtSecret", {
            get: function () {
                return this.env.JWT_SECRET;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ConfigService_1.prototype, "jwtExpiration", {
            get: function () {
                return this.env.JWT_EXPIRATION;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ConfigService_1.prototype, "fhirServerUrl", {
            get: function () {
                return this.env.FHIR_SERVER_URL;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ConfigService_1.prototype, "kafkaBrokers", {
            get: function () {
                return this.env.KAFKA_BROKERS;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ConfigService_1.prototype, "kafkaClientId", {
            get: function () {
                return this.env.KAFKA_CLIENT_ID;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ConfigService_1.prototype, "isProduction", {
            get: function () {
                return this.env.NODE_ENV === Environment.Production;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ConfigService_1.prototype, "isDevelopment", {
            get: function () {
                return this.env.NODE_ENV === Environment.Development;
            },
            enumerable: false,
            configurable: true
        });
        return ConfigService_1;
    }());
    __setFunctionName(_classThis, "ConfigService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ConfigService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ConfigService = _classThis;
}();
exports.ConfigService = ConfigService;
