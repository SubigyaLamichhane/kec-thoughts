"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = exports.LoginInput = void 0;
const argon2_1 = __importDefault(require("argon2"));
const type_graphql_1 = require("type-graphql");
const uuid_1 = require("uuid");
const validator_1 = __importDefault(require("validator"));
const constants_1 = require("../constants");
const User_1 = require("../entities/User");
const sendEmail_1 = require("../utils/sendEmail");
const validateRegister_1 = require("../utils/validateRegister");
const UsernamePasswordInput_1 = require("./UsernamePasswordInput");
let LoginInput = class LoginInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], LoginInput.prototype, "usernameOrEmail", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], LoginInput.prototype, "password", void 0);
LoginInput = __decorate([
    (0, type_graphql_1.InputType)()
], LoginInput);
exports.LoginInput = LoginInput;
let FieldError = class FieldError {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
FieldError = __decorate([
    (0, type_graphql_1.ObjectType)()
], FieldError);
let UserResponse = class UserResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => User_1.User, { nullable: true }),
    __metadata("design:type", User_1.User)
], UserResponse.prototype, "user", void 0);
UserResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], UserResponse);
let ForgotResponse = class ForgotResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], ForgotResponse.prototype, "searched", void 0);
ForgotResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], ForgotResponse);
let UserResolver = class UserResolver {
    email(user, { req }) {
        if (req.session.userId === user.id) {
            return user.email;
        }
        return '';
    }
    async changePassword(token, newPassword, { redis, req }) {
        if (newPassword.length <= 3) {
            return {
                errors: [
                    {
                        field: 'newpassword',
                        message: 'password length must be greater than 3',
                    },
                ],
            };
        }
        const key = constants_1.FORGET_PASSWORD_INDEX + token;
        const userId = await redis.get(key);
        if (!userId) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: 'The token has expired',
                    },
                ],
            };
        }
        const user = await User_1.User.findOne({ where: { id: parseInt(userId) } });
        if (!user) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: 'User no longer exists.',
                    },
                ],
            };
        }
        await User_1.User.update({ id: parseInt(userId) }, {
            password: await argon2_1.default.hash(newPassword),
        });
        await redis.del(key);
        req.session.userId = user.id;
        return { user };
    }
    async forgotPassword(email, { redis }) {
        const user = await User_1.User.findOne({ where: { email } });
        if (!user) {
            return {
                searched: true,
            };
        }
        const token = (0, uuid_1.v4)();
        await redis.set(constants_1.FORGET_PASSWORD_INDEX + token, user.id, 'EX', 1000 * 60 * 60 * 24);
        const html = `<a href="http://localhost:3000/change-password/${token}">resetpassword</a>`;
        await (0, sendEmail_1.sendEmail)(email, html);
        return {
            searched: true,
        };
    }
    async me({ req }) {
        if (!req.session.userId) {
            return null;
        }
        const user = await User_1.User.findOne({ where: { id: req.session.userId } });
        if ((user === null || user === void 0 ? void 0 : user.isAdmin) === null) {
            user.isAdmin = false;
        }
        return user;
    }
    async register(options, { req }) {
        const hashedPassword = await argon2_1.default.hash(options.password);
        const response = (0, validateRegister_1.validateRegister)(options);
        if (response) {
            return response;
        }
        let user;
        try {
            user = await User_1.User.create({
                username: options.username.toLowerCase(),
                password: hashedPassword,
                email: options.email,
            }).save();
        }
        catch (err) {
            if (err.detail.includes('already exists')) {
                if (err.detail.includes('(email)=')) {
                    return {
                        errors: [
                            {
                                field: 'email',
                                message: 'Email already exists.',
                            },
                        ],
                    };
                }
                if (err.detail.includes('(username)=')) {
                    return {
                        errors: [
                            {
                                field: 'username',
                                message: 'Username already exists.',
                            },
                        ],
                    };
                }
            }
        }
        if (!user) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'Internal Server Error.',
                    },
                ],
            };
        }
        if (user.isAdmin === null) {
            user.isAdmin = false;
        }
        req.session.userId = user.id;
        return {
            user,
        };
    }
    async logout({ req, res }) {
        return new Promise((resolve) => req.session.destroy((err) => {
            res.clearCookie(constants_1.COOKIE_NAME);
            if (err) {
                console.log(err);
                resolve(false);
                return;
            }
            resolve(true);
        }));
    }
    async login(options, { req }) {
        const user = await User_1.User.findOne({
            where: validator_1.default.isEmail(options.usernameOrEmail)
                ? {
                    email: options.usernameOrEmail,
                }
                : {
                    username: options.usernameOrEmail,
                },
        });
        if (!user) {
            if (validator_1.default.isEmail(options.usernameOrEmail)) {
                return {
                    errors: [{ field: 'usernameOrEmail', message: 'Wrong Email' }],
                };
            }
            else {
                return {
                    errors: [{ field: 'usernameOrEmail', message: 'Wrong Username' }],
                };
            }
        }
        const valid = await argon2_1.default.verify(user.password, options.password);
        if (!valid) {
            return {
                errors: [{ field: 'password', message: 'incorrect password' }],
            };
        }
        req.session.userId = user.id;
        if (user.isAdmin === null) {
            user.isAdmin = false;
        }
        return {
            user,
        };
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "email", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)('token')),
    __param(1, (0, type_graphql_1.Arg)('newPassword')),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "changePassword", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => ForgotResponse),
    __param(0, (0, type_graphql_1.Arg)('email')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "forgotPassword", null);
__decorate([
    (0, type_graphql_1.Query)(() => User_1.User, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "me", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)('options')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UsernamePasswordInput_1.UsernamePasswordInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "logout", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)('options')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
UserResolver = __decorate([
    (0, type_graphql_1.Resolver)(User_1.User)
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map