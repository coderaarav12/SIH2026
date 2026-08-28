import React, { useState } from 'react';
import { Mic, MicOff, Volume2, MessageSquare } from 'lucide-react';

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  // Initialize Speech Recognition
  // @ts-ignore
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN'; // Indian English accent recognition
  }

  const startListening = () => {
    if (!recognition) {
      alert("Your browser does not support Voice Recognition. Please use Chrome.");
      return;
    }
    setIsListening(true);
    setTranscript('Listening...');
    setAiResponse('');
    window.speechSynthesis.cancel(); // Stop any current speaking
    recognition.start();

    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setIsListening(false);
      await sendToAI(text);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      setTranscript('Error listening. Try again.');
    };
  };

  const sendToAI = async (text: string) => {
    setIsThinking(true);
    try {
      const response = await fetch('https://stadium-hydrant-snowstorm.ngrok-free.dev/api/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await response.json();
      setAiResponse(data.reply);
      speak(data.reply);
    } catch (error) {
      setAiResponse("Connection to local AI Swarm failed. Is server.py running?");
    }
    setIsThinking(false);
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    // Try to find a nice Indian or British voice for a professional AI feel
    const voice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-GB'));
    if (voice) utterance.voice = voice;
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 transition-all">
      <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} />
          <h3 className="font-semibold text-lg">SyncMasters Copilot</h3>
        </div>
        <div className="flex gap-2">
          <Volume2 size={20} className={aiResponse ? "animate-pulse" : "opacity-50"} />
        </div>
      </div>
      
      <div className="p-4 h-64 overflow-y-auto bg-gray-50 flex flex-col gap-4">
        {transcript && transcript !== 'Listening...' && (
          <div className="self-end bg-indigo-100 text-indigo-900 p-3 rounded-xl max-w-[85%] shadow-sm">
            <p className="text-sm font-medium">{transcript}</p>
          </div>
        )}
        
        {isThinking && (
          <div className="self-start bg-white border border-gray-200 p-3 rounded-xl shadow-sm flex gap-2 items-center">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
          </div>
        )}

        {aiResponse && (
          <div className="self-start bg-white border border-gray-200 text-gray-800 p-3 rounded-xl max-w-[85%] shadow-sm">
            <p className="text-sm whitespace-pre-wrap">{aiResponse}</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100 flex justify-center">
        <button 
          onClick={startListening}
          className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-bold transition-all ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200'}`}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          {isListening ? 'Listening...' : 'Tap to Speak'}
        </button>
      </div>
    </div>
  );
}
