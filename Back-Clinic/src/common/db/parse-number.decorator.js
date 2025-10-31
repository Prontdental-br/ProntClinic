"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseNumber = void 0;
var sequelize_typescript_1 = require("sequelize-typescript");
function ParseNumber(target, propertyKey) {
    (0, sequelize_typescript_1.addAttributeOptions)(target, propertyKey, {
        get: function () {
            return +this.getDataValue(propertyKey);
        },
    });
}
exports.ParseNumber = ParseNumber;
