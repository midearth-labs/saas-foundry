import { adminAc } from "better-auth/plugins/admin/access";
import { waitlistAccessControl } from "./permissions";

const userRole = waitlistAccessControl.newRole({
    waitlistEntry: ["create"]
});

const defaultAdminStatements = adminAc.statements;

const adminRole = waitlistAccessControl.newRole({
    waitlistDefinition: ["create", "get", "list", "getStats", "getActiveCount"],
    waitlistEntry: ["create", "updateStatus", "getEntry", "searchEntries"],
    ...defaultAdminStatements,
});

export const roles = {
    userRole,
    adminRole,
};