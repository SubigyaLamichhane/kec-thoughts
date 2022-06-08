"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const User_1 = require("../../entities/User");
const isAdmin = async ({ context }, next) => {
    if (!context.req.session.userId) {
        throw new Error('not authenticated');
    }
    const user = await User_1.User.findOne({
        where: { id: context.req.session.userId },
    });
    if (!user) {
        throw new Error('User is not in the database');
    }
    if (!user.isAdmin) {
        throw new Error('You need to be logged in as Admin to approve the posts');
    }
    return next();
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=isAdmin.js.map