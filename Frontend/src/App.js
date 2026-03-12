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
            const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:8080";
            const response = await axios.get(`${baseUrl}/user/chat`, {
                params: {
                    question
                },
                headers: {
                    Accept: "application/json",
                },
            });

            const samReply = {
                from: "Kairo",
                text: typeof response.data === "string" ?
                    response.data : JSON.stringify(response.data, null, 2),
            };

            setMessages((prev) => [...prev, samReply]);
        } catch (error) {
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

    return ( <
        div style = {
            styles.page
        } >
        <
        div style = {
            styles.backgroundGlow1
        } > < /div> <
        div style = {
            styles.backgroundGlow2
        } > < /div> <
        div style = {
            styles.backgroundGlow3
        } > < /div>

        {
            showHistory && ( <
                div style = {
                    styles.historyOverlay
                } >
                <
                div style = {
                    styles.historyPanel
                } >
                <
                div style = {
                    styles.historyHeader
                } >
                <
                div style = {
                    styles.historyHeaderLeft
                } >
                <
                FiClock size = {
                    18
                }
                /> <
                h3 style = {
                    styles.historyTitle
                } > Chat History < /h3> < /
                div >

                <
                button onClick = {
                    () => setShowHistory(false)
                }
                style = {
                    styles.iconButton
                } >
                <
                FiX size = {
                    18
                }
                /> < /
                button > <
                /div>

                <
                div style = {
                    styles.historyList
                } > {
                    history.length === 0 ? ( <
                        div style = {
                            styles.emptyHistory
                        } > No history yet < /div>
                    ) : (
                        history.map((item) => ( <
                            div key = {
                                item.id
                            }
                            style = {
                                styles.historyItem
                            } >
                            <
                            div style = {
                                styles.historyContent
                            }
                            onClick = {
                                () => loadHistory(item)
                            } >
                            <
                            div style = {
                                styles.historyItemTitle
                            } > {
                                item.title
                            } < /div> <
                            div style = {
                                styles.historyItemMeta
                            } > {
                                item.timestamp
                            }â€¢ {
                                item.messages.length
                            }
                            messages <
                            /div> < /
                            div >

                            <
                            div style = {
                                styles.historyItemActions
                            } >
                            <
                            button onClick = {
                                () => loadHistory(item)
                            }
                            style = {
                                styles.historyLoadBtn
                            } >
                            Load <
                            /button> <
                            button onClick = {
                                () => deleteHistory(item.id)
                            }
                            style = {
                                styles.historyDeleteBtn
                            } >
                            <
                            FiTrash2 size = {
                                14
                            }
                            /> < /
                            button > <
                            /div> < /
                            div >
                        ))
                    )
                } <
                /div> < /
                div > <
                /div>
            )
        }

        <
        div style = {
            styles.container
        } >
        <
        div style = {
            styles.header
        } >
        <
        div style = {
            styles.logoBox
        } >
        <
        RiRobot3Fill style = {
            styles.logoIcon
        }
        /> < /
        div >

        <
        div style = {
            styles.headerText
        } >
        <
        h1 style = {
            styles.title
        } > Kairo AI Chat < /h1> <
        p style = {
            styles.subtitle
        } >
        Smart assistantâ€¢ Markdown + Code Support <
        /p> < /
        div >

        <
        div style = {
            styles.headerActions
        } >
        <
        button onClick = {
            () => setShowHistory(true)
        }
        style = {
            styles.headerIconBtn
        }
        title = "Chat history" >
        <
        FiClock size = {
            18
        }
        /> < /
        button >

        <
        button onClick = {
            clearChat
        }
        style = {
            styles.headerIconBtn
        }
        title = "Clear chat" >
        <
        FiTrash2 size = {
            18
        }
        /> < /
        button > <
        /div> < /
        div >

        <
        div style = {
            styles.chatBox
        } > {
            messages.map((msg, idx) => {
                const isUser = msg.from === userName;

                return ( <
                    div key = {
                        idx
                    }
                    style = {
                        {
                            ...styles.messageRow,
                            justifyContent: isUser ? "flex-end" : "flex-start",
                        }
                    } > {
                        !isUser && ( <
                            div style = {
                                styles.botAvatar
                            } >
                            <
                            TbRobot / >
                            <
                            /div>
                        )
                    }

                    <
                    div style = {
                        {
                            ...styles.messageBubble,
                            ...(isUser ? styles.userBubble : styles.botBubble),
                            position: "relative",
                            paddingRight: "46px",
                        }
                    } >
                    <
                    div style = {
                        styles.messageSender
                    } > {
                        msg.from
                    } < /div>

                    {
                        isUser ? ( <
                            div style = {
                                styles.messageText
                            } > {
                                msg.text
                            } < /div>
                        ) : ( <
                            MarkdownMessage content = {
                                msg.text
                            }
                            />
                        )
                    }

                    <
                    button onClick = {
                        () => deleteMessage(idx)
                    }
                    style = {
                        styles.deleteButton
                    }
                    title = "Delete message" >
                    <
                    FiTrash2 size = {
                        14
                    }
                    /> < /
                    button > <
                    /div>

                    {
                        isUser && ( <
                            div style = {
                                styles.userAvatar
                            } >
                            <
                            FaUser / >
                            <
                            /div>
                        )
                    } <
                    /div>
                );
            })
        }

        {
            loading && ( <
                div style = {
                    {
                        ...styles.messageRow,
                        justifyContent: "flex-start"
                    }
                } >
                <
                div style = {
                    styles.botAvatar
                } >
                <
                TbRobot / >
                <
                /div> <
                div style = {
                    {
                        ...styles.messageBubble,
                        ...styles.botBubble
                    }
                } >
                <
                div style = {
                    styles.messageSender
                } > Kairo < /div> <
                TypingDots / >
                <
                /div> < /
                div >
            )
        }

        <
        div ref = {
            chatEndRef
        }
        /> < /
        div >

        <
        div style = {
            styles.inputArea
        } >
        <
        input style = {
            styles.input
        }
        type = "text"
        placeholder = "Ask anything..."
        value = {
            input
        }
        onChange = {
            (e) => setInput(e.target.value)
        }
        onKeyDown = {
            (e) => e.key === "Enter" && sendMessage()
        }
        /> <
        button style = {
            styles.button
        }
        onClick = {
            sendMessage
        } >
        Send <
        /button> < /
        div > <
        /div> < /
        div >
    );
}

function MarkdownMessage({
    content
}) {
    return ( <
        div style = {
            styles.markdownWrapper
        } >
        <
        ReactMarkdown remarkPlugins = {
            [remarkGfm]
        }
        components = {
            {
                code({
                        inline,
                        className,
                        children,
                        ...props
                    }) {
                        const match = /language-(\w+)/.exec(className || "");
                        const language = match ? match[1] : "text";
                        const codeText = String(children).replace(/\n$/, "");

                        if (!inline) {
                            return <CodeBlock code = {
                                codeText
                            }
                            language = {
                                language
                            }
                            />;
                        }

                        return ( <
                            code style = {
                                styles.inlineCode
                            } {
                                ...props
                            } > {
                                children
                            } <
                            /code>
                        );
                    },
                    p({
                        children
                    }) {
                        return <p style = {
                            styles.paragraph
                        } > {
                            children
                        } < /p>;
                    },
                    ul({
                        children
                    }) {
                        return <ul style = {
                            styles.ul
                        } > {
                            children
                        } < /ul>;
                    },
                    ol({
                        children
                    }) {
                        return <ol style = {
                            styles.ol
                        } > {
                            children
                        } < /ol>;
                    },
                    li({
                        children
                    }) {
                        return <li style = {
                            styles.li
                        } > {
                            children
                        } < /li>;
                    },
                    table({
                        children
                    }) {
                        return ( <
                            div style = {
                                styles.tableWrapper
                            } >
                            <
                            table style = {
                                styles.table
                            } > {
                                children
                            } < /table> < /
                            div >
                        );
                    },
                    th({
                        children
                    }) {
                        return <th style = {
                            styles.th
                        } > {
                            children
                        } < /th>;
                    },
                    td({
                        children
                    }) {
                        return <td style = {
                            styles.td
                        } > {
                            children
                        } < /td>;
                    },
                    blockquote({
                        children
                    }) {
                        return <blockquote style = {
                            styles.blockquote
                        } > {
                            children
                        } < /blockquote>;
                    },
                    h1({
                        children
                    }) {
                        return <h1 style = {
                            styles.h1
                        } > {
                            children
                        } < /h1>;
                    },
                    h2({
                        children
                    }) {
                        return <h2 style = {
                            styles.h2
                        } > {
                            children
                        } < /h2>;
                    },
                    h3({
                        children
                    }) {
                        return <h3 style = {
                            styles.h3
                        } > {
                            children
                        } < /h3>;
                    },
            }
        } > {
            content
        } <
        /ReactMarkdown> < /
        div >
    );
}

function CodeBlock({
    code,
    language
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return ( <
        div style = {
            styles.codeBlockWrapper
        } >
        <
        div style = {
            styles.codeHeader
        } >
        <
        span style = {
            styles.codeLanguage
        } > {
            language && language !== "text" ? language : "code"
        } <
        /span>

        <
        CopyToClipboard text = {
            code
        }
        onCopy = {
            handleCopy
        } >
        <
        button style = {
            styles.copyButton
        } > {
            copied ? < FiCheck size = {
                16
            }
            /> : <FiCopy size={16} / >
        } <
        span > {
            copied ? "Copied" : "Copy"
        } < /span> < /
        button > <
        /CopyToClipboard> < /
        div >

        <
        SyntaxHighlighter language = {
            language
        }
        style = {
            vscDarkPlus
        }
        customStyle = {
            styles.syntaxHighlighter
        }
        wrapLongLines = {
            true
        } > {
            code
        } <
        /SyntaxHighlighter> < /
        div >
    );
}

function TypingDots() {
    return ( <
        div style = {
            styles.typingDots
        } >
        <
        span style = {
            styles.dot
        } > < /span> <
        span style = {
            styles.dot
        } > < /span> <
        span style = {
            styles.dot
        } > < /span> < /
        div >
    );
}

const styles = {
    page: {
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "radial-gradient(circle at top left, #12254a 0%, #0f172a 30%, #111827 65%, #1e1b4b 100%)",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        position: "fixed",
        top: 0,
        left: 0,
        overflow: "hidden",
    },

    backgroundGlow1: {
        position: "absolute",
        width: "420px",
        height: "420px",
        borderRadius: "50%",
        background: "rgba(59,130,246,0.18)",
        top: "5%",
        left: "5%",
        filter: "blur(100px)",
    },

    backgroundGlow2: {
        position: "absolute",
        width: "380px",
        height: "380px",
        borderRadius: "50%",
        background: "rgba(168,85,247,0.16)",
        bottom: "8%",
        right: "8%",
        filter: "blur(100px)",
    },

    backgroundGlow3: {
        position: "absolute",
        width: "260px",
        height: "260px",
        borderRadius: "50%",
        background: "rgba(14,165,233,0.12)",
        bottom: "20%",
        left: "30%",
        filter: "blur(90px)",
    },

    container: {
        width: "96vw",
        height: "94vh",
        maxWidth: "1500px",
        display: "flex",
        flexDirection: "column",
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "28px",
        boxShadow: "0 25px 80px rgba(0,0,0,0.35)",
        padding: "24px",
        position: "relative",
        zIndex: 2,
    },

    header: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        marginBottom: "18px",
        paddingBottom: "16px",
        borderBottom: "1px solid rgba(255,255,255,0.10)",
        flexShrink: 0,
    },

    logoBox: {
        width: "64px",
        height: "64px",
        borderRadius: "20px",
        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: "0 10px 30px rgba(59,130,246,0.35)",
        flexShrink: 0,
    },

    logoIcon: {
        fontSize: "32px",
        color: "#fff",
    },

    headerText: {
        minWidth: 0,
    },

    headerActions: {
        marginLeft: "auto",
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },

    headerIconBtn: {
        width: "42px",
        height: "42px",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.08)",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
    },

    title: {
        margin: 0,
        color: "#ffffff",
        fontSize: "clamp(28px, 3vw, 42px)",
        fontWeight: "800",
        letterSpacing: "0.3px",
    },

    subtitle: {
        margin: "4px 0 0 0",
        color: "rgba(255,255,255,0.72)",
        fontSize: "15px",
    },

    chatBox: {
        flex: 1,
        overflowY: "auto",
        padding: "20px",
        borderRadius: "22px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        minHeight: 0,
    },

    messageRow: {
        display: "flex",
        alignItems: "flex-end",
        gap: "12px",
        marginBottom: "18px",
    },

    botAvatar: {
        width: "42px",
        height: "42px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #2563eb, #7c3aed)",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "20px",
        flexShrink: 0,
        boxShadow: "0 8px 18px rgba(37,99,235,0.35)",
    },

    userAvatar: {
        width: "42px",
        height: "42px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #22c55e, #14b8a6)",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "18px",
        flexShrink: 0,
        boxShadow: "0 8px 18px rgba(34,197,94,0.35)",
    },

    messageBubble: {
        maxWidth: "78%",
        padding: "16px 18px",
        borderRadius: "20px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        wordBreak: "break-word",
    },

    botBubble: {
        background: "rgba(255,255,255,0.10)",
        color: "#f8fafc",
        borderTopLeftRadius: "8px",
        border: "1px solid rgba(255,255,255,0.08)",
    },

    userBubble: {
        background: "linear-gradient(135deg, #22c55e, #14b8a6)",
        color: "#ffffff",
        borderTopRightRadius: "8px",
    },

    deleteButton: {
        position: "absolute",
        top: "10px",
        right: "10px",
        width: "26px",
        height: "26px",
        borderRadius: "8px",
        border: "none",
        background: "rgba(0,0,0,0.18)",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
    },

    messageSender: {
        fontSize: "13px",
        fontWeight: "700",
        marginBottom: "8px",
        opacity: 0.9,
    },

    messageText: {
        fontSize: "15px",
        lineHeight: "1.7",
        whiteSpace: "pre-wrap",
    },

    markdownWrapper: {
        fontSize: "15px",
        lineHeight: "1.75",
    },

    paragraph: {
        margin: "0 0 12px 0",
    },

    ul: {
        margin: "8px 0 12px 20px",
        padding: 0,
    },

    ol: {
        margin: "8px 0 12px 20px",
        padding: 0,
    },

    li: {
        marginBottom: "6px",
    },

    inlineCode: {
        background: "rgba(15, 23, 42, 0.7)",
        color: "#93c5fd",
        padding: "2px 6px",
        borderRadius: "6px",
        fontSize: "13px",
        fontFamily: "Consolas, Monaco, monospace",
    },

    codeBlockWrapper: {
        marginTop: "10px",
        marginBottom: "14px",
        borderRadius: "14px",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "#111827",
    },

    codeHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 14px",
        background: "#0b1220",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
    },

    codeLanguage: {
        color: "#e5e7eb",
        fontSize: "13px",
        fontWeight: "700",
        textTransform: "capitalize",
    },

    copyButton: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "#e5e7eb",
        padding: "6px 10px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "13px",
    },

    syntaxHighlighter: {
        margin: 0,
        padding: "16px",
        background: "#111827",
        fontSize: "14px",
        lineHeight: "1.6",
        overflowX: "auto",
    },

    tableWrapper: {
        overflowX: "auto",
        marginTop: "10px",
        marginBottom: "14px",
        borderRadius: "12px",
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
        background: "rgba(255,255,255,0.06)",
    },

    th: {
        textAlign: "left",
        padding: "10px 12px",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.08)",
    },

    td: {
        padding: "10px 12px",
        border: "1px solid rgba(255,255,255,0.08)",
    },

    blockquote: {
        margin: "10px 0",
        padding: "10px 14px",
        borderLeft: "4px solid #60a5fa",
        background: "rgba(96,165,250,0.08)",
        borderRadius: "8px",
        color: "#dbeafe",
    },

    h1: {
        fontSize: "24px",
        margin: "8px 0 12px 0",
    },

    h2: {
        fontSize: "20px",
        margin: "8px 0 12px 0",
    },

    h3: {
        fontSize: "17px",
        margin: "8px 0 10px 0",
    },

    typingDots: {
        display: "flex",
        gap: "6px",
        alignItems: "center",
        height: "24px",
    },

    dot: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: "#cbd5e1",
        display: "inline-block",
    },

    inputArea: {
        marginTop: "18px",
        display: "flex",
        gap: "14px",
        alignItems: "center",
        flexShrink: 0,
    },

    input: {
        flex: 1,
        height: "58px",
        padding: "0 20px",
        borderRadius: "18px",
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.08)",
        color: "#fff",
        fontSize: "16px",
        outline: "none",
        backdropFilter: "blur(8px)",
    },

    button: {
        height: "58px",
        minWidth: "120px",
        padding: "0 28px",
        borderRadius: "18px",
        border: "none",
        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
        color: "#fff",
        fontWeight: "700",
        fontSize: "16px",
        cursor: "pointer",
        boxShadow: "0 10px 25px rgba(59,130,246,0.35)",
    },

    historyOverlay: {
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(6px)",
        zIndex: 10,
        display: "flex",
        justifyContent: "flex-end",
    },

    historyPanel: {
        width: "380px",
        height: "100%",
        background: "rgba(15,23,42,0.95)",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
    },

    historyHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "18px",
    },

    historyHeaderLeft: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        color: "#fff",
    },

    historyTitle: {
        margin: 0,
        fontSize: "18px",
        color: "#fff",
    },

    iconButton: {
        width: "36px",
        height: "36px",
        borderRadius: "10px",
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.08)",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
    },

    historyList: {
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },

    emptyHistory: {
        color: "rgba(255,255,255,0.6)",
        padding: "16px",
        borderRadius: "12px",
        background: "rgba(255,255,255,0.04)",
    },

    historyItem: {
        display: "flex",
        gap: "10px",
        alignItems: "center",
        padding: "12px",
        borderRadius: "14px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.06)",
    },

    historyContent: {
        flex: 1,
        cursor: "pointer",
        minWidth: 0,
    },

    historyItemTitle: {
        color: "#fff",
        fontSize: "14px",
        fontWeight: "600",
        marginBottom: "4px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },

    historyItemMeta: {
        color: "rgba(255,255,255,0.62)",
        fontSize: "12px",
    },

    historyItemActions: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },

    historyLoadBtn: {
        border: "none",
        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
        color: "#fff",
        borderRadius: "8px",
        padding: "8px 12px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "600",
    },

    historyDeleteBtn: {
        width: "34px",
        height: "34px",
        borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.06)",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
    },
};

export default App;

