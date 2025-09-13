import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Send, Bot, User, X } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIChatbot() {
   const { user } = useAuth();

   // Only show chatbot for authenticated users
   if (!user) {
     return null;
   }

   console.log('🤖 AI Chatbot component rendered for user:', user.id);

   // Initialize Gemini
   const genAI = new GoogleGenerativeAI((import.meta as any).env.VITE_GEMINI_API_KEY);
   const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hello! I'm your disaster preparedness assistant. I can help you with emergency situations, safety procedures, and preparedness planning. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // default closed

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await model.generateContent(userMessage.content);
      const response = await result.response;
      const text = response.text();

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: text },
      ]);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <div
          className="fixed bottom-6 right-6 z-[10000] pointer-events-auto"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 10000,
            pointerEvents: 'auto'
          }}
        >
          <Button
            className="w-24 h-24 rounded-full
                       bg-gradient-to-r from-red-600 to-purple-600
                       hover:from-red-700 hover:to-purple-700
                       text-white shadow-2xl animate-bounce
                       border-4 border-yellow-400"
            onClick={() => setIsOpen(true)}
            style={{
              width: '96px',
              height: '96px',
              background: 'linear-gradient(to right, #dc2626, #9333ea)',
              border: '4px solid #fbbf24'
            }}
          >
            <Bot className="w-12 h-12" />
            <span className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 rounded-full animate-ping border-2 border-red-600"></span>
          </Button>
          <div
            className="absolute -bottom-10 left-1/2 transform -translate-x-1/2
                          bg-red-600 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap font-bold border-2 border-yellow-400"
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              fontSize: '14px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '2px solid #fbbf24',
              fontWeight: 'bold'
            }}
          >
            🚨 CLICK ME! AI Assistant
          </div>
        </div>
      )}

      {/* Floating chat window */}
      {isOpen && (
        <Card className="fixed bottom-20 right-6 w-80 h-96
                         bg-white border border-purple-200
                         rounded-2xl shadow-2xl z-[9999]">
          <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Bot className="w-4 h-4 text-purple-600" />
              AI Assistant
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-3">
            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-2 ${
                      message.role === 'user'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-purple-100 text-purple-600">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] p-2 rounded-lg text-sm ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.content}
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2 justify-start">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.1s' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2 pt-2 border-t">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask me something..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
