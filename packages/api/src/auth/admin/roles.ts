import { adminAc } from "better-auth/plugins/admin/access";
import { adminAccessControl } from "./permissions";

const userRole = adminAccessControl.newRole({
    waitlistEntry: ["create"]
});

const defaultAdminStatements = adminAc.statements;

const adminRole = adminAccessControl.newRole({
    waitlistDefinition: ["create", "get", "list", "getStats", "getActiveCount"],
    waitlistEntry: ["create", "updateStatus", "getEntry", "searchEntries"],
    ...defaultAdminStatements,
});

export const roles = {
    userRole,
    adminRole,
};