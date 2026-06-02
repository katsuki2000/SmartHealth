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
exports.AnalyticsService = void 0;
var common_1 = require("@nestjs/common");
/**
 * AnalyticsService
 *
 * Lit les données calculées par le moteur Big Data (PySpark)
 * depuis la table "AnalyticsSummary" en PostgreSQL.
 *
 * Cette table est écrite par Spark via JDBC (mode overwrite),
 * indépendamment du schéma Prisma → on utilise $queryRawUnsafe.
 */
var AnalyticsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AnalyticsService = _classThis = /** @class */ (function () {
        function AnalyticsService_1(prisma) {
            this.prisma = prisma;
            this.logger = new common_1.Logger(AnalyticsService.name);
        }
        AnalyticsService_1.prototype.getAnalyticsSummary = function () {
            return __awaiter(this, void 0, void 0, function () {
                var rows, row, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.prisma.$queryRawUnsafe('SELECT * FROM "AnalyticsSummary" ORDER BY computed_at DESC LIMIT 1')];
                        case 1:
                            rows = _a.sent();
                            if (!rows || rows.length === 0) {
                                this.logger.warn('Table "AnalyticsSummary" est vide. Lancez le script PySpark.');
                                return [2 /*return*/, {
                                        totalPatients: 0,
                                        urgentAppointments: 0,
                                        totalPractitioners: 0,
                                        averageAge: 0,
                                        totalFhirResources: 0,
                                        totalConditions: 0,
                                        totalEncounters: 0,
                                        totalObservations: 0,
                                        topPathology: null,
                                        topPathologyCount: 0,
                                        computedAt: null,
                                        source: 'analysis-engine (PySpark)',
                                        status: 'NO_DATA',
                                    }];
                            }
                            row = rows[0];
                            this.logger.log("\uD83D\uDCCA Analytics charg\u00E9es (calcul\u00E9es \u00E0 ".concat(row.computed_at, ")"));
                            return [2 /*return*/, {
                                    totalPatients: Number(row.total_patients),
                                    urgentAppointments: Number(row.urgent_appointments),
                                    totalPractitioners: Number(row.total_practitioners),
                                    averageAge: Number(row.average_age),
                                    totalFhirResources: Number(row.total_fhir_resources || 0),
                                    totalConditions: Number(row.total_conditions || 0),
                                    totalEncounters: Number(row.total_encounters || 0),
                                    totalObservations: Number(row.total_observations || 0),
                                    topPathology: row.top_pathology || null,
                                    topPathologyCount: Number(row.top_pathology_count || 0),
                                    computedAt: row.computed_at,
                                    source: 'analysis-engine (PySpark)',
                                    status: 'OK',
                                }];
                        case 2:
                            error_1 = _a.sent();
                            // La table n'existe pas encore (PySpark n'a jamais été lancé)
                            if (error_1.code === '42P01') {
                                this.logger.warn('Table "AnalyticsSummary" introuvable. Lancez: python src/pathology_by_age.py');
                                return [2 /*return*/, {
                                        totalPatients: 0,
                                        urgentAppointments: 0,
                                        totalPractitioners: 0,
                                        averageAge: 0,
                                        totalFhirResources: 0,
                                        totalConditions: 0,
                                        totalEncounters: 0,
                                        totalObservations: 0,
                                        topPathology: null,
                                        topPathologyCount: 0,
                                        computedAt: null,
                                        source: 'analysis-engine (PySpark)',
                                        status: 'TABLE_NOT_FOUND',
                                        message: 'Exécutez le script PySpark pour générer les statistiques.',
                                    }];
                            }
                            throw error_1;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Données pour les graphiques — extraites directement depuis FHIR JSONB.
         * Retourne les distributions pour les charts frontend.
         */
        AnalyticsService_1.prototype.getChartsData = function () {
            return __awaiter(this, void 0, void 0, function () {
                var genderDist, ageDist, topConditions, resourceDist, encounterClasses, topObservations, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 7, , 8]);
                            return [4 /*yield*/, this.prisma.$queryRawUnsafe("\n        SELECT gender, COUNT(*)::int as count\n        FROM \"Patient\"\n        GROUP BY gender ORDER BY count DESC\n      ")];
                        case 1:
                            genderDist = _a.sent();
                            return [4 /*yield*/, this.prisma.$queryRawUnsafe("\n        SELECT\n          CASE\n            WHEN EXTRACT(YEAR FROM age(NOW(), \"birthDate\")) < 18 THEN '0-17'\n            WHEN EXTRACT(YEAR FROM age(NOW(), \"birthDate\")) < 30 THEN '18-29'\n            WHEN EXTRACT(YEAR FROM age(NOW(), \"birthDate\")) < 45 THEN '30-44'\n            WHEN EXTRACT(YEAR FROM age(NOW(), \"birthDate\")) < 60 THEN '45-59'\n            WHEN EXTRACT(YEAR FROM age(NOW(), \"birthDate\")) < 75 THEN '60-74'\n            ELSE '75+'\n          END as age_group,\n          COUNT(*)::int as count\n        FROM \"Patient\"\n        GROUP BY age_group ORDER BY age_group\n      ")];
                        case 2:
                            ageDist = _a.sent();
                            return [4 /*yield*/, this.prisma.$queryRawUnsafe("\n        SELECT\n          content->>'resourceType' as resource_type,\n          content->'code'->'coding'->0->>'display' as name,\n          COUNT(*)::int as count\n        FROM fhir_resources\n        WHERE \"resourceType\" = 'Condition'\n          AND content->'code'->'coding'->0->>'display' IS NOT NULL\n        GROUP BY resource_type, name\n        ORDER BY count DESC\n        LIMIT 10\n      ")];
                        case 3:
                            topConditions = _a.sent();
                            return [4 /*yield*/, this.prisma.$queryRawUnsafe("\n        SELECT \"resourceType\" as resource_type, COUNT(*)::int as count\n        FROM fhir_resources\n        GROUP BY \"resourceType\"\n        ORDER BY count DESC\n        LIMIT 10\n      ")];
                        case 4:
                            resourceDist = _a.sent();
                            return [4 /*yield*/, this.prisma.$queryRawUnsafe("\n        SELECT\n          content->'class'->>'code' as class_code,\n          COUNT(*)::int as count\n        FROM fhir_resources\n        WHERE \"resourceType\" = 'Encounter'\n        GROUP BY class_code\n        ORDER BY count DESC\n      ")];
                        case 5:
                            encounterClasses = _a.sent();
                            return [4 /*yield*/, this.prisma.$queryRawUnsafe("\n        SELECT\n          content->'code'->'coding'->0->>'display' as name,\n          COUNT(*)::int as count,\n          ROUND(AVG((content->'valueQuantity'->>'value')::numeric), 2) as avg_value,\n          content->'valueQuantity'->>'unit' as unit\n        FROM fhir_resources\n        WHERE \"resourceType\" = 'Observation'\n          AND content->'valueQuantity'->>'value' IS NOT NULL\n        GROUP BY name, unit\n        ORDER BY count DESC\n        LIMIT 8\n      ")];
                        case 6:
                            topObservations = _a.sent();
                            return [2 /*return*/, {
                                    genderDistribution: genderDist,
                                    ageDistribution: ageDist,
                                    topConditions: topConditions.map(function (c) { return ({ name: c.name, count: c.count }); }),
                                    resourceDistribution: resourceDist.map(function (r) { return ({ name: r.resource_type, count: r.count }); }),
                                    encounterClasses: encounterClasses.map(function (e) { return ({ name: e.class_code, count: e.count }); }),
                                    topObservations: topObservations.map(function (o) { return ({
                                        name: o.name,
                                        count: o.count,
                                        avgValue: Number(o.avg_value),
                                        unit: o.unit,
                                    }); }),
                                    source: 'FHIR JSONB (PostgreSQL)',
                                    status: 'OK',
                                }];
                        case 7:
                            error_2 = _a.sent();
                            this.logger.error("Charts data error: ".concat(error_2.message));
                            return [2 /*return*/, { status: 'ERROR', message: error_2.message }];
                        case 8: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Statistiques en TEMPS RÉEL — requêtes directes sur les tables relationnelles.
         * Contrairement à getAnalyticsSummary() qui lit le cache PySpark,
         * cette méthode calcule les métriques à la volée.
         */
        AnalyticsService_1.prototype.getLiveStats = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, totalPatients, urgentAppointments, totalPractitioners, avgAgeResult, averageAge;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, Promise.all([
                                this.prisma.patient.count(),
                                this.prisma.appointment.count({ where: { status: 'EMERGENCY' } }),
                                this.prisma.practitioner.count(),
                                this.prisma.$queryRawUnsafe("SELECT COALESCE(AVG(EXTRACT(YEAR FROM age(NOW(), \"birthDate\"))), 0) as avg_age FROM \"Patient\""),
                            ])];
                        case 1:
                            _a = _c.sent(), totalPatients = _a[0], urgentAppointments = _a[1], totalPractitioners = _a[2], avgAgeResult = _a[3];
                            averageAge = Math.round(Number(((_b = avgAgeResult[0]) === null || _b === void 0 ? void 0 : _b.avg_age) || 0));
                            return [2 /*return*/, {
                                    totalPatients: totalPatients,
                                    urgentAppointments: urgentAppointments,
                                    totalPractitioners: totalPractitioners,
                                    averageAge: averageAge,
                                    computedAt: new Date().toISOString(),
                                    source: 'live (PostgreSQL direct)',
                                    status: 'OK',
                                }];
                    }
                });
            });
        };
        return AnalyticsService_1;
    }());
    __setFunctionName(_classThis, "AnalyticsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AnalyticsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AnalyticsService = _classThis;
}();
exports.AnalyticsService = AnalyticsService;
