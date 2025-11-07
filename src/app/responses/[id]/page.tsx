"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "../../components/Header";

interface ResponseData {
  _id: string;
  survey_id: string;
  answers: { [key: string]: string };
  respondedBy: string;
}

interface Question {
  text: string;
  type: string;
  options: string[];
  required: boolean;
}

interface Survey {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
}

export default function ResponsesPage() {
  const { id } = useParams();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [error, setError] = useState("");
  const baseurl = process.env.NEXT_PUBLIC_API_BASE_URL

  useEffect(() => {
    const fetchResponses = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to view responses.");
        return;
      }

      try {
        const res = await fetch(`${baseurl}/getresponses/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.detail || "Failed to fetch responses.");
          return;
        }

        setSurvey(data.survey);
        setResponses(data.responses);
      } catch (err) {
        console.error("Error fetching responses:", err);
        setError("Network error while fetching responses.");
      }
    };

    if (id) fetchResponses();
  }, [id]);

  return (
    <div>
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        {error && <p className="text-red-600">{error}</p>}

        {survey && (
          <>
            <h1 className="text-3xl font-bold mb-2">{survey.title}</h1>
            <p className="mb-6 text-gray-700">{survey.description}</p>
          </>
        )}

        {responses.length === 0 && !error && (
          <p className="text-gray-600">No responses yet.</p>
        )}

        <div className="space-y-4">
          {responses.map((resp) => (
            <div key={resp._id} className="border p-4 rounded bg-white shadow">
              <h3 className="font-semibold mb-2">
                Response from: {resp.respondedBy}
              </h3>
              <ul className="list-disc ml-6">
                {Object.entries(resp.answers).map(([q, a], idx) => (
                  <li key={idx}>
                    <span className="font-semibold">{q}: </span> {a}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
