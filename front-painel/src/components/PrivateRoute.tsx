import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

export default function PrivateRoute({ children }: Props) {
  const token = localStorage.getItem("token");
  const empresaId = localStorage.getItem("empresa_id");

  // se faltar qualquer um, volta pro login
  if (!token || !empresaId) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}