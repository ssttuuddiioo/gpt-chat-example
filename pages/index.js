import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import styles from "./index.module.css";

export default function Home() {
  const bottomRef = useRef(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);

  //set the first message on load
  useEffect(() => {
    setMessages([{ name: "💖", message: getGreeting() }]);
  }, [0]);

  //scroll to the bottom of the chat for new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function getGreeting() {
    const greetings = [
      
      "Hello love! Would you like to write a poem today?",
    ];
    const index = Math.floor(greetings.length * Math.random());
    return greetings[index];
  }

  async function onSubmit(event) {
    event.preventDefault();

    setMessages((prevMessages) => {
      const newMessages = [...prevMessages, { name: "Me", message: chatInput }];
      return newMessages;
    });

    // this is a hack bc I want to clear the form but messages doesn't update in time
    // bc async, fix this later
    const sentInput = chatInput;
    setChatInput("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat: [...messages, { name: "Me", message: sentInput }],
        }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }

      setMessages((prevMessages) => {
        const newMessages = [
          ...prevMessages,
          { name: "💖", message: data.result },
        ];
        return newMessages;
      });
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  const messageElements = messages.map((m, i) => {
    return (
      <div
        style={{
          background: m.name === "💖" ? "none" : "rgb(0 156 23 / 20%)",
        }}
        key={i}
        className={styles.message}
      >
        <div className={styles.messageName}>{m.name}</div>
        <div className={styles.messageContent}> {m.message}</div>
      </div>
    );
  });

  return (
    <div>
      <style global jsx>{`
        html,
        body,
        body > div:first-child,
        div#__next,
        div#__next > div {
          height: 100%;
          margin: 0px;
        }
      `}</style>
      <Head>
        <title>💖LoveBo</title>
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
           href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <main className={styles.main}>
        <h3>💖LoveBot</h3>
        <div className={styles.chat}>
          <div className={styles.chatDisplay}>
            {messageElements}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={onSubmit}>
            <input
              type="text"
              name="chat"
              placeholder="Write here"
              value={chatInput}
              onChange={(e) => {
                setChatInput(e.target.value);
              }}
            />
            <input type="submit" value="Submit" />
          </form>
        </div>
        <div className={styles.footer}>
          made with <a href="http://chemcreative.com">chemistry</a> 
           with repo by <a href="http://whichlight.com">whichlight</a> 
        </div>
      </main>
    </div>
  );
}
