"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ═══════════════════════════════════════════════════════════════
 * Script d'Import Synthea → SmartHealth
 * ═══════════════════════════════════════════════════════════════
 *
 * Lit les fichiers FHIR R4 Bundle générés par Synthea et les importe dans :
 *   1. La table `fhir_resources` (JSONB) — TOUTES les ressources brutes
 *   2. La table `Patient` (relationnelle) — pour les analyses PySpark
 *
 * Usage : npx ts-node scripts/import-synthea.ts
 */
var client_1 = require("@prisma/client");
var fs = require("fs");
var path = require("path");
var dotenv = require("dotenv");
dotenv.config();
var prisma = new client_1.PrismaClient();
// ─── Compteurs globaux ───────────────────────────────────
var stats = {
    filesProcessed: 0,
    filesSkipped: 0,
    fhirResourcesInserted: 0,
    relationalPatientsCreated: 0,
    errors: 0,
    resourceTypes: {},
};
// ─── Extraction du nom/prénom/genre/date depuis un FHIR Patient ──
function extractPatientFields(resource) {
    var _a, _b;
    var name = ((_a = resource.name) === null || _a === void 0 ? void 0 : _a[0]) || {};
    var firstName = ((_b = name.given) === null || _b === void 0 ? void 0 : _b[0]) || 'Unknown';
    var lastName = name.family || 'Unknown';
    var gender = resource.gender || 'unknown';
    var birthDate = resource.birthDate
        ? new Date(resource.birthDate)
        : new Date('2000-01-01');
    return { firstName: firstName, lastName: lastName, gender: gender, birthDate: birthDate };
}
// ─── Traiter un seul Bundle ──────────────────────────────
function processBundle(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var fileName, raw, bundle, entries, fhirInserted, patientCreated, fhirData, _i, entries_1, entry, resource, resType, BATCH_SIZE, i, batch, patientResources, _a, patientResources_1, patientRes, _b, firstName, lastName, gender, birthDate, _c, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    fileName = path.basename(filePath);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 12, , 13]);
                    raw = fs.readFileSync(filePath, 'utf-8');
                    bundle = JSON.parse(raw);
                    if (bundle.resourceType !== 'Bundle' || !Array.isArray(bundle.entry)) {
                        console.log("   \u23ED  ".concat(fileName, " \u2014 pas un Bundle FHIR valide, ignor\u00E9."));
                        stats.filesSkipped++;
                        return [2 /*return*/];
                    }
                    entries = bundle.entry;
                    fhirInserted = 0;
                    patientCreated = 0;
                    fhirData = [];
                    for (_i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                        entry = entries_1[_i];
                        resource = entry.resource;
                        if (!resource || !resource.resourceType)
                            continue;
                        resType = resource.resourceType;
                        // Compter par type
                        stats.resourceTypes[resType] = (stats.resourceTypes[resType] || 0) + 1;
                        // Stocker en JSONB
                        fhirData.push({
                            resourceType: resType,
                            content: resource,
                        });
                    }
                    BATCH_SIZE = 500;
                    i = 0;
                    _d.label = 2;
                case 2:
                    if (!(i < fhirData.length)) return [3 /*break*/, 5];
                    batch = fhirData.slice(i, i + BATCH_SIZE);
                    return [4 /*yield*/, prisma.fhirResource.createMany({ data: batch })];
                case 3:
                    _d.sent();
                    fhirInserted += batch.length;
                    _d.label = 4;
                case 4:
                    i += BATCH_SIZE;
                    return [3 /*break*/, 2];
                case 5:
                    patientResources = entries
                        .filter(function (e) { var _a; return ((_a = e.resource) === null || _a === void 0 ? void 0 : _a.resourceType) === 'Patient'; })
                        .map(function (e) { return e.resource; });
                    _a = 0, patientResources_1 = patientResources;
                    _d.label = 6;
                case 6:
                    if (!(_a < patientResources_1.length)) return [3 /*break*/, 11];
                    patientRes = patientResources_1[_a];
                    _d.label = 7;
                case 7:
                    _d.trys.push([7, 9, , 10]);
                    _b = extractPatientFields(patientRes), firstName = _b.firstName, lastName = _b.lastName, gender = _b.gender, birthDate = _b.birthDate;
                    return [4 /*yield*/, prisma.patient.create({
                            data: { firstName: firstName, lastName: lastName, gender: gender, birthDate: birthDate },
                        })];
                case 8:
                    _d.sent();
                    patientCreated++;
                    return [3 /*break*/, 10];
                case 9:
                    _c = _d.sent();
                    return [3 /*break*/, 10];
                case 10:
                    _a++;
                    return [3 /*break*/, 6];
                case 11:
                    stats.fhirResourcesInserted += fhirInserted;
                    stats.relationalPatientsCreated += patientCreated;
                    stats.filesProcessed++;
                    console.log("   \u2705 ".concat(fileName, " \u2014 ").concat(fhirInserted, " ressources FHIR") +
                        (patientCreated > 0 ? " + ".concat(patientCreated, " patient(s) relationnel(s)") : ''));
                    return [3 /*break*/, 13];
                case 12:
                    error_1 = _d.sent();
                    console.error("   \u274C ".concat(fileName, " \u2014 Erreur : ").concat(error_1.message));
                    stats.errors++;
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    });
}
// ─── Main ────────────────────────────────────────────────
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var synthDir, files, startTime, _i, files_1, file, elapsed, sorted, _a, sorted_1, _b, type, count;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    synthDir = process.argv[2] ||
                        'C:\\Users\\Mahalahatse\\Downloads\\synthea_sample_data_fhir_latest';
                    console.log('══════════════════════════════════════════════════');
                    console.log('  📥 SmartHealth — Import Synthea FHIR R4');
                    console.log('══════════════════════════════════════════════════');
                    console.log("  \uD83D\uDCC2 Dossier source : ".concat(synthDir, "\n"));
                    if (!fs.existsSync(synthDir)) {
                        console.error("\u274C Le dossier \"".concat(synthDir, "\" n'existe pas."));
                        process.exit(1);
                    }
                    files = fs
                        .readdirSync(synthDir)
                        .filter(function (f) { return f.endsWith('.json'); })
                        .map(function (f) { return path.join(synthDir, f); });
                    console.log("  \uD83D\uDCC4 ".concat(files.length, " fichiers JSON trouv\u00E9s.\n"));
                    console.log('─────────────────────────────────────────────────');
                    startTime = Date.now();
                    _i = 0, files_1 = files;
                    _c.label = 1;
                case 1:
                    if (!(_i < files_1.length)) return [3 /*break*/, 4];
                    file = files_1[_i];
                    return [4 /*yield*/, processBundle(file)];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                    console.log('\n══════════════════════════════════════════════════');
                    console.log('  📊 RÉSUMÉ DE L\'IMPORT');
                    console.log('══════════════════════════════════════════════════');
                    console.log("  \u23F1  Dur\u00E9e totale           : ".concat(elapsed, "s"));
                    console.log("  \uD83D\uDCC4 Fichiers trait\u00E9s        : ".concat(stats.filesProcessed));
                    console.log("  \u23ED  Fichiers ignor\u00E9s        : ".concat(stats.filesSkipped));
                    console.log("  \uD83D\uDCBE Ressources FHIR (JSONB) : ".concat(stats.fhirResourcesInserted));
                    console.log("  \uD83D\uDC64 Patients relationnels   : ".concat(stats.relationalPatientsCreated));
                    console.log("  \u274C Erreurs                 : ".concat(stats.errors));
                    console.log('\n  📊 Répartition par type de ressource :');
                    sorted = Object.entries(stats.resourceTypes).sort(function (a, b) { return b[1] - a[1]; });
                    for (_a = 0, sorted_1 = sorted; _a < sorted_1.length; _a++) {
                        _b = sorted_1[_a], type = _b[0], count = _b[1];
                        console.log("     ".concat(type.padEnd(25), " : ").concat(count));
                    }
                    console.log('══════════════════════════════════════════════════\n');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('❌ Erreur fatale :', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
