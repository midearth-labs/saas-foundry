import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements as defaultAdminStatements } from "better-auth/plugins/admin/access";

export const adminPermissionStatement = {
    ...defaultAdminStatements,
    waitlistDefinition: ["create", "get", "list", "getStats", "getActiveCount"],
    waitlistEntry: ["create", "updateStatus", "getEntry", "searchEntries"],
} as const;

export const adminAccessControl = createAccessControl(adminPermissionStatement);
