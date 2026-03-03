import "../../../styles/clientes-online.css";

const ClientesOnline = () => {
  return (
    <div className="online-page">

      {/* HEADER */}
      <div className="online-header">
        <h1>Clientes Online</h1>
      </div>

      {/* TABELA */}
      <div className="online-table-wrapper">
        <table className="online-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>IP</th>
              <th>MAC</th>
              <th>NAS / OLT</th>
              <th>Plano</th>
              <th>Conectado</th>
              <th>Upload</th>
              <th>Download</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td colSpan={8} style={{ padding: 16, opacity: 0.7 }}>
                Nenhum cliente online.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default ClientesOnline;