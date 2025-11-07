"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";

type QuestionType = "MCQ" | "Text" | "Likert" | "Dropdown";

interface Question {
  text: string;
  type: QuestionType;
  options: string[];
  required: boolean;
}

interface Survey {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
}

export default function MySurveys() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const baseurl = process.env.NEXT_PUBLIC_API_BASE_URL

  const fetchSurveys = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to view your surveys.");
      return;
    }

    try {
      const res = await fetch(`${baseurl}/my-surveys`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Failed to fetch surveys.");
        return;
      }

      const data = await res.json();
      setSurveys(data);
    } catch (err) {
      console.error("Error fetching surveys:", err);
      setError("Network error while fetching surveys.");
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this survey?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in.");
      return;
    }

    try {
      const res = await fetch(`${baseurl}/surveys/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Failed to delete survey.");
        return;
      }

      setSurveys((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Error deleting survey:", err);
      setError("Network error while deleting survey.");
    }
  };

  return (
    <div>
      <Header />

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Surveys</h1>
          <button
            onClick={() => router.push("/create-survey")}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
          >
            + Create Survey
          </button>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}

        {surveys.length === 0 && !error && (
          <p className="text-gray-600">No surveys created yet.</p>
        )}

        <div className="space-y-4">
          {surveys.map((s) => (
            <div key={s._id} className="border p-4 rounded-lg bg-white shadow">
              <h3 className="text-xl font-bold">{s.title}</h3>
              <p className="text-gray-700 mb-2">{s.description}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => window.open(`/survey/${s._id}`, "_blank")}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(s._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                >
                  Delete
                </button>
                <button
                  onClick={() => window.open(`/responses/${s._id}`, "_blank")}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer"
                >
                  Responses
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
