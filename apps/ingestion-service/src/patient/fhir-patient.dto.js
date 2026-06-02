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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FhirPatientDto = void 0;
var swagger_1 = require("@nestjs/swagger");
/**
 * DTO for ingesting a raw FHIR R4 Patient resource (Synthea-compatible).
 *
 * The ENTIRE body IS the FHIR resource — no wrapper needed.
 * Synthea format: POST /api/v1/fhir/Patient
 * Body: { "resourceType": "Patient", "id": "...", "name": [...], ... }
 */
var FhirPatientDto = function () {
    var _a;
    var _resourceType_decorators;
    var _resourceType_initializers = [];
    var _resourceType_extraInitializers = [];
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    return _a = /** @class */ (function () {
            function FhirPatientDto() {
                this.resourceType = __runInitializers(this, _resourceType_initializers, void 0);
                this.id = (__runInitializers(this, _resourceType_extraInitializers), __runInitializers(this, _id_initializers, void 0));
                __runInitializers(this, _id_extraInitializers);
            }
            return FhirPatientDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _resourceType_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'FHIR R4 resourceType — must be "Patient"',
                    example: 'Patient',
                })];
            _id_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'FHIR logical ID (from Synthea)',
                    example: 'ab12cd34-ef56-7890-abcd-ef1234567890',
                    required: false,
                })];
            __esDecorate(null, null, _resourceType_decorators, { kind: "field", name: "resourceType", static: false, private: false, access: { has: function (obj) { return "resourceType" in obj; }, get: function (obj) { return obj.resourceType; }, set: function (obj, value) { obj.resourceType = value; } }, metadata: _metadata }, _resourceType_initializers, _resourceType_extraInitializers);
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.FhirPatientDto = FhirPatientDto;
