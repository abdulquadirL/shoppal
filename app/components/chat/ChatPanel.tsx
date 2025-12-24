"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { cn } from "@/lib/cn";
import { useSocket } from "@/hooks/useSocket";
import { Message } from "@/types/chat";
import { Button, Input } from "../ui";
import { ScrollArea } from "../ui/scroll-area";

interface ChatPanelProps {
  orderId: string;
}

export default function ChatPanel({ orderId }: ChatPanelProps) {
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  /* ---------------- Fetch messages ---------------- */
  useEffect(() => {
    axios
      .get(`/api/chat/messages?orderId=${orderId}`)
      .then(res => setMessages(res.data));
  }, [orderId]);

  /* ---------------- Socket logic ---------------- */
  useEffect(() => {
    if (!socket) return;

    socket.emit("join_order", orderId);

    socket.on("receive_message", (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on("typing", () => setTyping(true));
    socket.on("stop_typing", () => setTyping(false));

    return () => {
      socket.off("receive_message");
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, [socket, orderId]);

  /* ---------------- Auto scroll ---------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  /* ---------------- Send text ---------------- */
  async function sendMessage() {
    if (!text.trim()) return;

    socket?.emit("stop_typing", orderId);

    const { data } = await axios.post("/api/chat/messages", {
      orderId,
      content: text,
    });

    setMessages(prev => [...prev, data]);
    setText("");
  }

  /* ---------------- Typing ---------------- */
  function handleTyping(val: string) {
    setText(val);
    socket?.emit("typing", orderId);
    setTimeout(() => socket?.emit("stop_typing", orderId), 800);
  }

  /* ---------------- File upload ---------------- */
  async function handleFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("orderId", orderId);

    const { data } = await axios.post("/api/chat/upload", formData);
    socket?.emit("send_message", data);
  }

  /* ---------------- Voice note ---------------- */
  async function recordVoice() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      const file = new File([blob], "voice.webm");

      await handleFile(file);
    };

    recorder.start();
    setTimeout(() => recorder.stop(), 5000);
  }

  return (
    <div className="flex flex-col h-full border rounded-xl bg-background">
      <ScrollArea className="flex-1 p-4 space-y-3">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={cn(
              "max-w-[75%] p-2 rounded-lg text-sm",
              msg.senderRole === "customer"
                ? "bg-muted ml-auto"
                : "bg-primary text-primary-foreground"
            )}
          >
            {msg.text && <p>{msg.text}</p>}

            {msg.attachment && msg.attachment.endsWith(".webm") && (
              <audio controls src={msg.attachment} />
            )}

            {msg.attachment && !msg.attachment.endsWith(".webm") && (
              <Image
                src={msg.attachment}
                alt="attachment"
                width={180}
                height={180}
                className="rounded cursor-pointer"
                onClick={() => setPreview(msg.attachment ?? null)}
              />
            )}

            <p className="text-[10px] opacity-70 mt-1">
              {msg.readBy && msg.readBy.length > 1 ? "Seen" : "Delivered"}
            </p>
          </div>
        ))}

        {typing && <p className="text-xs italic">Typing...</p>}
        <div ref={bottomRef} />
      </ScrollArea>

      {/* ---------------- Input ---------------- */}
      <div className="p-3 border-t flex gap-2">
        <Input
          value={text}
          onChange={e => handleTyping(e.target.value)}
          placeholder="Type message..."
        />

        <Button onClick={sendMessage}>Send</Button>
        <Button variant="outline" onClick={recordVoice}>🎙</Button>

        <Input
          type="file"
          className="hidden"
          id="file"
          onChange={e => e.target.files && handleFile(e.target.files[0])}
        />
        <label htmlFor="file" className="cursor-pointer">📎</label>
      </div>

      {/* ---------------- Image lightbox ---------------- */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setPreview(null)}
        >
          <Image src={preview} alt="preview" width={500} height={500} />
        </div>
      )}
    </div>
  );
}
