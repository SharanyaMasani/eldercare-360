import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Heart,
  ShieldAlert,
  PhoneCall,
  Volume2,
  RefreshCw,
  Wind,
  Info,
  User,
  Bot,
  AlertTriangle,
  Smile,
  Calendar,
  Pill
} from 'lucide-react';
import {
  getAuraMessages,
  saveAuraMessage,
  clearAuraMessages,
  getPatientProfile
} from '../../services/storage';
import { generateAuraResponse, WELLNESS_ACTIVITIES } from '../../services/auraEngine';

export default function AuraCompanion({ onOpenEmergency, onNavigate, accessibility, onRefreshData }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeExercise, setActiveExercise] = useState(null);
  const [breathingPhase, setBreathingPhase] = useState('Inhale (4s)'); // 'Inhale' | 'Hold' | 'Exhale' | 'Rest'
  const [breathingProgress, setBreathingProgress] = useState(0);

  const profile = getPatientProfile();
  const chatBottomRef = useRef(null);

  useEffect(() => {
    setMessages(getAuraMessages());
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Breathing animation timer
  useEffect(() => {
    if (!activeExercise || activeExercise.id !== 'box_breathing') return;

    const interval = setInterval(() => {
      setBreathingProgress((prev) => {
        const next = (prev + 1) % 16;
        if (next < 4) setBreathingPhase('Inhale gently through nose...');
        else if (next < 8) setBreathingPhase('Hold that calm breath...');
        else if (next < 12) setBreathingPhase('Slowly exhale through mouth...');
        else setBreathingPhase('Rest and be peaceful...');
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeExercise]);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = saveAuraMessage(userMsg);
    setMessages(updated);
    setInputMessage('');
    setIsTyping(true);

    // Simulate natural empathetic response delay (600ms)
    setTimeout(() => {
      const response = generateAuraResponse(text);

      const auraMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: 'aura',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCrisis: response.isCrisis,
        crisisData: response.crisisData,
        suggestedActivity: response.suggestedActivity,
        quickReplies: response.quickReplies
      };

      const finalMessages = saveAuraMessage(auraMsg);
      setMessages(finalMessages);
      setIsTyping(false);

      if (response.suggestedActivity) {
        setActiveExercise(response.suggestedActivity);
      }

      if (accessibility?.speechNarration) {
        speakText(response.text);
      }

      if (onRefreshData) onRefreshData();
    }, 700);
  };

  const handleQuickReply = (reply) => {
    if (reply === 'Call Caregiver Now') {
      window.location.href = `tel:${profile.emergencyContact.phone}`;
      return;
    }
    if (reply === 'Call 112 Emergency') {
      window.location.href = 'tel:112';
      return;
    }
    if (reply === 'Open Medication Schedule') {
      onNavigate('medications');
      return;
    }
    if (reply === 'View Inventory') {
      onNavigate('inventory');
      return;
    }
    if (reply === 'Start 4-4-4 Breathing' || reply === 'Start Breathing Exercise') {
      setActiveExercise(WELLNESS_ACTIVITIES[0]);
    }
    handleSendMessage(reply);
  };

  const handleResetChat = () => {
    if (window.confirm('Reset conversation history with AURA?')) {
      const resetMsgs = clearAuraMessages();
      setMessages(resetMsgs);
      setActiveExercise(null);
    }
  };

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* AURA Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0F172A, #0F766E)',
          color: '#FFFFFF',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2DD4BF, #0D9488)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(45, 212, 191, 0.4)'
            }}
          >
            <Sparkles size={28} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                AURA
              </h2>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#2DD4BF',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}
              >
                EMOTIONAL AI COMPANION
              </span>
            </div>
            <p style={{ fontSize: '0.86rem', color: '#CCFBF1', margin: '2px 0 0' }}>
              Warm, patient & empathetic listener • Health record aware • Built-in crisis safety
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setActiveExercise(WELLNESS_ACTIVITIES[0])}
            className="btn"
            style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', fontSize: '0.82rem', padding: '6px 12px', minHeight: '34px' }}
          >
            <Wind size={15} /> Guided Breathing
          </button>
          <button
            onClick={handleResetChat}
            className="btn"
            style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontSize: '0.82rem', padding: '6px 10px', minHeight: '34px' }}
            title="Reset Chat History"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Transparent Assistant Notice Banner */}
      <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: '#475569' }}>
        <Info size={18} color="#0D9488" style={{ flexShrink: 0 }} />
        <span>
          <strong>Ethical AI Guardrails:</strong> AURA is a demonstration AI companion designed to provide comforting social presence and emotional encouragement. It never pretends to be human, does not provide medical diagnoses, and never advises changing prescriptions. In life-threatening emergencies, dial 112 immediately.
        </span>
      </div>

      {/* Active Guided Exercise Widget (if triggered) */}
      {activeExercise && (
        <div className="card" style={{ background: '#F0FDFA', border: '2px solid #5EEAD4', padding: '20px', position: 'relative' }}>
          <button
            onClick={() => setActiveExercise(null)}
            style={{ position: 'absolute', top: '14px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#0F766E', fontSize: '1.2rem', fontWeight: 800 }}
          >
            ✕
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Wind size={22} color="#0D9488" />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F766E', margin: 0 }}>
              {activeExercise.title} ({activeExercise.duration})
            </h4>
          </div>

          <p style={{ fontSize: '0.88rem', color: '#134E4A', marginBottom: '16px' }}>
            {activeExercise.description}
          </p>

          {activeExercise.id === 'box_breathing' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 0' }}>
              <div
                style={{
                  width: `${110 + (breathingProgress % 8) * 10}px`,
                  height: `${110 + (breathingProgress % 8) * 10}px`,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0D9488, #2DD4BF)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '1rem',
                  textAlign: 'center',
                  boxShadow: '0 8px 24px rgba(13, 148, 136, 0.35)',
                  transition: 'all 0.9s ease-in-out'
                }}
              >
                {breathingPhase.split(' ')[0]}
              </div>
              <div style={{ marginTop: '16px', fontWeight: 700, color: '#0F766E', fontSize: '1.1rem' }}>
                {breathingPhase}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeExercise.steps.map((st, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem', color: '#115E59' }}>
                  <span style={{ fontWeight: 800 }}>•</span>
                  <span>{st}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Chat Stream Container */}
      <div
        className="card"
        style={{
          height: '520px',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          overflow: 'hidden',
          background: '#FFFFFF'
        }}
      >
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isCrisis = msg.isCrisis;

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', maxWidth: '85%' }}>
                  {!isUser && (
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: isCrisis ? '#DC2626' : '#0D9488',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {isCrisis ? <ShieldAlert size={18} /> : <Bot size={18} />}
                    </div>
                  )}

                  <div
                    style={{
                      background: isUser
                        ? '#0F172A'
                        : isCrisis
                        ? '#FEF2F2'
                        : '#F1F5F9',
                      color: isUser ? '#FFFFFF' : isCrisis ? '#991B1B' : '#0F172A',
                      border: isCrisis ? '2px solid #FCA5A5' : 'none',
                      borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      padding: '14px 18px',
                      fontSize: '0.95rem',
                      lineHeight: 1.5,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                    }}
                  >
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>

                    {/* Crisis Support Card Display if Crisis Triggered */}
                    {isCrisis && msg.crisisData && (
                      <div style={{ marginTop: '14px', background: '#FFFFFF', border: '1px solid #F87171', borderRadius: '10px', padding: '14px' }}>
                        <div style={{ fontWeight: 800, color: '#B91C1C', fontSize: '0.92rem', marginBottom: '6px' }}>
                          Immediate Crisis Safety Support (Available 24/7 Free)
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                          {msg.crisisData.helplines?.map((hl) => (
                            <div key={hl.number} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span><strong>{hl.name}:</strong> {hl.type}</span>
                              <a
                                href={`tel:${hl.number}`}
                                style={{ background: '#DC2626', color: '#FFFFFF', padding: '4px 10px', borderRadius: '6px', textDecoration: 'none', fontWeight: 700 }}
                              >
                                {hl.number}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.72rem', color: isUser ? '#94A3B8' : '#64748B' }}>
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => speakText(msg.text)}
                          style={{ background: 'none', border: 'none', color: '#0D9488', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                          title="Read aloud"
                        >
                          <Volume2 size={13} /> Listen
                        </button>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: '#1E293B',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <User size={18} />
                    </div>
                  )}
                </div>

                {/* Quick Suggestion Chips if provided */}
                {!isUser && msg.quickReplies && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px', paddingLeft: '46px' }}>
                    {msg.quickReplies.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickReply(r)}
                        className="btn"
                        style={{
                          padding: '4px 12px',
                          minHeight: '30px',
                          fontSize: '0.78rem',
                          background: isCrisis ? '#FEE2E2' : '#F0FDFA',
                          color: isCrisis ? '#991B1B' : '#0F766E',
                          border: `1px solid ${isCrisis ? '#FCA5A5' : '#CCFBF1'}`,
                          borderRadius: '20px'
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '46px', color: '#64748B', fontSize: '0.85rem' }}>
              <span className="typing-dots">AURA is thinking with care...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{ display: 'flex', gap: '10px' }}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask AURA about medications, share your mood, or talk freely..."
              className="form-input"
              style={{ flex: 1, minHeight: '48px', fontSize: '0.95rem' }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ minHeight: '48px', padding: '0 24px' }}
              disabled={!inputMessage.trim()}
            >
              <Send size={18} />
              <span>Send</span>
            </button>
          </form>

          {/* Quick Conversation Starters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
            <span style={{ fontSize: '0.76rem', color: '#64748B', alignSelf: 'center' }}>Suggested:</span>
            {[
              'Did I take my morning pills?',
              'How are my medicine stocks?',
              'I feel a bit lonely today',
              'Can we do a breathing exercise?',
              'Give me today’s health summary'
            ].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSendMessage(s)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '16px',
                  padding: '4px 10px',
                  fontSize: '0.76rem',
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
