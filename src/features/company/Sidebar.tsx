import { NavLink } from "react-router-dom";

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-title">APP NAME</div>
        <div className="brand-card">
          <div className="logo-box">COMPANY LOGO</div>
          <button className="link-btn" type="button">Upload logo</button>
        </div>
      </div>

      <nav className="nav">
        <NavLink to="/home" className="nav-item">Home</NavLink>
        <NavLink to="/company" className="nav-item">Information</NavLink>
        <NavLink to="/customers" className="nav-item">Customers</NavLink>
        <NavLink to="/invoices" className="nav-item">Invoices</NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-pill">User Name ▾</div>
      </div>
    </aside>
  );
}
