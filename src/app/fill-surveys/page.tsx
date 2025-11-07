"use client";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import { useRouter } from "next/navigation";

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

export default function FillSurveys() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchSurveys = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to fill surveys.");
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:8000/all-surveys", {
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

    fetchSurveys();
  }, []);

  return (
    <div>
      <Header />

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Available Surveys</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {surveys.length === 0 && !error && (
          <p className="text-gray-600 text-center">
            No surveys available to respond.
          </p>
        )}

        <div className="space-y-4">
          {surveys.map((s) => (
            <div key={s._id} className="border p-4 rounded-lg bg-white shadow">
              <h3 className="text-xl font-bold">{s.title}</h3>
              <p className="text-gray-700 mb-2">{s.description}</p>
              <button
                onClick={() => router.push(`/survey/${s._id}`)}
                className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 cursor-pointer"
              >
                Respond
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
