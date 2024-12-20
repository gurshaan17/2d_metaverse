import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import {useKindeAuth} from "@kinde-oss/kinde-auth-react";
import { useNavigate } from 'react-router-dom';
const backendUrl = import.meta.env.VITE_BACKENDURL;

const Homepage = () => {
  const [showContent, setShowContent] = useState(false);
  const { login, register} = useKindeAuth();
  const navigate = useNavigate();
  useEffect(() => {
    setShowContent(true);
  }, []);
  
  return (
    <div className="min-h-screen bg-[#242846]">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center">
        <img 
            src="https://cdn-icons-png.flaticon.com/512/3054/3054881.png"
            alt=" Logo"
            className="w-8 h-8"
          />
          <span className="ml-2 text-white text-xl font-semibold">Metaverse</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-4">
          <button onClick={register}  className="px-4 py-2 rounded-lg bg-[#63E2B7] text-[#242846] font-semibold hover:bg-[#50C89E] transition-colors">
            Get started
          </button>
          <button onClick={register} className="px-4 py-2 rounded-lg text-white border border-white hover:bg-white/10 transition-colors">
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center px-6 py-16 max-w-7xl mx-auto">
        {/* Left Column */}
        <div
          className={`w-full md:w-1/2 pr-0 md:pr-8 transform transition duration-700 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 md:mb-6">
            Your Virtual HQ
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8">
            Metaverse brings the best of in-person collaboration to distributed teams.
          </p>
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-4">
            
            <button onClick={register} className="px-6 py-3 rounded-lg bg-[#63E2B7] text-[#242846] font-semibold hover:bg-[#50C89E] transition-colors">
              Get started
            </button>
            
            <button onClick={login} className="flex items-center px-6 py-3 rounded-lg text-white hover:bg-white/10 transition-colors">
              Or just login <ChevronRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          className={`w-full md:w-1/2 mt-8 md:mt-0 transform transition duration-700 delay-200 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="bg-white rounded-xl p-4 shadow-lg transform rotate-1 hover:rotate-0 transition-transform duration-500 ease-out">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {/* Video Preview */}
              <video
                src="/video/preview.mp4" 
                autoPlay
                loop
                muted
                className="w-full h-full object-cover"
              ></video>
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
