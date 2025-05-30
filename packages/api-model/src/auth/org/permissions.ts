import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements as defaultOrgStatements } from "better-auth/plugins/organization/access";

 
const organizationPermissionStatement = { 
    ...defaultOrgStatements,
    //organization: ["create", "share", "update", "delete"], 
    waitlistDefinition: ["create", "get", "list", "getStats", "getActiveCount"],
    waitlistEntry: ["create", "updateStatus", "getEntry", "searchEntries"],
} as const; 
 
export const organizationAccessControl = createAccessControl(organizationPermissionStatement); 