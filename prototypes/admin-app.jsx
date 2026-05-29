/* ============ Admin App root ============ */

function AdminApp() {
  const route = useAdminRoute();

  let view = null;
  switch (route.path) {
    case 'dashboard': view = <AdminDashboard />; break;
    case 'users': view = <Users />; break;
    case 'sites': view = <SiteManagement />; break;
    case 'billing': view = <Billing />; break;
    case 'transactions': view = <Transactions />; break;
    case 'reports': view = <Reports />; break;
    case 'accounting': view = <Accounting />; break;
    case 'gateways': view = <Gateways />; break;
    case 'automation': view = <Automation />; break;
    case 'settings': view = <Settings />; break;
    default: view = <AdminDashboard />;
  }

  return (
    <>
      <Sidebar active={route.path} />
      <div className="adm-main">
        <TopBar active={route.path} />
        <div className="adm-view">
          {view}
        </div>
      </div>
      <AdmToastHost />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AdminApp />);
