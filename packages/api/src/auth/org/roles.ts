import { 
    adminAc as orgAdminAc, 
    ownerAc as orgOwnerAc,
    memberAc as orgMemberAc 
} from 'better-auth/plugins/organization/access';
import { organizationAccessControl as orgAc } from "./permissions";


const memberRole = orgAc.newRole({
    ...orgMemberAc.statements,
    waitlistEntry: ["create"]
});

const analystRole = orgAc.newRole({
    ...memberRole.statements,
    waitlistDefinition: ["getStats", "getActiveCount"],
    waitlistEntry: ["getEntry", "searchEntries"],
});

const adminRole = orgAc.newRole({
    ...memberRole.statements,
    ...orgAdminAc.statements,
    invitation: ["create", "cancel"],
    waitlistDefinition: ["create", "get", "list", "getStats", "getActiveCount"],
    waitlistEntry: ["create", "updateStatus", "getEntry", "searchEntries"],
});

const ownerRole = orgAc.newRole({
    ...orgOwnerAc.statements,
    ...adminRole.statements,
});

const [owner, member, admin] = [ownerRole, memberRole, adminRole];

export const roles = {
    memberRole,
    adminRole,
    ownerRole,
    analystRole,
    owner,
    member,
    admin,
}

export type OrgRoleType = typeof roles[keyof typeof roles];
export type OrgRoleTypeKeys = keyof typeof roles;
