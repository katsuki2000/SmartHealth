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
exports.RabbitMQService = void 0;
var common_1 = require("@nestjs/common");
var amqp_connection_manager_1 = require("amqp-connection-manager");
var RabbitMQService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var RabbitMQService = _classThis = /** @class */ (function () {
        function RabbitMQService_1() {
            this.logger = new common_1.Logger(RabbitMQService.name);
            this.connection = null;
            this.channel = null;
            this.isReady = false;
            this.url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5673';
            this.exchange = process.env.RABBITMQ_EXCHANGE || 'smarthealth.events';
        }
        RabbitMQService_1.prototype.onModuleInit = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.connect()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        RabbitMQService_1.prototype.onModuleDestroy = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.disconnect()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        RabbitMQService_1.prototype.connect = function () {
            return __awaiter(this, void 0, void 0, function () {
                var error_1;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.connection = (0, amqp_connection_manager_1.connect)([this.url], {
                                heartbeatIntervalInSeconds: 5,
                                reconnectTimeInSeconds: 5,
                            });
                            this.connection.on('connect', function () {
                                _this.logger.log('✅ RabbitMQ connected successfully');
                                _this.isReady = true;
                            });
                            this.connection.on('disconnect', function (err) {
                                var _a;
                                _this.isReady = false;
                                _this.logger.warn("\u26A0\uFE0F  RabbitMQ disconnected: ".concat(((_a = err === null || err === void 0 ? void 0 : err.err) === null || _a === void 0 ? void 0 : _a.message) || 'unknown'));
                            });
                            this.channel = this.connection.createChannel({
                                json: true,
                                setup: function (ch) { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, ch.assertExchange(this.exchange, 'topic', { durable: true })];
                                            case 1:
                                                _a.sent();
                                                this.logger.log("\uD83D\uDCCC Exchange \"".concat(this.exchange, "\" asserted"));
                                                return [2 /*return*/];
                                        }
                                    });
                                }); },
                            });
                            return [4 /*yield*/, this.channel.waitForConnect()];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            this.logger.warn("\u26A0\uFE0F  RabbitMQ not available at startup (".concat(error_1.message, "). ") +
                                'Events will be skipped until connection is restored.');
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        RabbitMQService_1.prototype.disconnect = function () {
            return __awaiter(this, void 0, void 0, function () {
                var error_2;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, ((_a = this.channel) === null || _a === void 0 ? void 0 : _a.close())];
                        case 1:
                            _c.sent();
                            return [4 /*yield*/, ((_b = this.connection) === null || _b === void 0 ? void 0 : _b.close())];
                        case 2:
                            _c.sent();
                            this.logger.log('🔌 RabbitMQ connection closed');
                            return [3 /*break*/, 4];
                        case 3:
                            error_2 = _c.sent();
                            this.logger.warn("Could not close RabbitMQ connection: ".concat(error_2.message));
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        RabbitMQService_1.prototype.publish = function (routingKey, payload) {
            return __awaiter(this, void 0, void 0, function () {
                var error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.isReady || !this.channel) {
                                this.logger.warn("[SKIP] RabbitMQ not ready \u2014 event \"".concat(routingKey, "\" not published"));
                                return [2 /*return*/];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.channel.publish(this.exchange, routingKey, payload, {
                                    persistent: true,
                                    contentType: 'application/json',
                                    timestamp: Date.now(),
                                    appId: 'smarthealth-ingestion-service',
                                })];
                        case 2:
                            _a.sent();
                            this.logger.log("\uD83D\uDCE4 Event published: [".concat(this.exchange, "] \u2192 \"").concat(routingKey, "\""));
                            return [3 /*break*/, 4];
                        case 3:
                            error_3 = _a.sent();
                            this.logger.error("\u274C Failed to publish \"".concat(routingKey, "\": ").concat(error_3.message));
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        return RabbitMQService_1;
    }());
    __setFunctionName(_classThis, "RabbitMQService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RabbitMQService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RabbitMQService = _classThis;
}();
exports.RabbitMQService = RabbitMQService;
