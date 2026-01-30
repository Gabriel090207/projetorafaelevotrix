import "../styles/dashboard.css";

type DashboardCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  variant?: "primary" | "success" | "danger" | "warning";
  subtitle?: string;
};

const DashboardCard = ({
  title,
  value,
  icon,
  variant = "primary",
  subtitle,
}: DashboardCardProps) => {
  return (
    <div className={`dash-card ${variant}`}>
     <div className="dash-card-header">
  <div className="dash-card-icon">{icon}</div>
</div>

<div className="dash-card-body">
  <div className="dash-card-value">{value}</div>
  <span className="dash-card-title">{title}</span>
  {subtitle && <span className="dash-card-subtitle">{subtitle}</span>}
</div>

    </div>
  );
};

export default DashboardCard;
