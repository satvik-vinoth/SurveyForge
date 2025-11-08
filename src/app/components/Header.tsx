"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import LoginModal from "./LoginModal";
import { useRouter } from "next/navigation";

export default function Header() {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); 
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/");
    router.refresh();
  };

  const menu = [
    { name: "MY SURVEYS", link: "/my-surveys" },
    { name: "FILL SURVEYS", link: "/fill-surveys" },
  ];

  return (
    <>
      <div className="flex flex-row justify-between items-center px-6 md:px-30 py-7 bg-blue-100 ">
        <h2 className="text-2xl font-bold">
          <Link href="/" className="hover:text-blue-500 transition-colors duration-200">
            SURVEYFORGE
          </Link>
        </h2>
        <div className="hidden md:flex flex-row items-center gap-8">
          {menu.map((item, index) => (
            <Link key={index} href={item.link} className="cursor-pointer font-bold border border-blue-900 px-3 py-1 hover:bg-blue-200 rounded">
              {item.name}
            </Link>
          ))}

          {isLoggedIn ? (
            <span
              className="cursor-pointer font-bold border border-red-900 px-3 py-1 text-red-500 hover:bg-red-200 rounded"
              onClick={handleLogout}
            >
              LOGOUT
            </span>
          ) : (
            <span
              className="cursor-pointer font-bold border border-blue-900 px-3 py-1 text-blue-500 hover:bg-blue-200 rounded"
              onClick={() => setShowLogin(true)}
            >
              LOGIN
            </span>
          )}
        </div>
      

        <button className="md:hidden cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={28} /> : <Menu size={28} />}</button>
      </div>
        {menuOpen && (
          <div className="flex flex-col items-center bg-blue-50 py-4 space-y-4 md:hidden border-t border-blue-200">
            {menu.map((item, index) => (
              <Link key={index} href={item.link} onClick={() => setMenuOpen(false)} className="w-11/12 text-center font-bold border border-blue-900 py-2 hover:bg-blue-200 rounded">
                {item.name}
              </Link>
            ))}

          </div>
        )}
      

      <LoginModal
        isOpen={showLogin}
        onClose={() => {
          setShowLogin(false);
          setIsLoggedIn(true); 
        }}
      />
    </>
  );
}
