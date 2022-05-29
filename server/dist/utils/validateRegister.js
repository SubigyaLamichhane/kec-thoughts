"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = void 0;
const validator_1 = __importDefault(require("validator"));
const validateRegister = (options) => {
    if (options.email.length <= 3) {
        return {
            errors: [
                {
                    field: 'email',
                    message: 'length must be greater than 2',
                },
            ],
        };
    }
    if (!validator_1.default.isEmail(options.email)) {
        return {
            errors: [
                {
                    field: 'email',
                    message: 'The email you entered is not a vaild email.',
                },
            ],
        };
    }
    if (options.username.length <= 2) {
        return {
            errors: [
                {
                    field: 'username',
                    message: 'length must be greater than 2',
                },
            ],
        };
    }
    if (validator_1.default.isEmail(options.username)) {
        return {
            errors: [
                {
                    field: 'username',
                    message: 'username cannot include a "@" sign.',
                },
            ],
        };
    }
    if (options.password.length <= 3) {
        return {
            errors: [
                {
                    field: 'password',
                    message: 'password length must be greater than 3',
                },
            ],
        };
    }
    return null;
};
exports.validateRegister = validateRegister;
//# sourceMappingURL=validateRegister.js.map