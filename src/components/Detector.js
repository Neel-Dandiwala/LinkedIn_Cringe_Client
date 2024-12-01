import React, { useState } from 'react';
import axios from 'axios';
import ThreeScene from './ThreeScene';

const Detector = () => {
  const [text, setText] = useState('');
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/predict', { text });
      setScore(Math.min(Math.max(response.data.score * 100, 0), 100));
    } catch (error) {
      console.error('Error:', error);
      alert('Error analyzing text');
    } finally {
      setLoading(false);
    }
  };

  const getRating = (score) => {
    if (score < 20) return { text: "Not Cringe!", texture: 'love' };
    if (score < 40) return { text: "Looking Good!", texture: 'surprised' };
    if (score < 60) return { text: "Somewhat Cringe", texture: 'like' };
    if (score < 80) return { text: "Pretty Cringe", texture: 'laugh' };
    return { text: "Extremely Cringe!", texture: 'angry' };
  };

  const getBackgroundColor = (score) => {
    if(!score) return 'from-blue-500 to-purple-500';
    if(score < 20) return 'from-red-500 to-pink-500';
    if(score < 40) return 'from-orange-500 to-yellow-500';
    if(score < 60) return 'from-blue-500 to-purple-500';
    if(score < 80) return 'from-red-500 to-yellow-500';
    else return 'from-red-500 to-orange-500';
  };

  return (
    <div className={`min-h-screen bg-gradient-to-r ${getBackgroundColor(score)} h-screen p-4 relative overflow-hidden z-5`}>
    <div className="fixed inset-0 z-5">
      <ThreeScene score={score} />
    </div>
      
      <div className="relative max-w-xl mx-auto pt-16 z-10">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10">
          <div className="p-8 space-y-6">
            <div className="text-center space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Cringe or not?
              </h1>
              <p className="text-lg text-blue-200">
                Check how cringe your post is! 🤣
              </p>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your post here..."
              className="w-full h-32 bg-white/10 border-0 rounded-2xl p-4 text-white resize-none 
                       placeholder-blue-200/50 focus:ring-2 focus:ring-blue-400
                       focus:outline-none"
            />

            <button
              onClick={handleSubmit}
              disabled={!text || loading}
              className="w-full bg-white bg-opacity-20 hover:bg-opacity-100 hover:text-black 
           text-white rounded-xl py-4 text-lg font-semibold 
           disabled:opacity-50 disabled:cursor-not-allowed transition-all 
           shadow-lg hover:shadow-xl"
            >
              {loading ? 'Analyzing...' : 'Check Post'}
            </button>

            {score !== null && (
              <div className="text-center space-y-3 py-2">
                <div className="text-2xl font-bold text-white">
                  {getRating(score).text}
                </div>
                <div className="text-blue-200 font-medium">
                  Cringe Score: {score.toFixed(1)}%
                </div>
              </div>
            )}
            <div className="border-t border-white/10 pt-4">
            
             <a href="https://www.linkedin.com/in/neel-dandiwala/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#0A66C2] hover:bg-[#004182] 
                       text-white rounded-xl py-3 text-lg font-semibold transition-all 
                       shadow-lg hover:shadow-xl"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Connect on LinkedIn
            </a>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detector;