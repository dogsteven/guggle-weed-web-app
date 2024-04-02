"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { useEffect, useRef } from "react";
import { useAppStore } from "./app-store-provider";

type ChatMessage = {
  sender: string,
  message: string
}

export default function ChatBox() {
  const { message, chatMessages } = useAppStore((state) => state.chatBox);

  const enterMessage = useAppStore((state) => state.enterMessage);
  const sendChatMessage = useAppStore((state) => state.sendChatMessage);

  const messagesBoxRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messagesBoxRef.current) {
      messagesBoxRef.current.scrollTop = messagesBoxRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <>
      <div className="w-full">
        <h3 className="font-semibold">Chat box</h3>
      </div>

      <div ref={messagesBoxRef} className="flex flex-col flex-grow overflow-y-scroll my-6 gap-2">
        {
          chatMessages.map(({ sender, message }, index) => {
            return (
              <div className="flex flex-row w-full items-start gap-2" key={index}>
                <div className="font-bold">
                  {sender}:
                </div>
                <div className="flex-grow hyphens-auto">
                  {message}
                </div>
              </div>
            );
          })
        }
      </div>

      <div className="flex flex-row w-full gap-2">
        <Input
          ref={messageInputRef}
          value={message}
          placeholder="Enter your message"
          
          onChange={(event) => {
            enterMessage(event.target.value);
          }}

          onKeyUp={(event) => {
            if (event.key === "Enter") {
              sendChatMessage();
              messageInputRef.current?.focus();
            }
          }}
        />

        <div>
          <Button
            onClick={() => {
              sendChatMessage();
              messageInputRef.current?.focus();
            }}

            size="icon"

            className="rounded-full"
          >
            <PaperPlaneIcon />
          </Button>
        </div>
      </div>
    </>
  );
}