export default function AdminCTA({ adminUrl, children, className = "" }) {
  return (
    <a
      href={adminUrl || "#"}
      target={adminUrl ? "_blank" : undefined}
      rel={adminUrl ? "noopener noreferrer" : undefined}
      className={className}
    >
      {children}
    </a>
  );
}
