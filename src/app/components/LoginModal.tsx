"use client";
import { useState } from "react";

export default function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setMessage(""); 
    const url = isRegister ? "http://localhost:8000/register" : "http://localhost:8000/login";
    const options: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    };

    if (!isRegister) {
      const formData = new URLSearchParams();
      formData.append("username", form.username);
      formData.append("password", form.password);
      options.body = formData;
      options.headers = {};
    }

    try {
      const res = await fetch(url, options);
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.detail || "Something went wrong");
        return;
      }

      if (isRegister) {
        setMessage("Registration successful. Switch to login.");
        setIsRegister(false);
      } else {
        localStorage.setItem("token", data.access_token);
        setMessage("Login successful.");
        setTimeout(() => {
          setMessage("");
          onClose();
        }, 1000);
      }
    } catch (err) {
      setMessage("Network error");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-xl w-96">
        <h2 className="text-xl font-bold mb-4">{isRegister ? "Register" : "Login"}</h2>
        <input
          type="text"
          placeholder="Username"
          className="border w-full p-2 mb-3"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="border w-full p-2 mb-3"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full transform hover:scale-105 transition cursor-pointer"
        >
          {isRegister ? "Register" : "Login"}
        </button>

        {message && (
          <p className="mt-3 text-sm text-center">{message}</p>
        )}

        <p className="mt-3 text-sm text-center">
          {isRegister ? "Already have an account?" : "Not registered?"}{" "}
          <span
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-600 cursor-pointer"
          >
            {isRegister ? "Login here" : "Register here"}
          </span>
        </p>
      </div>
    </div>
  );
}
