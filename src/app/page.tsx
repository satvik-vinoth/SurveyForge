"use client"
import { useEffect, useState } from "react";
import Header from "./components/Header";
import Image from "next/image";


export default function Home() {
  const [backendReady, setBackendReady] = useState(false);
  const baseurl = process.env.NEXT_PUBLIC_API_BASE_URL

  useEffect(() => {
    async function wakeBackend() {
      try {
        const res = await fetch(`${baseurl}/ping`);
        if (res.ok) setBackendReady(true);
        else throw new Error("Backend sleeping");
      } catch {
        setTimeout(wakeBackend, 4000);
      }
    }
    wakeBackend();
  }, []);

  if (!backendReady) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-blue-50">
        <h1 className="text-3xl font-bold mb-3">Waking up the server...</h1>
        <p className="text-gray-600">This might take 20–40 seconds on Render free plan.</p>
      </div>
    );
  }
  return (
    <div className="h-screen">
      <Header></Header>
      <div className="flex flex-col md:flex-row items-center justify-center w-full ">
        <div className="w-full md:w-1/2 flex justify-center mb-10 md:mb-0">
          <Image 
            src="/survey2.jpg" 
            alt="Survey illustration" 
            width={450}
            height={450}
          />
        </div>
        <div className="w-full md:w-1/2 text-center md:text-left mb-20 md:mb-0 px-5">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[70px] mb-8 font-bold leading-tight">Your Free Public Survey <span className="text-blue-300">Platform</span> </h1>
          <p className="text-gray-700 text-base sm:text-lg md:text-xl ">See what others think with open survey results, and get more people answering yours.
          Earn credits by participating, and unlock more surveys to share.</p>
        </div>
        
      </div>

    </div>
  );
}
