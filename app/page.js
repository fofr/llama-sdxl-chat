"use client";

import { useEffect, useRef, useState } from "react";
import ChatForm from "./components/ChatForm";
import Message from "./components/Message";
import SlideOver from "./components/SlideOver";
import EmptyState from "./components/EmptyState";
import { Cog6ToothIcon, CodeBracketIcon } from "@heroicons/react/20/solid";
import { useCompletion } from "ai/react";

const VERSIONS = [
  {
    name: "Llama 2 Prompter",
    version: "4f815ea4e4d6d070cd00469d1960c303f15b9b5634a8faa0a0f0136a93a8acd5",
    shortened: "prompter",
  },
];

export default function HomePage() {
  const bottomRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [llamaMessage, setLlamaMessage] = useState('')

  //   Llama params
  const [size, setSize] = useState(VERSIONS[0]);
  const [temp, setTemp] = useState(0.75);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(100);

  const { complete, completion, setInput, input } = useCompletion({
    api: "/api",
    body: {
      version: size.version,
      temperature: parseFloat(temp),
      topP: parseFloat(topP),
      maxTokens: parseInt(maxTokens),
    },
    onError: (error) => {
      setError(error);
    },
  });

  const setAndSubmitPrompt = (newPrompt) => {
    handleSubmit(newPrompt);
  };

  const handleSettingsSubmit = async (event) => {
    event.preventDefault();
    setOpen(false);
  };

  const handleSubmit = async (userMessage) => {
    const messageHistory = [...messages];
    if (llamaMessage.length > 0) {
      messageHistory.push({
        text: llamaMessage,
        isUser: false,
      });
    }
    messageHistory.push({
      text: userMessage,
      isUser: true,
    });

    const generatePrompt = (messages) => {
      const lastMessage = messages[messages.length - 1];
      return lastMessage.isUser ? `[PROMPT] ${lastMessage.text}` : `${lastMessage.text}`;
    };

    setMessages(messageHistory);
    complete(generatePrompt(messageHistory));
  };

  useEffect(() => {
    const promptIndex = completion.indexOf('[PROMPT]');
    // const bracketIndex = completion.indexOf('[');

    if (promptIndex !== -1) {
      const message = completion.slice(promptIndex + '[PROMPT]'.length);
      setLlamaMessage(message.trim());
    // } else if (bracketIndex == -1) {
    //   setLlamaMessage(completion.trim());
    } else {
      setLlamaMessage('');
    }
  }, [completion])

  useEffect(() => {
    if (messages?.length > 0 || completion?.length > 0) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, completion]);

  return (
    <>
      <div className="bg-slate-100 border-b-2 text-center p-3">
        <a
          href="https://replicate.com/blog/run-llama-2-with-an-api?utm_source=project&utm_campaign=llama2ai"
          target="_blank"
          className="underline"
        >
          Use Replicate to run and fine-tune Llama 2 in the cloud
        </a>
      </div>
      <nav className="grid grid-cols-2 pt-3 pl-6 pr-3 sm:grid-cols-3 sm:pl-0">
        <div className="hidden sm:inline-block"></div>
        <div className="font-semibold text-gray-500 sm:text-center">
          🦙🖌️ <span className="hidden sm:inline-block">Paint with Llama 2</span>
        </div>
        <div className="flex justify-end">
          <a
            className="inline-flex items-center px-3 py-2 mr-3 text-sm font-semibold text-gray-700 bg-white rounded-md shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            href="https://github.com/fofr/llama-sdxl-chat"
          >
            <CodeBracketIcon
              className="w-5 h-5 text-gray-500 sm:mr-2 group-hover:text-gray-900"
              aria-hidden="true"
            />{" "}
            <span className="hidden sm:inline">Clone on GitHub</span>
          </a>
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-900 bg-white rounded-md shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            onClick={() => setOpen(true)}
          >
            <Cog6ToothIcon
              className="w-5 h-5 text-gray-500 sm:mr-2 group-hover:text-gray-900"
              aria-hidden="true"
            />{" "}
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </nav>

      <main className="max-w-2xl pb-5 mx-auto mt-4 sm:px-4">
        <div className="text-center"></div>
        {messages.length == 0 && (
          <EmptyState setPrompt={setAndSubmitPrompt} setOpen={setOpen} />
        )}

        <SlideOver
          open={open}
          setOpen={setOpen}
          handleSubmit={handleSettingsSubmit}
          temp={temp}
          setTemp={setTemp}
          maxTokens={maxTokens}
          setMaxTokens={setMaxTokens}
          topP={topP}
          setTopP={setTopP}
          size={size}
          setSize={setSize}
        />

        <ChatForm prompt={input} setPrompt={setInput} onSubmit={handleSubmit} />

        {error && <div>{error}</div>}

        <article className="pb-24">
          {messages.map((message, index) => (
            <Message
              key={`message-${index}`}
              message={message.text}
              isUser={message.isUser}
            />
          ))}
          <Message message={llamaMessage} isUser={false} />
          <div ref={bottomRef} />
        </article>
      </main>
    </>
  );
}
