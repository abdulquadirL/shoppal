"use client";

import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Message } from "@/types/chat";
import { Avatar, Input, Button } from "@/app/components/ui";
import { cn } from "@/lib/cn";

interface ChatPanelProps {
  orderId: string;
  currentUserId: string;
}

export function ChatPanel({ orderId, currentUserId }: ChatPanelProps) {
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    fetch(`/api/chat/messages?orderId=${orderId}`)
      .then((res) => res.json())
      .then((data: Message[]) => setMessages(data));
  }, [orderId]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("join_order", orderId);

    socket.on("receive_message", (msg: Message) => {
      if (msg.senderRole === "system") return; // optionally ignore system messages
      setMessages(prev => [...prev, { ...msg, readBy: msg.readBy ?? [] }]);
      scrollToBottom();

      if (msg.senderId !== currentUserId) {
        socket.emit("read_message", { messageId: msg.id, userId: currentUserId });
      }
    });

    socket.on("typing", ({ userId }) => {
      if (userId !== currentUserId) setTypingUsers(prev => Array.from(new Set([...prev, userId])));
    });

    socket.on("stop_typing", ({ userId }) => {
      setTypingUsers(prev => prev.filter(id => id !== userId));
    });

    socket.on("message_read", ({ messageId, userId }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, readBy: Array.from(new Set([...(msg.readBy || []), userId])) }
            : msg
        )
      );
    });

    return () => {
      socket.off("receive_message");
      socket.off("typing");
      socket.off("stop_typing");
      socket.off("message_read");
    };
  }, [socket, orderId, currentUserId]);

  const handleSend = (attachmentUrl?: string) => {
    if (!newMessage.trim() && !attachmentUrl) return;

    const msg: Message = {
      id: crypto.randomUUID(),
      orderId,
      senderId: currentUserId,
      senderRole: "customer",
      text: newMessage || null,
      attachment: attachmentUrl || null,
      createdAt: new Date().toISOString(),
      readBy: [],
    };

    socket?.emit("send_message", msg);
    setMessages(prev => [...prev, msg]);
    setNewMessage("");
    scrollToBottom();
    socket?.emit("stop_typing", { orderId, userId: currentUserId });
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    if (!socket) return;
    value.length
      ? socket.emit("typing", { orderId, userId: currentUserId })
      : socket.emit("stop_typing", { orderId, userId: currentUserId });
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/chat/upload", { method: "POST", body: formData });
    const data = await res.json();
    handleSend(data.url);
  };

  return (
    <div className="flex flex-col h-full border rounded-lg bg-white shadow-sm overflow-hidden">
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={cn(
              "flex items-start space-x-2",
              msg.senderId === currentUserId ? "justify-end" : "justify-start"
            )}
          >
            {msg.senderId !== currentUserId && <Avatar />}
            <div className="flex flex-col max-w-xs">
              {msg.text && (
                <div
                  className={cn(
                    "rounded-lg p-2 text-sm",
                    msg.senderId === currentUserId ? "bg-black text-white self-end" : "bg-gray-200 text-black"
                  )}
                >
                  {msg.text}
                </div>
              )}
              {msg.attachment && <img src={msg.attachment} alt="attachment" className="rounded-md mt-1 max-h-48" />}
              {msg.readBy.length > 0 && msg.senderId === currentUserId && (
                <div className="text-xs text-gray-400 self-end mt-1">
                  Seen by {msg.readBy.length} user{msg.readBy.length > 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>
        ))}
        {typingUsers.length > 0 && <div className="text-sm text-gray-500">{typingUsers.join(", ")} typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={e => handleTyping(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
        />
        <div className="flex space-x-2">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={e => e.target.files && handleFileUpload(e.target.files[0])}
          />
          <label htmlFor="file-upload" className="cursor-pointer bg-gray-200 px-3 py-1 rounded-md text-sm hover:bg-gray-300">
            📎
          </label>
          <Button onClick={() => handleSend()}>Send</Button>
        </div>
      </div>
    </div>
  );
}
