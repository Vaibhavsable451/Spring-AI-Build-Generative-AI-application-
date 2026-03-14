import React, {
    useState,
    useRef,
    useEffect
} from "react";
import {
    TbRobot
} from "react-icons/tb";
import {
    FaUser
} from "react-icons/fa";
import {
    RiRobot3Fill
} from "react-icons/ri";
import {
    FiCopy,
    FiCheck,
    FiTrash2,
    FiClock,
    FiX
} from "react-icons/fi";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    Prism as SyntaxHighlighter
} from "react-syntax-highlighter";
import {
    vscDarkPlus
} from "react-syntax-highlighter/dist/esm/styles/prism";
import {
    CopyToClipboard
} from "react-copy-to-clipboard";

function App() {
    const userName = "Vaibhav";
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const chatEndRef = useRef(null);
    const hasAskedOnce = useRef(false);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const deleteMessage = (idx) => {
        setMessages((prev) => prev.filter((_, i) => i !== idx));
    };

    const clearChat = () => {
        if (messages.length > 0) {
            setHistory((prev) => [{
                    id: Date.now(),
                    timestamp: new Date().toLocaleString(),
                    title: messages.find((m) => m.from === userName)?.text?.slice(0, 40) ||
                        "New Chat",
                    messages: [...messages],
                },
                ...prev,
            ]);
        }
        setMessages([]);
        hasAskedOnce.current = false;
    };

    const loadHistory = (historyItem) => {
        setMessages(historyItem.messages);
        setShowHistory(false);
    };

    const deleteHistory = (id) => {
        setHistory((prev) => prev.filter((item) => item.id !== id));
    };

    const askQuestion = async (question, showUserMessage = true) => {
        if (!question.trim()) return;

        if (showUserMessage) {
            const userMessage = {
                from: userName,
                text: question,
            };
            setMessages((prev) => [...prev, userMessage]);
        }

        setLoading(true);

        try {
            const baseUrl = (
                process.env.REACT_APP_API_URL ||
                "https://spring-ai-build-generative-ai-application.onrender.com"
            ).replace(/\/+$/, "");

            const response = await axios.get(`${baseUrl}/user/chat`, {
                params: {
                    question
                },
                headers: {
                    Accept: "text/plain",
                },
            });

            const replyText =
                typeof response.data === "string" ?
                response.data.trim() :
                JSON.stringify(response.data, null, 2);

            const samReply = {
                from: "Kairo",
                text: replyText || "No response returned from server.",
            };

            setMessages((prev) => [...prev, samReply]);
        } catch (error) {
            console.error("API error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    from: "Kairo",
                    text: "Oops! Something went wrong while connecting to the server.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!hasAskedOnce.current) {
            askQuestion("Who are you?", false);
            hasAskedOnce.current = true;
        }
    }, []);

    const sendMessage = () => {
        if (!input.trim()) return;
        askQuestion(input);
        setInput("");
    };

    return (
        <div style={styles.page}>
            <div style={styles.backgroundGlow1}></div>
            <div style={styles.backgroundGlow2}></div>
            <div style={styles.backgroundGlow3}></div>

            {showHistory && (
                <div style={styles.historyOverlay}>
                    <div style={styles.historyPanel}>
                        <div style={styles.historyHeader}>
                            <div style={styles.historyHeaderLeft}>
                                <FiClock size={18} />
                                <h3 style={styles.historyTitle}>Chat History</h3>
                            </div>
                            <button onClick={() => setShowHistory(false)} style={styles.iconButton}>
                                <FiX size={18} />
                            </button>
                        </div>

                        <div style={styles.historyList}>
                            {history.length === 0 ? (
                                <div style={styles.emptyHistory}>No history yet</div>
                            ) : (
                                history.map((item) => (
                                    <div key={item.id} style={styles.historyItem}>
                                        <div style={styles.historyContent} onClick={() => loadHistory(item)}>
                                            <div style={styles.historyItemTitle}>{item.title}</div>
                                            <div style={styles.historyItemMeta}>
                                                {item.timestamp} • {item.messages.length} messages
                                            </div>
                                        </div>

                                        <div style={styles.historyItemActions}>
                                            <button onClick={() => loadHistory(item)} style={styles.historyLoadBtn}>
                                                Load
                                            </button>
                                            <button onClick={() => deleteHistory(item.id)} style={styles.historyDeleteBtn}>
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div style={styles.container}>
                <div style={styles.header}>
                    <div style={styles.logoBox}>
                        <RiRobot3Fill style={styles.logoIcon} />
                    </div>

                    <div style={styles.headerText}>
                        <h1 style={styles.title}>Kairo AI Chat</h1>
                        <p style={styles.subtitle}>Smart assistant • Markdown + Code Support</p>
                    </div>

                    <div style={styles.headerActions}>
                        <button onClick={() => setShowHistory(true)} style={styles.headerIconBtn} title="Chat history">
                            <FiClock size={18} />
                        </button>

                        <button onClick={clearChat} style={styles.headerIconBtn} title="Clear chat">
                            <FiTrash2 size={18} />
                        </button>
                    </div>
                </div>

                <div style={styles.chatBox}>
                    {messages.map((msg, idx) => {
                        const isUser = msg.from === userName;

                        return (
                            <div key={idx} style={{ ...styles.messageRow, justifyContent: isUser ? "flex-end" : "flex-start" }}>
                                {!isUser && (
                                    <div style={styles.botAvatar}>
                                        <TbRobot />
                                    </div>
                                )}

                                <div style={{ ...styles.messageBubble, ...(isUser ? styles.userBubble : styles.botBubble), position: "relative", paddingRight: "46px" }}>
                                    <div style={styles.messageSender}>{msg.from}</div>

                                    {isUser ? (
                                        <div style={styles.messageText}>{msg.text}</div>
                                    ) : (
                                        <MarkdownMessage content={msg.text} />
                                    )}

                                    <button onClick={() => deleteMessage(idx)} style={styles.deleteButton} title="Delete message">
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>

                                {isUser && (
                                    <div style={styles.userAvatar}>
                                        <FaUser />
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {loading && (
                        <div style={{ ...styles.messageRow, justifyContent: "flex-start" }}>
                            <div style={styles.botAvatar}>
                                <TbRobot />
                            </div>
                            <div style={{ ...styles.messageBubble, ...styles.botBubble }}>
                                <div style={styles.messageSender}>Kairo</div>
                                <TypingDots />
                            </div>
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                <div style={styles.inputArea}>
                    <input
                        style={styles.input}
                        type="text"
                        placeholder="Ask anything..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <button style={styles.button} onClick={sendMessage}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

function MarkdownMessage({ content }) {
    return (
        <div style={styles.markdownWrapper}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code({ inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        const language = match ? match[1] : "text";
                        const codeText = String(children).replace(/\n$/, "");

                        if (!inline) {
                            return <CodeBlock code={codeText} language={language} />;
                        }

                        return (
                            <code style={styles.inlineCode} {...props}>
                                {children}
                            </code>
                        );
                    },
                    p({ children }) {
                        return <p style={styles.paragraph}>{children}</p>;
                    },
                    ul({ children }) {
                        return <ul style={styles.ul}>{children}</ul>;
                    },
                    ol({ children }) {
                        return <ol style={styles.ol}>{children}</ol>;
                    },
                    li({ children }) {
                        return <li style={styles.li}>{children}</li>;
                    },
                    table({ children }) {
                        return (
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>{children}</table>
                            </div>
                        );
                    },
                    th({ children }) {
                        return <th style={styles.th}>{children}</th>;
                    },
                    td({ children }) {
                        return <td style={styles.td}>{children}</td>;
                    },
                    blockquote({ children }) {
                        return <blockquote style={styles.blockquote}>{children}</blockquote>;
                    },
                    h1({ children }) {
                        return <h1 style={styles.h1}>{children}</h1>;
                    },
                    h2({ children }) {
                        return <h2 style={styles.h2}>{children}</h2>;
                    },
                    h3({ children }) {
                        return <h3 style={styles.h3}>{children}</h3>;
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

function CodeBlock({ code, language }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={styles.codeBlockContainer}>
            <div style={styles.codeHeader}>
                <span style={styles.codeLang}>{language}</span>
                <CopyToClipboard text={code} onCopy={handleCopy}>
                    <button style={styles.copyBtn}>
                        {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                        <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                </CopyToClipboard>
            </div>

            <SyntaxHighlighter language={language} style={vscDarkPlus} customStyle={styles.syntaxContent}>
                {code}
            </SyntaxHighlighter>
        </div>
    );
}

function TypingDots() {
    return (
        <div style={styles.typing}>
            <span style={styles.dot}></span>
            <span style={styles.dot}></span>
            <span style={styles.dot}></span>
        </div>
    );
}

const styles = {
    page: {
        width: "100vw",
        height: "100vh",
        background: "#0a0b10",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
        fontFamily: "'Inter', sans-serif",
        color: "#fff",
    },
    backgroundGlow1: {
        position: "absolute",
        width: "500px",
        height: "500px",
        background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
        top: "-100px",
        right: "-100px",
    },
    backgroundGlow2: {
        position: "absolute",
        width: "600px",
        height: "600px",
        background: "radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)",
        bottom: "-150px",
        left: "-150px",
    },
    backgroundGlow3: {
        position: "absolute",
        width: "400px",
        height: "400px",
        background: "radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)",
        top: "40%",
        left: "20%",
    },
    container: {
        width: "90%",
        maxWidth: "1000px",
        height: "85vh",
        background: "rgba(23, 25, 35, 0.8)",
        backdropFilter: "blur(20px)",
        borderRadius: "24px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        zIndex: 10,
    },
    header: {
        padding: "20px 30px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        alignItems: "center",
        gap: "15px",
    },
    logoBox: {
        width: "45px",
        height: "45px",
        background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 16px rgba(99, 102, 241, 0.3)",
    },
    logoIcon: {
        fontSize: "24px",
        color: "#fff",
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: "20px",
        fontWeight: "700",
        margin: 0,
        background: "linear-gradient(to right, #fff, #cbd5e1)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
    },
    subtitle: {
        fontSize: "12px",
        color: "#94a3b8",
        margin: "2px 0 0 0",
    },
    headerActions: {
        display: "flex",
        gap: "10px",
    },
    headerIconBtn: {
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        color: "#94a3b8",
        width: "38px",
        height: "38px",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    chatBox: {
        flex: 1,
        overflowY: "auto",
        padding: "30px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        scrollBehavior: "smooth",
    },
    messageRow: {
        display: "flex",
        gap: "12px",
        width: "100%",
    },
    botAvatar: {
        width: "36px",
        height: "36px",
        borderRadius: "10px",
        background: "rgba(99, 102, 241, 0.1)",
        border: "1px solid rgba(99, 102, 241, 0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#818cf8",
        fontSize: "18px",
        flexShrink: 0,
    },
    userAvatar: {
        width: "36px",
        height: "36px",
        borderRadius: "10px",
        background: "rgba(168, 85, 247, 0.1)",
        border: "1px solid rgba(168, 85, 247, 0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#c084fc",
        fontSize: "16px",
        flexShrink: 0,
    },
    messageBubble: {
        maxWidth: "80%",
        padding: "16px 20px",
        borderRadius: "18px",
        fontSize: "15px",
        lineHeight: "1.6",
    },
    botBubble: {
        background: "rgba(30, 41, 59, 0.5)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        color: "#e2e8f0",
        borderTopLeftRadius: "2px",
    },
    userBubble: {
        background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
        color: "#fff",
        borderTopRightRadius: "2px",
        boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.2)",
    },
    messageSender: {
        fontSize: "11px",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        marginBottom: "6px",
        opacity: "0.6",
    },
    messageText: {
        whiteSpace: "pre-wrap",
    },
    deleteButton: {
        position: "absolute",
        top: "10px",
        right: "10px",
        background: "transparent",
        border: "none",
        color: "rgba(255, 255, 255, 0.3)",
        cursor: "pointer",
        padding: "5px",
        borderRadius: "5px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    inputArea: {
        padding: "25px 30px",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        gap: "15px",
    },
    input: {
        flex: 1,
        background: "rgba(15, 23, 42, 0.6)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "14px",
        padding: "14px 20px",
        color: "#fff",
        fontSize: "15px",
        outline: "none",
        transition: "all 0.2s ease",
    },
    button: {
        background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
        color: "#fff",
        border: "none",
        borderRadius: "14px",
        padding: "0 25px",
        fontSize: "15px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.2)",
    },
    markdownWrapper: {
        overflowWrap: "anywhere",
    },
    paragraph: {
        margin: "0 0 12px 0",
    },
    ul: {
        margin: "0 0 12px 20px",
        padding: 0,
    },
    ol: {
        margin: "0 0 12px 20px",
        padding: 0,
    },
    li: {
        marginBottom: "6px",
    },
    inlineCode: {
        background: "rgba(255, 255, 255, 0.1)",
        padding: "2px 6px",
        borderRadius: "4px",
        fontSize: "0.9em",
        fontFamily: "monospace",
        color: "#818cf8",
    },
    codeBlockContainer: {
        margin: "15px 0",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.1)",
    },
    codeHeader: {
        background: "#1e1e2e",
        padding: "8px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    },
    codeLang: {
        fontSize: "12px",
        color: "#94a3b8",
        textTransform: "uppercase",
        fontWeight: "600",
    },
    copyBtn: {
        background: "transparent",
        border: "none",
        color: "#94a3b8",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "11px",
        cursor: "pointer",
        padding: "4px 8px",
        borderRadius: "4px",
        transition: "all 0.2s ease",
    },
    syntaxContent: {
        margin: 0,
        padding: "20px",
        fontSize: "14px",
        lineHeight: "1.5",
    },
    tableWrapper: {
        overflowX: "auto",
        margin: "15px 0",
        borderRadius: "10px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "14px",
    },
    th: {
        background: "rgba(255, 255, 255, 0.05)",
        padding: "12px 15px",
        textAlign: "left",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        color: "#94a3b8",
    },
    td: {
        padding: "10px 15px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    },
    blockquote: {
        margin: "15px 0",
        padding: "10px 20px",
        borderLeft: "4px solid #6366f1",
        background: "rgba(99, 102, 241, 0.05)",
        borderRadius: "0 8px 8px 0",
        color: "#cbd5e1",
        fontStyle: "italic",
    },
    h1: {
        fontSize: "22px",
        margin: "20px 0 10px 0",
    },
    h2: {
        fontSize: "18px",
        margin: "18px 0 10px 0",
    },
    h3: {
        fontSize: "16px",
        margin: "16px 0 8px 0",
    },
    typing: {
        display: "flex",
        gap: "4px",
        padding: "4px 0",
    },
    dot: {
        width: "6px",
        height: "6px",
        background: "#94a3b8",
        borderRadius: "50%",
    },
    historyOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.4)",
        zIndex: 50,
        display: "flex",
        justifyContent: "flex-end",
    },
    historyPanel: {
        width: "350px",
        height: "100%",
        background: "#171923",
        borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
        display: "flex",
        flexDirection: "column",
    },
    historyHeader: {
        padding: "20px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    historyHeaderLeft: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        color: "#94a3b8",
    },
    historyTitle: {
        fontSize: "16px",
        fontWeight: "600",
        margin: 0,
    },
    historyList: {
        flex: 1,
        overflowY: "auto",
        padding: "15px",
    },
    emptyHistory: {
        textAlign: "center",
        color: "#4a5568",
        marginTop: "40px",
        fontSize: "14px",
    },
    historyItem: {
        padding: "15px",
        borderRadius: "12px",
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        marginBottom: "12px",
        transition: "all 0.2s ease",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    historyContent: {
        cursor: "pointer",
    },
    historyItemTitle: {
        fontSize: "14px",
        fontWeight: "600",
        marginBottom: "5px",
        color: "#e2e8f0",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    historyItemMeta: {
        fontSize: "11px",
        color: "#718096",
    },
    historyItemActions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        paddingTop: "10px",
    },
    historyLoadBtn: {
        fontSize: "12px",
        padding: "4px 10px",
        background: "rgba(99, 102, 241, 0.1)",
        border: "1px solid rgba(99, 102, 241, 0.2)",
        color: "#818cf8",
        borderRadius: "6px",
        cursor: "pointer",
    },
    historyDeleteBtn: {
        background: "transparent",
        border: "none",
        color: "#e53e3e",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        opacity: 0.6,
    },
    iconButton: {
        background: "transparent",
        border: "none",
        color: "#94a3b8",
        cursor: "pointer",
    },
};

export default App;