import { FaAlignLeft } from "react-icons/fa";
import Link from "next/link";

export default function NavBar() {
  return (
    <div className="navbar bg-base-200 sticky top-0 z-50 hidden">
      <div className="navbar-start">
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-primary rounded-full btn-circle"
          >
            <FaAlignLeft className="" />
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-200 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <li>
              <Link href={"/"}>item 1</Link>
            </li>
            <li>
              <Link href={"/"}>item 2</Link>
            </li>
          </ul>
        </div>
        <Link
          href={"/"}
          className="btn btn-ghost text-2xl font-heading font-bold "
        >
          Avena
        </Link>
      </div>
    </div>
  );
}
