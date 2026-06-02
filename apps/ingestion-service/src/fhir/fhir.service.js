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
exports.FhirService = void 0;
var common_1 = require("@nestjs/common");
var rxjs_1 = require("rxjs");
var FhirService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var FhirService = _classThis = /** @class */ (function () {
        function FhirService_1(httpService) {
            this.httpService = httpService;
            this.logger = new common_1.Logger(FhirService.name);
        }
        FhirService_1.prototype.syncPatient = function (patientData) {
            return __awaiter(this, void 0, void 0, function () {
                var fhirUrl, fhirPatient, response, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            fhirUrl = process.env.FHIR_SERVER_URL;
                            if (!fhirUrl)
                                return [2 /*return*/];
                            fhirPatient = {
                                resourceType: 'Patient',
                                identifier: [{ system: 'urn:uuid:smarthealth', value: patientData.id }],
                                name: [
                                    {
                                        use: 'official',
                                        family: patientData.lastName,
                                        given: [patientData.firstName],
                                    },
                                ],
                                gender: patientData.gender,
                                birthDate: patientData.birthDate.toISOString().split('T')[0],
                            };
                            this.logger.log("Syncing Patient ".concat(patientData.id, " to FHIR..."));
                            return [4 /*yield*/, (0, rxjs_1.lastValueFrom)(this.httpService.post("".concat(fhirUrl, "/Patient"), fhirPatient))];
                        case 1:
                            response = _a.sent();
                            this.logger.log("Patient synced successfully. FHIR ID: ".concat(response.data.id));
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            this.logger.error("FHIR Sync Failed: ".concat(error_1.message));
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        FhirService_1.prototype.syncPractitioner = function (practitionerData) {
            return __awaiter(this, void 0, void 0, function () {
                var fhirUrl, fhirPractitioner, response, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            fhirUrl = process.env.FHIR_SERVER_URL;
                            if (!fhirUrl)
                                return [2 /*return*/];
                            fhirPractitioner = {
                                resourceType: 'Practitioner',
                                identifier: [{ system: 'urn:uuid:smarthealth', value: practitionerData.id }],
                                name: [
                                    {
                                        use: 'official',
                                        family: practitionerData.lastName,
                                        given: [practitionerData.firstName],
                                    },
                                ],
                                telecom: [],
                            };
                            if (practitionerData.email) {
                                fhirPractitioner.telecom.push({ system: 'email', value: practitionerData.email });
                            }
                            if (practitionerData.phone) {
                                fhirPractitioner.telecom.push({ system: 'phone', value: practitionerData.phone });
                            }
                            this.logger.log("Syncing Practitioner ".concat(practitionerData.id, " to FHIR..."));
                            return [4 /*yield*/, (0, rxjs_1.lastValueFrom)(this.httpService.post("".concat(fhirUrl, "/Practitioner"), fhirPractitioner))];
                        case 1:
                            response = _a.sent();
                            this.logger.log("Practitioner synced successfully. FHIR ID: ".concat(response.data.id));
                            return [3 /*break*/, 3];
                        case 2:
                            error_2 = _a.sent();
                            this.logger.error("FHIR Sync Failed: ".concat(error_2.message));
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        FhirService_1.prototype.syncAppointment = function (appointmentData) {
            return __awaiter(this, void 0, void 0, function () {
                var fhirUrl, fhirAppointment, response, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            fhirUrl = process.env.FHIR_SERVER_URL;
                            if (!fhirUrl)
                                return [2 /*return*/];
                            fhirAppointment = {
                                resourceType: 'Appointment',
                                identifier: [{ system: 'urn:uuid:smarthealth', value: appointmentData.id }],
                                status: appointmentData.status === 'SCHEDULED' ? 'booked' : 'pending',
                                description: appointmentData.reason,
                                start: appointmentData.dateTime.toISOString(),
                            };
                            this.logger.log("Syncing Appointment ".concat(appointmentData.id, " to FHIR..."));
                            return [4 /*yield*/, (0, rxjs_1.lastValueFrom)(this.httpService.post("".concat(fhirUrl, "/Appointment"), fhirAppointment))];
                        case 1:
                            response = _a.sent();
                            this.logger.log("Appointment synced successfully. FHIR ID: ".concat(response.data.id));
                            return [3 /*break*/, 3];
                        case 2:
                            error_3 = _a.sent();
                            this.logger.error("FHIR Sync Failed: ".concat(error_3.message));
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        FhirService_1.prototype.syncPrescription = function (prescriptionData) {
            return __awaiter(this, void 0, void 0, function () {
                var fhirUrl, fhirMedicationRequest, response, error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            fhirUrl = process.env.FHIR_SERVER_URL;
                            if (!fhirUrl)
                                return [2 /*return*/];
                            fhirMedicationRequest = {
                                resourceType: 'MedicationRequest',
                                identifier: [{ system: 'urn:uuid:smarthealth', value: prescriptionData.id }],
                                status: 'active',
                                intent: 'order',
                                medicationCodeableConcept: {
                                    text: prescriptionData.medications
                                },
                                dosageInstruction: [
                                    {
                                        text: prescriptionData.instructions
                                    }
                                ],
                                authoredOn: new Date().toISOString()
                            };
                            this.logger.log("Syncing Prescription (MedicationRequest) ".concat(prescriptionData.id, " to FHIR..."));
                            return [4 /*yield*/, (0, rxjs_1.lastValueFrom)(this.httpService.post("".concat(fhirUrl, "/MedicationRequest"), fhirMedicationRequest))];
                        case 1:
                            response = _a.sent();
                            this.logger.log("Prescription synced successfully. FHIR ID: ".concat(response.data.id));
                            return [3 /*break*/, 3];
                        case 2:
                            error_4 = _a.sent();
                            this.logger.error("FHIR Sync Failed: ".concat(error_4.message));
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        return FhirService_1;
    }());
    __setFunctionName(_classThis, "FhirService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        FhirService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return FhirService = _classThis;
}();
exports.FhirService = FhirService;
