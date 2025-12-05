import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Send, Bot, User } from 'lucide-react';
import { toast } from 'sonner';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function AICoach() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI fitness coach. Ask me anything about workouts, exercises, nutrition, or motivation!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: { messages: [...messages, userMessage] },
      });

      // Handle edge function errors (including 402)
      if (error) {
        const errorString = error.message || String(error);
        const isCreditsError = errorString.includes('402') || errorString.includes('credits') || errorString.includes('Payment');
        
        const errorMessage: Message = {
          role: 'assistant',
          content: isCreditsError
            ? "I'm currently unavailable because AI credits have run out. Please add credits to your Lovable workspace (Settings → Workspace → Usage) to continue chatting with me! 💪"
            : "Sorry, I'm having trouble connecting right now. Please try again later.",
        };
        setMessages((prev) => [...prev, errorMessage]);
        return;
      }

      // Handle application-level errors from the response
      if (data?.error) {
        const isCreditsError = data.error.includes('credits') || data.error.includes('Payment');
        const errorMessage: Message = {
          role: 'assistant',
          content: isCreditsError
            ? "I'm currently unavailable because AI credits have run out. Please add credits to your Lovable workspace (Settings → Workspace → Usage) to continue chatting with me! 💪"
            : data.error,
        };
        setMessages((prev) => [...prev, errorMessage]);
        return;
      }

      if (!data?.message) {
        const errorMessage: Message = {
          role: 'assistant',
          content: "Sorry, I couldn't generate a response. Please try again.",
        };
        setMessages((prev) => [...prev, errorMessage]);
        return;
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('AI Coach error:', error);
      const errorString = error?.message || String(error);
      const isCreditsError = errorString.includes('402') || errorString.includes('credits');
      
      const errorMessage: Message = {
        role: 'assistant',
        content: isCreditsError
          ? "I'm currently unavailable because AI credits have run out. Please add credits to your Lovable workspace (Settings → Workspace → Usage) to continue chatting with me! 💪"
          : "Sorry, something went wrong. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold">AI Coach</h1>
            <p className="text-muted-foreground">Your personal fitness assistant</p>
          </div>
          <Button variant="ghost" onClick={() => window.history.back()}>
            Back
          </Button>
        </div>

        <Card className="flex h-[calc(100vh-250px)] flex-col border-border bg-card/50 backdrop-blur-sm">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                      <Bot className="h-6 w-6" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-primary to-secondary text-background'
                        : 'border border-border bg-background/50'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-6 w-6" />
                    </div>
                  )}
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-border bg-background/50 px-6 py-4">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-primary animation-delay-200" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-primary animation-delay-400" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-border p-6">
            <div className="flex gap-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about exercises, nutrition, motivation..."
                className="flex-1 border-border bg-background/50"
                disabled={loading}
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-primary to-secondary"
                size="lg"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
