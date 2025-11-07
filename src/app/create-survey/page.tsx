"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";

type QuestionType = "MCQ" | "Text" | "Likert" | "Dropdown";

interface Question {
  text: string;
  type: QuestionType;
  options: string[];
  required: boolean;
}

export default function CreateSurveyPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();

  // Add a new question
  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { text: "", type: "Text", options: [], required: false },
    ]);
  };

  // Update a question field
  const updateQuestion = <K extends keyof Question>(
    index: number,
    field: K,
    value: Question[K]
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  // Add option
  const addOption = (qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, options: [...q.options, ""] } : q
      )
    );
  };

  // Update option
  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.map((opt, oi) =>
                oi === optIndex ? value : opt
              ),
            }
          : q
      )
    );
  };

  // Submit survey
  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Survey title is required.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to create a survey.");
      return;
    }

    const newSurvey = { title, description, questions };

    try {
      const res = await fetch("http://127.0.0.1:8000/surveys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSurvey),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Failed to save survey.");
        return;
      }

      setSuccess("Survey created successfully! Redirecting...");
      setTitle("");
      setDescription("");
      setQuestions([]);

      // Redirect after short delay
      setTimeout(() => {
        router.push("/my-surveys");
      }, 1500);
    } catch (err) {
      console.error("Error:", err);
      setError("Network error.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Create a New Survey
        </h1>

        <div className="bg-white shadow-md rounded-xl p-6 space-y-6">
          {/* Survey Title & Description */}
          <div>
            <label className="block font-semibold mb-1">Survey Title</label>
            <input
              type="text"
              placeholder="Enter survey title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border rounded w-full p-2 mb-3"
            />

            <label className="block font-semibold mb-1">Description</label>
            <textarea
              placeholder="Enter survey description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border rounded w-full p-2"
            ></textarea>
          </div>

          {/* Questions Section */}
          <div>
            <h2 className="text-xl font-bold mb-3">Questions</h2>
            {questions.map((q, qi) => (
              <div
                key={qi}
                className="border p-4 mb-4 rounded-lg bg-gray-50"
              >
                <input
                  type="text"
                  placeholder="Question Text"
                  value={q.text}
                  onChange={(e) => updateQuestion(qi, "text", e.target.value)}
                  className="border rounded p-2 w-full mb-2"
                />

                <select
                  value={q.type}
                  onChange={(e) =>
                    updateQuestion(qi, "type", e.target.value as QuestionType)
                  }
                  className="border rounded p-2 w-full mb-2"
                >
                  <option value="MCQ">MCQ</option>
                  <option value="Text">Text</option>
                  <option value="Likert">Likert</option>
                  <option value="Dropdown">Dropdown</option>
                </select>

                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={q.required}
                    onChange={(e) =>
                      updateQuestion(qi, "required", e.target.checked)
                    }
                  />
                  Required
                </label>

                {(q.type === "MCQ" || q.type === "Dropdown") && (
                  <div className="space-y-2">
                    <p className="font-semibold">Options</p>
                    {q.options.map((opt, oi) => (
                      <input
                        key={oi}
                        type="text"
                        placeholder={`Option ${oi + 1}`}
                        value={opt}
                        onChange={(e) =>
                          updateOption(qi, oi, e.target.value)
                        }
                        className="border rounded p-2 w-full"
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => addOption(qi)}
                      className="text-blue-600 underline text-sm"
                    >
                      + Add Option
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addQuestion}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              + Add Question
            </button>
          </div>

          {/* Messages */}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          {/* Save */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save Survey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
