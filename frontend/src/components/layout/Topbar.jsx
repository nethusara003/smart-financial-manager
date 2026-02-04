import { useNavigate } from "react-router-dom";

const Topbar = ({ auth }) => {
  const navigate = useNavigate();
  const user = auth?.user;

  const handleLogout = () => {
    if (!window.confirm("Logout from Smart Finance?")) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("guest");

    navigate("/login", { replace: true });
    window.location.reload();
  };

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-slate-50">
      <div>
        <h2 className="text-lg font-semibold">
          Welcome back {user?.name || "Guest"}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="text-right">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        )}

        <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-semibold">
          {user?.name?.charAt(0).toUpperCase() || "G"}
        </div>

        <button
          onClick={handleLogout}
          className="ml-4 text-sm text-red-500 hover:text-red-600"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
