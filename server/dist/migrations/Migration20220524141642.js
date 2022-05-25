"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20220524141642 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20220524141642 extends migrations_1.Migration {
    async up() {
        this.addSql('drop table if exists "event" cascade;');
        this.addSql('drop table if exists "member" cascade;');
        this.addSql('drop table if exists "user" cascade;');
    }
    async down() {
        this.addSql('create table "event" ("id" serial, "name" varchar not null default null, "venue" varchar not null default null, "startDate" timestamp not null default null, "startDay" varchar not null default null, "days" int4 not null default null, "membersOnly" bool not null default false, "registerLink" varchar not null default null, "upcoming" bool not null default true, "timing" varchar not null default null);');
        this.addSql('alter table "event" add constraint "PK_30c2f3bbaf6d34a55f8ae6e4614" primary key ("id");');
        this.addSql('create table "member" ("id" serial, "name" varchar not null default null, "designation" varchar not null default null, "img" varchar not null default null, "linkedin" varchar null default null, "facebook" varchar null default null, "github" varchar null default null);');
        this.addSql('alter table "member" add constraint "PK_97cbbe986ce9d14ca5894fdc072" primary key ("id");');
        this.addSql('create table "user" ("id" serial primary key, "firstName" varchar not null default null, "lastName" varchar not null default null, "email" text not null default null, "password" varchar not null default null, "confirmed" bool not null default false);');
        this.addSql('alter table "user" add constraint "UQ_e12875dfb3b1d92d7d7c5377e22" unique ("email");');
    }
}
exports.Migration20220524141642 = Migration20220524141642;
//# sourceMappingURL=Migration20220524141642.js.map