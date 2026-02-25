"use client"

import { useState, useRef, useEffect, useTransition } from "react"
import { getAiChatResponse } from "@/lib/actions" // -> We import our secure Server Action
import ReactMarkdown from "react-markdown" // -> We import the markdown renderer
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, User, X, Send, Loader2, Sparkles } from "lucide-react"

interface Message {
  role: 'user' | 'model';
  content: string;
}

export function AyurvedicChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Namaste! I am Aahaara AI, your personal Ayurvedic assistant. How can I help you today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isPending, startTransition] = useTransition(); // -> For Server Action loading state
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isPending) return;

    const userMessage: Message = { role: 'user', content: inputValue };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInputValue('');

    startTransition(async () => {
      try {
        // -> THE FIX: Call the secure server action instead of fetch
        const modelResponseText = await getAiChatResponse(newMessages);
        const modelMessage: Message = { role: 'model', content: modelResponseText };
        setMessages(prev => [...prev, modelMessage]);
      } catch (error) {
        console.error("Error in server action:", error);
        const errorMessage: Message = { role: 'model', content: "An unexpected error occurred." };
        setMessages(prev => [...prev, errorMessage]);
      }
    });
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button size="lg" className="rounded-full w-16 h-16 shadow-lg bg-primary hover:bg-primary/90" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
        </Button>
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50">
          <Card className="w-96 h-[600px] shadow-2xl border-border/50 flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="text-primary" /> Aahaara AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden p-0">
              <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                      {message.role === 'model' && (
                        <Avatar className="w-8 h-8"><AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-4 w-4"/></AvatarFallback></Avatar>
                      )}
                      <div className={`prose prose-sm max-w-[80%] p-3 rounded-lg ${message.role === 'user' ? 'bg-secondary text-secondary-foreground' : 'bg-muted'}`}>
                        {/* -> THE FIX: Render content using ReactMarkdown for beautiful formatting */}
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                      {message.role === 'user' && (
                        <Avatar className="w-8 h-8"><AvatarFallback><User className="h-4 w-4"/></AvatarFallback></Avatar>
                      )}
                    </div>
                  ))}
                  {isPending && (
                     <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8"><AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-4 w-4"/></AvatarFallback></Avatar>
                        <div className="max-w-[75%] p-3 rounded-lg bg-muted flex items-center"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
                <Input id="message" placeholder="Ask about Ayurveda..." className="flex-1" autoComplete="off" value={inputValue} onChange={(e) => setInputValue(e.target.value)} disabled={isPending} />
                <Button type="submit" size="icon" disabled={isPending || !inputValue.trim()}>
                  <Send className="h-4 w-4" /> <span className="sr-only">Send</span>
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  )
}

