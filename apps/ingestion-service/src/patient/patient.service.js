"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
exports.PatientService = void 0;
var common_1 = require("@nestjs/common");
/**
 * PatientService — deux flux de données distincts :
 *
 * 1. FHIR-Native  → POST /api/v1/fhir/Patient
 *    Le body EST le JSON FHIR R4 brut (standard HL7 FHIR R4).
 *    Accepte toute source : hôpital, laboratoire, appareil médical, dataset de recherche.
 *    Stocké tel quel en JSONB dans la table `fhir_resources`.
 *    Émet fhir.patient.created sur RabbitMQ.
 *
 * 2. Relational CRUD → POST /api/v1/patients
 *    Crée un enregistrement dans la table `Patient` relationnelle.
 *    Émet patient.created sur RabbitMQ.
 */
var PatientService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var PatientService = _classThis = /** @class */ (function () {
        function PatientService_1(prisma, eventEmitter) {
            this.prisma = prisma;
            this.eventEmitter = eventEmitter;
            this.logger = new common_1.Logger(PatientService.name);
        }
        // ─── FLUX 1 : FHIR-Native (JSONB) ─────────────────────────
        PatientService_1.prototype.createFhirPatient = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                var resource;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (body.resourceType !== 'Patient') {
                                throw new common_1.BadRequestException("Expected resourceType \"Patient\", received \"".concat(body.resourceType, "\""));
                            }
                            return [4 /*yield*/, this.prisma.fhirResource.create({
                                    data: {
                                        resourceType: 'Patient',
                                        content: body,
                                    },
                                })];
                        case 1:
                            resource = _a.sent();
                            this.logger.log("\u2705 FHIR Patient stored \u2014 internal id: ".concat(resource.id));
                            this.eventEmitter
                                .emitFhirResourceCreated({ id: resource.id, resourceType: 'Patient' })
                                .catch(function (err) { return _this.logger.warn("RabbitMQ skip: ".concat(err.message)); });
                            return [2 /*return*/, resource];
                    }
                });
            });
        };
        PatientService_1.prototype.findAllFhirPatients = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.fhirResource.findMany({
                            where: { resourceType: 'Patient' },
                            orderBy: { createdAt: 'desc' },
                        })];
                });
            });
        };
        PatientService_1.prototype.findFhirPatient = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var resource;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.fhirResource.findFirst({
                                where: { id: id, resourceType: 'Patient' },
                            })];
                        case 1:
                            resource = _a.sent();
                            if (!resource) {
                                throw new common_1.NotFoundException("FHIR Patient with ID ".concat(id, " not found"));
                            }
                            return [2 /*return*/, resource];
                    }
                });
            });
        };
        // ─── FLUX 2 : Relational CRUD (Avec Isolation) ───────────────────
        PatientService_1.prototype.create = function (data, userId, role) {
            return __awaiter(this, void 0, void 0, function () {
                var practitionerId, practitioner, newPatient;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            practitionerId = undefined;
                            if (!(role === 'DOCTOR')) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.prisma.practitioner.findUnique({ where: { userId: userId } })];
                        case 1:
                            practitioner = _a.sent();
                            if (practitioner)
                                practitionerId = practitioner.id;
                            _a.label = 2;
                        case 2: return [4 /*yield*/, this.prisma.patient.create({
                                data: __assign(__assign({}, data), { birthDate: new Date(data.birthDate), practitionerId: practitionerId }),
                            })];
                        case 3:
                            newPatient = _a.sent();
                            this.eventEmitter.emitPatientCreated(newPatient).catch(function () { });
                            return [2 /*return*/, newPatient];
                    }
                });
            });
        };
        PatientService_1.prototype.findAll = function (userId, role) {
            return __awaiter(this, void 0, void 0, function () {
                var practitioner;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // Un Admin voit tout le monde
                            if (role === 'ADMIN') {
                                return [2 /*return*/, this.prisma.patient.findMany()];
                            }
                            return [4 /*yield*/, this.prisma.practitioner.findUnique({ where: { userId: userId } })];
                        case 1:
                            practitioner = _a.sent();
                            if (!practitioner)
                                return [2 /*return*/, []];
                            return [2 /*return*/, this.prisma.patient.findMany({
                                    where: { practitionerId: practitioner.id }
                                })];
                    }
                });
            });
        };
        PatientService_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var patient;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.patient.findUnique({ where: { id: id } })];
                        case 1:
                            patient = _a.sent();
                            if (!patient) {
                                throw new common_1.NotFoundException("Patient with ID ".concat(id, " not found"));
                            }
                            return [2 /*return*/, patient];
                    }
                });
            });
        };
        PatientService_1.prototype.update = function (id, data) {
            return __awaiter(this, void 0, void 0, function () {
                var updated, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.prisma.patient.update({
                                    where: { id: id },
                                    data: __assign(__assign({}, data), (data.birthDate && { birthDate: new Date(data.birthDate) })),
                                })];
                        case 1:
                            updated = _b.sent();
                            this.eventEmitter.emitPatientUpdated(updated).catch(function () { });
                            return [2 /*return*/, updated];
                        case 2:
                            _a = _b.sent();
                            throw new common_1.NotFoundException("Patient with ID ".concat(id, " not found"));
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        PatientService_1.prototype.remove = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.prisma.patient.delete({ where: { id: id } })];
                        case 1: return [2 /*return*/, _b.sent()];
                        case 2:
                            _a = _b.sent();
                            throw new common_1.NotFoundException("Patient with ID ".concat(id, " not found"));
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        // ─── FLUX 3 : Break The Glass (Urgence) ─────────────────────
        PatientService_1.prototype.emergencyAccess = function (patientId, userId, reason) {
            return __awaiter(this, void 0, void 0, function () {
                var practitioner, patient;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.practitioner.findUnique({ where: { userId: userId } })];
                        case 1:
                            practitioner = _a.sent();
                            if (!practitioner) {
                                throw new common_1.BadRequestException('Seul un médecin peut utiliser l\'accès d\'urgence');
                            }
                            return [4 /*yield*/, this.prisma.patient.findUnique({ where: { id: patientId } })];
                        case 2:
                            patient = _a.sent();
                            if (!patient) {
                                throw new common_1.NotFoundException("Patient with ID ".concat(patientId, " not found"));
                            }
                            // Enregistrer le log d'audit obligatoirement avant de retourner les données
                            return [4 /*yield*/, this.prisma.accessLog.create({
                                    data: {
                                        practitionerId: practitioner.id,
                                        patientId: patient.id,
                                        reason: reason,
                                    }
                                })];
                        case 3:
                            // Enregistrer le log d'audit obligatoirement avant de retourner les données
                            _a.sent();
                            this.logger.warn("\u26A0\uFE0F EMERGENCY ACCESS: Practitioner ".concat(practitioner.id, " accessed Patient ").concat(patient.id, ". Reason: ").concat(reason));
                            return [2 /*return*/, patient];
                    }
                });
            });
        };
        return PatientService_1;
    }());
    __setFunctionName(_classThis, "PatientService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PatientService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PatientService = _classThis;
}();
exports.PatientService = PatientService;
