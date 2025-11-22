"use client";
import { useState } from "react";
import ChatPanel from "./ChatPanel";
import { MessageCircle } from "lucide-react"

export default function FloatingChatButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition transform hover:scale-105 animate-pusle"
      >
        <MessageCircle size={26} />
      </button>
      {open && <ChatPanel onClose={() => setOpen(false)} />}
    </>
  );
}
