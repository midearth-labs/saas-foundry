import { adminAc } from "better-auth/plugins/admin/access";
import { waitlistAccessControl } from "./permissions";

export const waitlistUserRole = waitlistAccessControl.newRole({
    waitlistEntry: ["create"]
});

const defaultAdminStatements = adminAc.statements;

export const waitlistAdminRole = waitlistAccessControl.newRole({
    waitlistDefinition: ["create", "get", "list"],
    waitlistEntry: ["create"],
    ...defaultAdminStatements,
});
