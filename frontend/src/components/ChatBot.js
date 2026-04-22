import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react'; 
import { useAuth } from '../context/AuthContext'; 
import { useNavigate } from 'react-router-dom'; 

const ChatBot = () => {
  const { user } = useAuth(); 
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! 👋 I'm the PlantShop Assistant. You can ask me about Shipping, Returns, Care, or Order Tracking!", sender: 'bot' }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

 
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  if (user?.role === 'admin') {
    return null;
  }

  // 🤖 CHAT LOGIC
  const getBotResponse = (text) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('hello') || lowerText.includes('hi')) 
      return "Hello there! How can I help you today? 🌱";
    
    if (lowerText.includes('price') || lowerText.includes('cost')) 
      return "Our plants start from just ₹199! Check the Products page.";
    
    if (lowerText.includes('ship') || lowerText.includes('deliver')) 
      return "We ship within 24 hours! 🚚 Delivery takes 3-5 days.";
    
    if (lowerText.includes('return') || lowerText.includes('refund')) 
      return "If damaged, email a photo within 7 days. 🔄";
    
    if (lowerText.includes('contact') || lowerText.includes('call')) 
      return "Support: support@plantshop.com or +91-9999999999. 📞";
    
    return "I'm sorry, I didn't catch that. Try asking about Shipping, Returns, or Care.";
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!user) {
      const userMessage = { text: input, sender: 'user' };
      const botReply = { text: "⚠️ Login Required: Please login to chat with our assistant.", sender: 'bot' };
      
      setMessages((prev) => [...prev, userMessage, botReply]);
      setInput("");
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    const userMessage = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setTimeout(() => {
      const botReply = { text: getBotResponse(userMessage.text), sender: 'bot' };
      setMessages((prev) => [...prev, botReply]);
    }, 600);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: '30px', right: '30px',
          backgroundColor: 'var(--primary-color)', color: 'white',
          border: 'none', borderRadius: '50%', width: '65px', height: '65px',
          cursor: 'pointer', boxShadow: '0 6px 15px rgba(211, 84, 0, 0.4)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '110px', right: '30px',
          width: '340px', height: '480px', backgroundColor: 'var(--card-bg)',
          borderRadius: 'var(--border-radius)', 
          boxShadow: '0 10px 30px rgba(62, 39, 35, 0.25)',
          display: 'flex', flexDirection: 'column', zIndex: 9999, overflow: 'hidden',
          border: '3px solid var(--accent-color)'
        }}>
          <div style={{ 
            backgroundColor: 'var(--secondary-color)', padding: '18px', 
            color: 'var(--accent-color)', fontFamily: 'Fraunces, serif', 
            fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '3px solid var(--accent-color)'
          }}>
            🌱 PlantShop Help
          </div>

          <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#fbf8e8' }}>
            {messages.map((msg, index) => (
              <div key={index} style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.sender === 'user' ? 'var(--primary-color)' : 'white',
                color: msg.sender === 'user' ? 'white' : 'var(--text-color)',
                border: msg.sender === 'bot' ? '2px solid var(--accent-color)' : 'none',
                padding: '12px 16px', borderRadius: '15px', maxWidth: '85%',
                whiteSpace: 'pre-line', fontFamily: 'Quicksand, sans-serif', fontWeight: '600'
              }}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', padding: '15px', borderTop: '2px solid rgba(0,0,0,0.05)', background: 'white' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about shipping, care..."
              style={{ flex: 1, padding: '12px', borderRadius: '25px', border: '2px solid #ddd', outline: 'none' }}
            />
            <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '10px', color: 'var(--primary-color)' }}>
              <Send size={28} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;