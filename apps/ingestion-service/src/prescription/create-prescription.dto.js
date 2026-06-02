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
exports.CreatePrescriptionDto = void 0;
var class_validator_1 = require("class-validator");
var swagger_1 = require("@nestjs/swagger");
var CreatePrescriptionDto = function () {
    var _a;
    var _medications_decorators;
    var _medications_initializers = [];
    var _medications_extraInitializers = [];
    var _instructions_decorators;
    var _instructions_initializers = [];
    var _instructions_extraInitializers = [];
    var _appointmentId_decorators;
    var _appointmentId_initializers = [];
    var _appointmentId_extraInitializers = [];
    var _patientId_decorators;
    var _patientId_initializers = [];
    var _patientId_extraInitializers = [];
    var _practitionerId_decorators;
    var _practitionerId_initializers = [];
    var _practitionerId_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreatePrescriptionDto() {
                this.medications = __runInitializers(this, _medications_initializers, void 0);
                this.instructions = (__runInitializers(this, _medications_extraInitializers), __runInitializers(this, _instructions_initializers, void 0));
                this.appointmentId = (__runInitializers(this, _instructions_extraInitializers), __runInitializers(this, _appointmentId_initializers, void 0));
                this.patientId = (__runInitializers(this, _appointmentId_extraInitializers), __runInitializers(this, _patientId_initializers, void 0));
                this.practitionerId = (__runInitializers(this, _patientId_extraInitializers), __runInitializers(this, _practitionerId_initializers, void 0));
                __runInitializers(this, _practitionerId_extraInitializers);
            }
            return CreatePrescriptionDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _medications_decorators = [(0, swagger_1.ApiProperty)({ example: 'Paracetamol 500mg, Amoxicillin 1g' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _instructions_decorators = [(0, swagger_1.ApiPropertyOptional)({ example: '1 pill morning and evening for 5 days.' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _appointmentId_decorators = [(0, swagger_1.ApiPropertyOptional)({ example: 'uuid-of-the-appointment' }), (0, class_validator_1.IsUUID)(), (0, class_validator_1.IsOptional)()];
            _patientId_decorators = [(0, swagger_1.ApiProperty)({ example: 'uuid-of-the-patient' }), (0, class_validator_1.IsUUID)(), (0, class_validator_1.IsNotEmpty)()];
            _practitionerId_decorators = [(0, swagger_1.ApiProperty)({ example: 'uuid-of-the-practitioner' }), (0, class_validator_1.IsUUID)(), (0, class_validator_1.IsNotEmpty)()];
            __esDecorate(null, null, _medications_decorators, { kind: "field", name: "medications", static: false, private: false, access: { has: function (obj) { return "medications" in obj; }, get: function (obj) { return obj.medications; }, set: function (obj, value) { obj.medications = value; } }, metadata: _metadata }, _medications_initializers, _medications_extraInitializers);
            __esDecorate(null, null, _instructions_decorators, { kind: "field", name: "instructions", static: false, private: false, access: { has: function (obj) { return "instructions" in obj; }, get: function (obj) { return obj.instructions; }, set: function (obj, value) { obj.instructions = value; } }, metadata: _metadata }, _instructions_initializers, _instructions_extraInitializers);
            __esDecorate(null, null, _appointmentId_decorators, { kind: "field", name: "appointmentId", static: false, private: false, access: { has: function (obj) { return "appointmentId" in obj; }, get: function (obj) { return obj.appointmentId; }, set: function (obj, value) { obj.appointmentId = value; } }, metadata: _metadata }, _appointmentId_initializers, _appointmentId_extraInitializers);
            __esDecorate(null, null, _patientId_decorators, { kind: "field", name: "patientId", static: false, private: false, access: { has: function (obj) { return "patientId" in obj; }, get: function (obj) { return obj.patientId; }, set: function (obj, value) { obj.patientId = value; } }, metadata: _metadata }, _patientId_initializers, _patientId_extraInitializers);
            __esDecorate(null, null, _practitionerId_decorators, { kind: "field", name: "practitionerId", static: false, private: false, access: { has: function (obj) { return "practitionerId" in obj; }, get: function (obj) { return obj.practitionerId; }, set: function (obj, value) { obj.practitionerId = value; } }, metadata: _metadata }, _practitionerId_initializers, _practitionerId_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreatePrescriptionDto = CreatePrescriptionDto;
