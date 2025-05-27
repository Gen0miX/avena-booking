import { FaMoon, FaSun } from "react-icons/fa";

export default function NavBar() {
  return (
    <div className="navbar bg-base-200">
      <div className="navbar-start">
        <p className="font-heading font-semibold text-3xl tracking-wide">
          ARIZONA
        </p>
      </div>
      <div className="navbar-end">
        <label className="swap swap-rotate">
          <input type="checkbox" className="theme-controller" value="avenal" />
          <FaMoon className="swap-off h-6 w-6"></FaMoon>
          <FaSun className="swap-on h-6 w-6"></FaSun>
        </label>
      </div>
    </div>
  );
}
