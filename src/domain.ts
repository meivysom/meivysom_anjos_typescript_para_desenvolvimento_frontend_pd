export const ROLES = Object.freeze(["admin", "editor", "viewer"]);

export const UserStatus = Object.freeze({
    Active: "active",
    Suspended: "suspended",
    Deactivated: "deactivated",
});

export const PERMISSIONS_BY_ROLE = {
    admin: ["user:read", "user:write", "user:delete"],
    editor: ["user:read", "user:write"],
    viewer: ["user:read"],
};


