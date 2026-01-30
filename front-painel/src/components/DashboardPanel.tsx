import "../styles/dashboard.css";
import React from "react";

type DashboardPanelProps = {
  title: string;
  icon: React.ReactNode;
  variant?: "attention" | "network" | "finance";
  children: React.ReactNode;
};

const DashboardPanel = ({
  title,
  icon,
  variant = "attention",
  children,
}: DashboardPanelProps) => {
  return (
    <div className={`dashboard-panel ${variant}`}>
      <div className="dashboard-panel-header">
        <div className="dashboard-panel-icon">{icon}</div>
        <h3>{title}</h3>
      </div>

      <div className="dashboard-panel-content">{children}</div>
    </div>
  );
};

export default DashboardPanel;
