"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "../../components/Header";

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

export default function SurveyPage() {
  const { id } = useParams();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [invalidQuestions, setInvalidQuestions] = useState<string[]>([]);
  const baseurl = process.env.NEXT_PUBLIC_API_BASE_URL

  useEffect(() => {
    const fetchSurvey = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to respond.");
        return;
      }

      try {
        const res = await fetch(`${baseurl}/survey/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.detail || "Failed to load survey.");
          return;
        }

        const data = await res.json();
        setSurvey(data);
      } catch (err) {
        console.error("Error fetching survey:", err);
        setError("Network error.");
      }
    };

    if (id) fetchSurvey();
  }, [id]);

  const handleChange = (qText: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qText]: value }));
    setInvalidQuestions((prev) => prev.filter((q) => q !== qText)); // clear highlight when answered
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setInvalidQuestions([]);

    if (!survey) return;

    // 🔴 Validate required questions
    const missing = survey.questions
      .filter((q) => q.required && (!answers[q.text] || answers[q.text].trim() === ""))
      .map((q) => q.text);

    if (missing.length > 0) {
      setInvalidQuestions(missing);
      setError("Please answer all required questions.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in.");
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:8000/responses/${survey._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (Array.isArray(data)) {
          setError(data.map((e) => e.msg).join(", "));
        } else {
          setError(data.detail || "Failed to submit response.");
        }
        return;
      }

      setSuccess("Response submitted successfully!");
      setAnswers({});
    } catch (err) {
      console.error("Error submitting response:", err);
      setError("Network error.");
    }
  };

  if (!survey) {
    return (
      <div>
        <Header />
        <div className="p-6 text-center">{error || "Loading survey..."}</div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">{survey.title}</h1>
        <p className="mb-6 text-gray-700">{survey.description}</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-6"
        >
          {survey.questions.map((q, idx) => (
            <div
              key={idx}
              className={`border p-4 rounded bg-gray-50 ${
                invalidQuestions.includes(q.text) ? "border-red-500" : "border-gray-300"
              }`}
            >
              <label className="font-semibold block mb-2">
                {q.text} {q.required && "*"}
              </label>

              {q.type === "Text" && (
                <input
                  type="text"
                  value={answers[q.text] || ""}
                  onChange={(e) => handleChange(q.text, e.target.value)}
                  className={`border rounded p-2 w-full ${
                    invalidQuestions.includes(q.text) ? "border-red-500" : ""
                  }`}
                />
              )}

              {q.type === "MCQ" &&
                q.options.map((opt, i) => (
                  <label key={i} className="block">
                    <input
                      type="radio"
                      name={q.text}
                      value={opt}
                      checked={answers[q.text] === opt}
                      onChange={(e) => handleChange(q.text, e.target.value)}
                    />{" "}
                    {opt}
                  </label>
                ))}

              {q.type === "Dropdown" && (
                <select
                  value={answers[q.text] || ""}
                  onChange={(e) => handleChange(q.text, e.target.value)}
                  className={`border rounded p-2 w-full ${
                    invalidQuestions.includes(q.text) ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select an option</option>
                  {q.options.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {q.type === "Likert" && (
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <label key={num} className="flex flex-col items-center">
                      <input
                        type="radio"
                        name={q.text}
                        value={num.toString()}
                        checked={answers[q.text] === num.toString()}
                        onChange={(e) => handleChange(q.text, e.target.value)}
                      />
                      {num}
                    </label>
                  ))}
                </div>
              )}

              {invalidQuestions.includes(q.text) && (
                <p className="text-red-500 text-sm mt-1">This question is required.</p>
              )}
            </div>
          ))}

          {error && <p className="text-red-600">{error}</p>}
          {success && <p className="text-green-600">{success}</p>}

          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
          >
            Submit Response
          </button>
        </form>
      </div>
    </div>
  );
}
