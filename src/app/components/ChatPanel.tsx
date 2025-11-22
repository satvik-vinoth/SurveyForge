"use client";

import {  useState } from "react";
import { X } from "lucide-react";

export default function ChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const baseurl = process.env.NEXT_PUBLIC_API_BASE_URL;

  async function sendMessage() {
    if (!input.trim()) return;

    const token = localStorage.getItem("token");

    setMessages((prev) => [...prev, { role: "user", text: input }]);

    const userMessage = input;
    setInput("");

    try {
      const res = await fetch(`${baseurl}/support/ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Error: Couldn't reach server." },
      ]);
    }
  }

  return (
    <div className="fixed bottom-0 right-0 w-80 md:w-96 h-[450px] bg-white shadow-2xl rounded-t-xl border flex flex-col">

      <div className="p-4 bg-blue-600 text-white flex justify-between items-center rounded-t-xl">
        <span className="font-semibold">SurveyForge Support</span>
        <button onClick={onClose} className="text-white cursor-pointer transform transition duration-200 hover:scale-110"><X size={20}/></button>
      </div>

      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg max-w-xs ${
              msg.role === "user"
                ? "bg-blue-100 ml-auto"
                : "bg-gray-200 mr-auto"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="p-3 border-t flex gap-2">
        <input
          className="flex-1 border rounded p-2"
          placeholder="Ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
                e.preventDefault();
              sendMessage();
            }
          }}
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
