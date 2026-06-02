"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientController = exports.FhirPatientController = void 0;
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var fhir_patient_dto_1 = require("./fhir-patient.dto");
var public_decorator_1 = require("../auth/public.decorator");
// ══════════════════════════════════════════════════════════
// FHIR-Native Controller — routes /fhir/* (PUBLIC — pas de JWT)
// Accessible sans token pour permettre l'ingestion Synthea
// ══════════════════════════════════════════════════════════
var FhirPatientController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('FHIR Resources'), (0, public_decorator_1.Public)(), (0, common_1.Controller)('fhir')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _createFhirPatient_decorators;
    var _findAllFhirPatients_decorators;
    var _findFhirPatient_decorators;
    var FhirPatientController = _classThis = /** @class */ (function () {
        function FhirPatientController_1(patientService) {
            this.patientService = (__runInitializers(this, _instanceExtraInitializers), patientService);
        }
        FhirPatientController_1.prototype.createFhirPatient = function (dto) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.patientService.createFhirPatient(dto)];
                });
            });
        };
        FhirPatientController_1.prototype.findAllFhirPatients = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.patientService.findAllFhirPatients()];
                });
            });
        };
        FhirPatientController_1.prototype.findFhirPatient = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.patientService.findFhirPatient(id)];
                });
            });
        };
        return FhirPatientController_1;
    }());
    __setFunctionName(_classThis, "FhirPatientController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _createFhirPatient_decorators = [(0, swagger_1.ApiOperation)({
                summary: 'Ingest a FHIR R4 Patient resource',
                description: 'Accepts any valid FHIR R4 Patient JSON directly (no wrapper). ' +
                    'Stores it in the FhirResource JSONB table and publishes a ' +
                    '"fhir.patient.created" event on RabbitMQ.',
            }), (0, swagger_1.ApiBody)({
                type: fhir_patient_dto_1.FhirPatientDto,
                examples: {
                    fhir_r4_patient: {
                        summary: 'FHIR R4 Patient',
                        description: 'Le body EST la ressource FHIR R4 directement (hôpital, labo, appareil médical, etc.).',
                        value: {
                            resourceType: 'Patient',
                            id: 'synthea-abc123',
                            name: [{ family: 'Rakoto', given: ['Jean'] }],
                            gender: 'male',
                            birthDate: '1990-01-01',
                            address: [{ use: 'home', city: 'Antananarivo', country: 'MG' }],
                            telecom: [{ system: 'phone', value: '+261 20 22 000 00' }],
                        },
                    },
                },
            }), (0, swagger_1.ApiResponse)({ status: 201, description: 'FHIR Patient stored + event emitted' }), (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid resourceType' }), (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: false, forbidNonWhitelisted: false })), (0, common_1.HttpCode)(common_1.HttpStatus.CREATED), (0, common_1.Post)('Patient')];
        _findAllFhirPatients_decorators = [(0, swagger_1.ApiOperation)({ summary: 'List all FHIR Patient resources (JSONB)' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'List of FHIR Patients' }), (0, common_1.Get)('Patient')];
        _findFhirPatient_decorators = [(0, swagger_1.ApiOperation)({ summary: 'Get a FHIR Patient by internal ID' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'FHIR Patient found' }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Not found' }), (0, common_1.Get)('Patient/:id')];
        __esDecorate(_classThis, null, _createFhirPatient_decorators, { kind: "method", name: "createFhirPatient", static: false, private: false, access: { has: function (obj) { return "createFhirPatient" in obj; }, get: function (obj) { return obj.createFhirPatient; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAllFhirPatients_decorators, { kind: "method", name: "findAllFhirPatients", static: false, private: false, access: { has: function (obj) { return "findAllFhirPatients" in obj; }, get: function (obj) { return obj.findAllFhirPatients; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findFhirPatient_decorators, { kind: "method", name: "findFhirPatient", static: false, private: false, access: { has: function (obj) { return "findFhirPatient" in obj; }, get: function (obj) { return obj.findFhirPatient; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        FhirPatientController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return FhirPatientController = _classThis;
}();
exports.FhirPatientController = FhirPatientController;
// ══════════════════════════════════════════════════════════
// Relational CRUD Controller — routes /patients/*
// ══════════════════════════════════════════════════════════
var PatientController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('patients'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.Controller)('patients')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _create_decorators;
    var _findAll_decorators;
    var _findOne_decorators;
    var _update_decorators;
    var _remove_decorators;
    var _emergencyAccess_decorators;
    var PatientController = _classThis = /** @class */ (function () {
        function PatientController_1(patientService) {
            this.patientService = (__runInitializers(this, _instanceExtraInitializers), patientService);
        }
        PatientController_1.prototype.create = function (createPatientDto, user) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.patientService.create(createPatientDto, user.userId, user.role)];
                });
            });
        };
        PatientController_1.prototype.findAll = function (user) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.patientService.findAll(user.userId, user.role)];
                });
            });
        };
        PatientController_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.patientService.findOne(id)];
                });
            });
        };
        PatientController_1.prototype.update = function (id, updatePatientDto) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.patientService.update(id, updatePatientDto)];
                });
            });
        };
        PatientController_1.prototype.remove = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.patientService.remove(id)];
                });
            });
        };
        PatientController_1.prototype.emergencyAccess = function (patientId, reason, user) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (!reason) {
                        throw new common_1.BadRequestException('La justification (reason) est obligatoire');
                    }
                    return [2 /*return*/, this.patientService.emergencyAccess(patientId, user.userId, reason)];
                });
            });
        };
        return PatientController_1;
    }());
    __setFunctionName(_classThis, "PatientController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _create_decorators = [(0, swagger_1.ApiOperation)({ summary: 'Creer un patient (assigné automatiquement au médecin connecté si applicable)' }), (0, common_1.Post)()];
        _findAll_decorators = [(0, swagger_1.ApiOperation)({ summary: 'Lister les patients (filtré pour le médecin connecté, sauf ADMIN)' }), (0, common_1.Get)()];
        _findOne_decorators = [(0, swagger_1.ApiOperation)({ summary: 'Recuperer un patient par son ID' }), (0, common_1.Get)(':id')];
        _update_decorators = [(0, swagger_1.ApiOperation)({ summary: 'Mettre a jour un patient' }), (0, common_1.Put)(':id')];
        _remove_decorators = [(0, swagger_1.ApiOperation)({ summary: 'Supprimer un patient' }), (0, common_1.Delete)(':id')];
        _emergencyAccess_decorators = [(0, swagger_1.ApiOperation)({
                summary: 'Break The Glass : Accès d\'urgence à un patient hors de la file active',
                description: 'Permet à un médecin d\'accéder à un dossier patient dont il n\'est pas le médecin traitant. Nécessite une justification.'
            }), (0, swagger_1.ApiBody)({
                schema: {
                    type: 'object',
                    properties: {
                        reason: { type: 'string', example: 'Urgence vitale suite à un accident de la route' }
                    },
                    required: ['reason']
                }
            }), (0, common_1.Post)(':id/emergency-access')];
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: function (obj) { return "create" in obj; }, get: function (obj) { return obj.create; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: function (obj) { return "findAll" in obj; }, get: function (obj) { return obj.findAll; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: function (obj) { return "findOne" in obj; }, get: function (obj) { return obj.findOne; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: function (obj) { return "update" in obj; }, get: function (obj) { return obj.update; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: function (obj) { return "remove" in obj; }, get: function (obj) { return obj.remove; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _emergencyAccess_decorators, { kind: "method", name: "emergencyAccess", static: false, private: false, access: { has: function (obj) { return "emergencyAccess" in obj; }, get: function (obj) { return obj.emergencyAccess; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PatientController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PatientController = _classThis;
}();
exports.PatientController = PatientController;
