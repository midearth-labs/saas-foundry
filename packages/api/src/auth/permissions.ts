import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements as defaultUserStatements } from "better-auth/plugins/admin/access";

export const waitlistPermissionStatement = {
    ...defaultUserStatements,
    waitlistDefinition: ["create", "get", "list", "getStats", "getActiveCount"],
    waitlistEntry: ["create", "updateStatus", "getEntry", "searchEntries"],
} as const;

export const waitlistAccessControl = createAccessControl(waitlistPermissionStatement);
