import { adminAc, userAc } from "better-auth/plugins/admin/access";
import { adminAccessControl } from "./permissions";


const defaultAdminStatements = adminAc.statements;
const defaultUserStatements = userAc.statements;

const userRole = adminAccessControl.newRole({
    ...defaultUserStatements,
    waitlistEntry: ["create"]
});

const adminRole = adminAccessControl.newRole({
    waitlistDefinition: ["create", "get", "list", "getStats", "getActiveCount"],
    waitlistEntry: ["create", "updateStatus", "getEntry", "searchEntries"],
    ...defaultAdminStatements,
});

const [user, admin] = [userRole, adminRole];  // Just to avoid namespace resolution issues

export const roles = {
    userRole,
    adminRole,
    user,
    admin,
};

export type AdminRoleType = typeof roles[keyof typeof roles];
export type AdminRoleTypeKeys = keyof typeof roles;
