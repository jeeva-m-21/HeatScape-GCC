'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { CopilotQueryResponse, CopilotSamplePrompt } from '@/lib/types';

interface Message {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: string;
  suggested_actions?: { label: string; action: string }[];
  spatial_filters?: Record<string, any>;
  referenced_policies?: string[];
}

export const HeatScapeCopilot: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'copilot',
      text: `### 🤖 Chennai HeatScape Climate Copilot
I am your AI advisor for the **Greater Chennai Corporation Heat Action Plan (GRAP)**, urban microclimate physics, and spatial hotspot analysis.

Try asking:
- *"Show all cells in T. Nagar with temperature over 42°C and canopy under 5%"*
- *"What are the mandatory work stoppage rules for Orange Alert?"*
- *"Why is Usman Road experiencing severe skimming flow heat entrapment?"*`,
      timestamp: 'Now',
      suggested_actions: [
        { label: 'Filter Critical Hotspots', action: 'FILTER_HOTSPOTS' },
        { label: 'Check GRAP Stage 2 Mandates', action: 'CHECK_GRAP' },
        { label: 'Open EOC Command Room', action: 'NAVIGATE_EOC' },
      ],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [samplePrompts, setSamplePrompts] = useState<CopilotSamplePrompt[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Load sample prompts
  useEffect(() => {
    apiClient
      .getCopilotSamplePrompts()
      .then((res) => setSamplePrompts(res.sample_prompts))
      .catch(() => {});
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputVal.trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    try {
      const res: CopilotQueryResponse = await apiClient.queryCopilot(textToSend, {
        current_route: pathname,
      });

      const copilotMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'copilot',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggested_actions: res.suggested_actions,
        spatial_filters: res.spatial_filters,
        referenced_policies: res.referenced_policies,
      };

      setMessages((prev) => [...prev, copilotMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'copilot',
          text: '⚠️ Communication timeout with GCC Climate Intelligence Core. Please try again.',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (action: string) => {
    if (action === 'NAVIGATE_EOC') {
      router.push('/eoc');
      setIsOpen(false);
    } else if (action === 'NAVIGATE_PLANNER') {
      router.push('/simulator');
      setIsOpen(false);
    } else if (action === 'NAVIGATE_STUDIO_CANYON') {
      router.push('/studio');
      setIsOpen(false);
    } else if (action === 'NAVIGATE_STUDIO_TRANSECT') {
      router.push('/studio');
      setIsOpen(false);
    } else if (action === 'NAVIGATE_ROUTING') {
      router.push('/navigator');
      setIsOpen(false);
    } else if (action === 'FILTER_HOTSPOTS') {
      handleSend('Show cells with temperature > 42°C and canopy < 5%');
    } else if (action === 'CHECK_GRAP') {
      handleSend('What are the mandatory GCC work suspension and misting rules for Orange Alert?');
    } else if (action === 'DISPATCH_TRUCKS') {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'copilot',
          text: '🚒 **Misting Cannon Trucks Dispatched**: 6 high-pressure evaporative misting cannons mobilized from Ripon Building central depot to T. Nagar, Parrys, and Guindy transit corridors.',
          timestamp: 'Just now',
        },
      ]);
    }
  };

  // Simulated Voice Mic Input
  const toggleVoiceMic = () => {
    if (!isListening) {
      setIsListening(true);
      setInputVal('Listening to speech...');
      setTimeout(() => {
        setInputVal('Show critical heatwave zones in Kodambakkam Ward 118 with elderly population above 20%');
        setIsListening(false);
      }, 2000);
    } else {
      setIsListening(false);
      setInputVal('');
    }
  };

  return (
    <>
      {/* Floating Action Trigger Pill in bottom-right */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3.5 py-2.5 bg-[#101010] hover:bg-[#181818] border border-amber-500/60 hover:border-amber-400 text-amber-400 rounded-full font-mono text-xs font-bold shadow-[0_4px_20px_rgba(243,128,32,0.35)] transition-all cursor-pointer group"
          title="Open Chennai Heat Copilot (⌘K)"
        >
          <span className="material-symbols-outlined text-[18px] text-amber-400 group-hover:rotate-12 transition-transform">
            psychology
          </span>
          <span>Chennai Heat Copilot</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono">
            ⌘K
          </span>
        </button>
      </div>

      {/* Copilot Dialog Window */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#0a0a0a] border border-[#2a2a2a] rounded-2xl shadow-2xl flex flex-col h-[640px] max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-[#121212] border-b border-[#222222] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/60 flex items-center justify-center text-amber-400">
                  <span className="material-symbols-outlined text-[15px]">psychology</span>
                </div>
                <div>
                  <div className="font-mono text-xs font-bold text-white flex items-center gap-2">
                    <span>CHENNAI HEAT COPILOT</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                      ONLINE
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    Natural Language Spatial Query &amp; GCC GRAP Policy Engine
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Quick Sample Prompts Ribbon */}
            <div className="px-5 py-2 bg-[#0d0d0d] border-b border-[#1c1c1c] flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-mono text-gray-500 whitespace-nowrap">Suggested:</span>
              {samplePrompts.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSend(p.prompt)}
                  className="px-2.5 py-1 rounded-md bg-[#161616] hover:bg-[#222222] border border-[#262626] text-gray-300 hover:text-amber-400 text-[11px] font-mono whitespace-nowrap transition-colors cursor-pointer"
                >
                  {p.title}
                </button>
              ))}
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1 px-1">
                    <span>{msg.sender === 'user' ? 'You' : 'HeatScape Copilot'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`p-4 rounded-2xl max-w-[85%] leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-amber-500 text-black font-semibold rounded-br-none shadow-md'
                        : 'bg-[#141414] border border-[#242424] text-gray-200 rounded-bl-none'
                    }`}
                  >
                    {/* Render Simple Markdown */}
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* Referenced Policies */}
                    {msg.referenced_policies && msg.referenced_policies.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-[#262626] text-[10px] text-gray-400">
                        <span className="text-amber-400 font-bold">Policy Grounding: </span>
                        {msg.referenced_policies.join(' • ')}
                      </div>
                    )}

                    {/* Action Chips */}
                    {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-[#262626] flex flex-wrap gap-2">
                        {msg.suggested_actions.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => handleAction(act.action)}
                            className="px-2.5 py-1 rounded-lg bg-[#1f1f1f] hover:bg-amber-500/20 border border-[#333333] hover:border-amber-500 text-amber-400 text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[13px]">play_arrow</span>
                            <span>{act.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-gray-400 text-xs font-mono p-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span>Synthesizing GCC spatiotemporal intelligence &amp; policy rules...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-[#121212] border-t border-[#222222]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2 bg-[#070707] border border-[#262626] focus-within:border-amber-500/80 rounded-xl px-3 py-2 transition-colors"
              >
                <button
                  type="button"
                  onClick={toggleVoiceMic}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isListening
                      ? 'bg-red-950 text-red-400 animate-pulse'
                      : 'text-gray-400 hover:text-amber-400'
                  }`}
                  title="Simulate Voice Input"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isListening ? 'mic' : 'mic_none'}
                  </span>
                </button>

                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Ask policy questions or enter spatial filters (e.g. 'temp > 42 in T. Nagar')..."
                  className="flex-1 bg-transparent text-white font-mono text-xs outline-none placeholder:text-gray-600"
                />

                <button
                  type="submit"
                  disabled={!inputVal.trim() || isLoading}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-mono text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Send</span>
                  <span className="material-symbols-outlined text-[14px]">send</span>
                </button>
              </form>
              <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500 font-mono px-1">
                <span>Press <strong>Enter</strong> to send • <strong>Esc</strong> to close</span>
                <span>Powered by HeatScape NLP &amp; GRAP Knowledge Core</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
