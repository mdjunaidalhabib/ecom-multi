const ROLE_LABELS = {
  superadmin: "Super Admin",
  admin: "Owner",
  staff: "Staff",
};

export function getRoleLabel(role) {
  return ROLE_LABELS[role] || role || "";
}

export default getRoleLabel;
