import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { sendMessageToLLM } from '../../services/llmService';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hi! I am your Nutrition Coach. \n\nTo start, please **Setup your AI Provider** in the settings (⚙️ icon above).\n\nYou can use an **OpenAI Key** or run a **Local Model** (Ollama) for free.'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
    const [provider, setProvider] = useState(localStorage.getItem('llm_provider') || 'openai');
    const [modelName, setModelName] = useState(localStorage.getItem('ollama_model_name') || 'llama3');
    const [showSettings, setShowSettings] = useState(false);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Auto-migrate legacy default to llama3
    useEffect(() => {
        if (modelName === 'cyom-coach') {
            setModelName('llama3');
            localStorage.setItem('ollama_model_name', 'llama3');
        }
    }, []);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMessage = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await sendMessageToLLM([...messages, userMessage], apiKey, provider, modelName);
            setMessages(prev => [...prev, response]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, something went wrong. Check your connection or model name." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    const saveSettings = () => {
        localStorage.setItem('openai_api_key', apiKey);
        localStorage.setItem('llm_provider', provider);
        localStorage.setItem('ollama_model_name', modelName);
        setShowSettings(false);
    };

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-20 right-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center animate-bounce-slow"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-20 right-4 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-100 animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-1.5 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 2a10 10 0 0 1 10 10"></path><path d="M2 12h10"></path></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">CYOM Coach</h3>
                                <p className="text-xs text-emerald-100">AI Powered Nutritionist</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setShowSettings(!showSettings)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors" title="Settings">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                            </button>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors" title="Minimize">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    </div>

                    {/* Settings / API Key */}
                    {showSettings && (
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">AI Provider</label>
                                <div className="flex bg-gray-200 rounded p-0.5">
                                    <button
                                        onClick={() => setProvider('openai')}
                                        className={`flex-1 text-xs py-1 rounded transition-all ${provider === 'openai' ? 'bg-white shadow text-emerald-600 font-bold' : 'text-gray-500'}`}
                                    >
                                        OpenAI
                                    </button>
                                    <button
                                        onClick={() => setProvider('ollama')}
                                        className={`flex-1 text-xs py-1 rounded transition-all ${provider === 'ollama' ? 'bg-white shadow text-emerald-600 font-bold' : 'text-gray-500'}`}
                                    >
                                        Local (Ollama)
                                    </button>
                                </div>
                            </div>

                            {provider === 'openai' ? (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">OpenAI API Key</label>
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="sk-..."
                                        className="w-full text-sm border rounded px-2 py-1"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Ollama Model Name</label>
                                    <input
                                        type="text"
                                        value={modelName}
                                        onChange={(e) => setModelName(e.target.value)}
                                        placeholder="e.g. llama3, mistral"
                                        className="w-full text-sm border rounded px-2 py-1 mb-1"
                                    />
                                    <div className="text-[10px] text-gray-500 bg-blue-50 p-2 rounded border border-blue-100 italic">
                                        Type the name of the model you ran with `ollama run ...` (e.g., <strong>llama3</strong>).
                                    </div>
                                </div>
                            )}

                            <button onClick={saveSettings} className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded font-bold w-full">
                                Save Settings
                            </button>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${msg.role === 'user'
                                        ? 'bg-emerald-600 text-white rounded-br-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                        }`}
                                >
                                    {msg.role === 'assistant' ? (
                                        <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-strong:text-emerald-700">
                                            <Markdown>
                                                {msg.content}
                                            </Markdown>
                                        </div>
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about your diet..."
                                className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isLoading}
                                className="bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatBot;
