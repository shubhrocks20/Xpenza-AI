import React, {  useState } from 'react';
// Assume these shadcn UI components exist or are substitutes
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

const AISuggest = () => {
  // State to manage sidebar collapse and input
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [input, setInput] = useState("");

  // Hardcoded prompt history
  const promptHistory = [
    "Discuss React hooks",
    "TailwindCSS guide",
    "TypeScript best practices",
    "Deploying Next.js app"
  ];

  // Use state for messages so UI re-renders on change
  const [messages, setMessages] = useState([
    { id: 1, sender: 'user', text: "Hello, can you explain React hooks?" },
    { id: 2, sender: 'assistant', text: "Sure! React hooks let you use state and other React features without writing a class." },
    { id: 3, sender: 'user', text: "What about useEffect?" },
    { id: 4, sender: 'assistant', text: "useEffect runs side effects in function components and can be tuned with dependency arrays." },
    { id: 5, sender: 'user', text: "Thanks, that explains a lot!" }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Update messages state so UI reflects changes
    setMessages([...messages, { id: messages.length + 1, sender: 'user', text: input }]);
    setInput("");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className={`bg-gray-50 border-r transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"}`}>
        <div className="p-4 flex flex-col h-full">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mb-4 p-2 border rounded hover:bg-gray-200"
          >
            {sidebarOpen ? "<" : ">"}
          </button>
          {sidebarOpen && (
            <>
              <h2 className="text-lg font-semibold mb-4">Conversations</h2>
              <ul className="flex-1 space-y-2">
                {promptHistory.map((prompt, idx) => (
                  <li key={idx} className="p-2 rounded hover:bg-gray-200 cursor-pointer">
                    {prompt}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <Button className="w-full mb-2 bg-green-500 hover:bg-green-600 text-white">
                  Upload
                </Button>
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                  New Chat
                </Button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Chat Panel */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 text-center font-bold">
          AI Chat
        </header>

        {/* Chat messages */}
        <main className="flex-1 p-4">
          <ScrollArea className="h-full pr-2">
            <div className="space-y-4">
              {messages.map((msg) => (
                <Card
                  key={msg.id}
                  className={`p-4 max-w-md rounded-lg shadow-md ${msg.sender === 'user' ? 'bg-blue-50 self-end' : 'bg-gray-100 self-start'}`}
                >
                  {/* ...message content... */}
                  <p>{msg.text}</p>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </main>

        {/* Sticky Input Field */}
        <footer className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <Button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Send
            </Button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default AISuggest;
