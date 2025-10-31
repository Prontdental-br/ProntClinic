"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.Account = void 0;
var sequelize_typescript_1 = require("sequelize-typescript");
var parse_number_decorator_1 = require("../../common/db/parse-number.decorator");
var user_entity_1 = require("src/users/entities/user.entity");
var clinic_entity_1 = require("src/clinics/entities/clinic.entity");
var Account = function () {
    var _classDecorators = [(0, sequelize_typescript_1.Table)({
            tableName: 'accounts',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _classSuper = sequelize_typescript_1.Model;
    var _instanceExtraInitializers = [];
    var _id_decorators;
    var _id_initializers = [];
    var _name_decorators;
    var _name_initializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _active_decorators;
    var _active_initializers = [];
    var _consultationTime_decorators;
    var _consultationTime_initializers = [];
    var _cellPhone_decorators;
    var _cellPhone_initializers = [];
    var _hourly_decorators;
    var _hourly_initializers = [];
    var _type_decorators;
    var _type_initializers = [];
    var _balancer_decorators;
    var _balancer_initializers = [];
    var _users_decorators;
    var _users_initializers = [];
    var _clinic_decorators;
    var _clinic_initializers = [];
    var Account = _classThis = /** @class */ (function (_super) {
        __extends(Account_1, _super);
        function Account_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.id = (__runInitializers(_this, _instanceExtraInitializers), __runInitializers(_this, _id_initializers, void 0));
            _this.name = __runInitializers(_this, _name_initializers, void 0);
            _this.description = __runInitializers(_this, _description_initializers, void 0);
            _this.active = __runInitializers(_this, _active_initializers, void 0);
            _this.consultationTime = __runInitializers(_this, _consultationTime_initializers, void 0);
            _this.cellPhone = __runInitializers(_this, _cellPhone_initializers, void 0);
            _this.hourly = __runInitializers(_this, _hourly_initializers, void 0);
            _this.type = __runInitializers(_this, _type_initializers, void 0);
            _this.balancer = __runInitializers(_this, _balancer_initializers, void 0);
            _this.users = __runInitializers(_this, _users_initializers, void 0);
            _this.clinic = __runInitializers(_this, _clinic_initializers, void 0);
            return _this;
        }
        return Account_1;
    }(_classSuper));
    __setFunctionName(_classThis, "Account");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _id_decorators = [sequelize_typescript_1.PrimaryKey, (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, defaultValue: sequelize_typescript_1.DataType.UUIDV4 })];
        _name_decorators = [(0, sequelize_typescript_1.Column)({ allowNull: false })];
        _description_decorators = [(0, sequelize_typescript_1.Column)({ allowNull: true })];
        _active_decorators = [(0, sequelize_typescript_1.Column)({ allowNull: true, defaultValue: true })];
        _consultationTime_decorators = [(0, sequelize_typescript_1.Column)({ field: 'consultation_time', defaultValue: 30, allowNull: true })];
        _cellPhone_decorators = [(0, sequelize_typescript_1.Column)({ field: 'cell_phone', allowNull: false })];
        _hourly_decorators = [(0, sequelize_typescript_1.Column)({ allowNull: true })];
        _type_decorators = [(0, sequelize_typescript_1.Column)({ defaultValue: 'M', allowNull: true })];
        _balancer_decorators = [parse_number_decorator_1.ParseNumber, (0, sequelize_typescript_1.Default)(0), (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: false })];
        _users_decorators = [(0, sequelize_typescript_1.HasMany)(function () { return user_entity_1.User; })];
        _clinic_decorators = [(0, sequelize_typescript_1.HasOne)(function () { return clinic_entity_1.Clinic; })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _active_decorators, { kind: "field", name: "active", static: false, private: false, access: { has: function (obj) { return "active" in obj; }, get: function (obj) { return obj.active; }, set: function (obj, value) { obj.active = value; } }, metadata: _metadata }, _active_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _consultationTime_decorators, { kind: "field", name: "consultationTime", static: false, private: false, access: { has: function (obj) { return "consultationTime" in obj; }, get: function (obj) { return obj.consultationTime; }, set: function (obj, value) { obj.consultationTime = value; } }, metadata: _metadata }, _consultationTime_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _cellPhone_decorators, { kind: "field", name: "cellPhone", static: false, private: false, access: { has: function (obj) { return "cellPhone" in obj; }, get: function (obj) { return obj.cellPhone; }, set: function (obj, value) { obj.cellPhone = value; } }, metadata: _metadata }, _cellPhone_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _hourly_decorators, { kind: "field", name: "hourly", static: false, private: false, access: { has: function (obj) { return "hourly" in obj; }, get: function (obj) { return obj.hourly; }, set: function (obj, value) { obj.hourly = value; } }, metadata: _metadata }, _hourly_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: function (obj) { return "type" in obj; }, get: function (obj) { return obj.type; }, set: function (obj, value) { obj.type = value; } }, metadata: _metadata }, _type_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _balancer_decorators, { kind: "field", name: "balancer", static: false, private: false, access: { has: function (obj) { return "balancer" in obj; }, get: function (obj) { return obj.balancer; }, set: function (obj, value) { obj.balancer = value; } }, metadata: _metadata }, _balancer_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _users_decorators, { kind: "field", name: "users", static: false, private: false, access: { has: function (obj) { return "users" in obj; }, get: function (obj) { return obj.users; }, set: function (obj, value) { obj.users = value; } }, metadata: _metadata }, _users_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _clinic_decorators, { kind: "field", name: "clinic", static: false, private: false, access: { has: function (obj) { return "clinic" in obj; }, get: function (obj) { return obj.clinic; }, set: function (obj, value) { obj.clinic = value; } }, metadata: _metadata }, _clinic_initializers, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Account = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Account = _classThis;
}();
exports.Account = Account;
