import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { 
    FiSend, FiTrash2, FiClock, FiX, FiCheck, FiCopy, FiRefreshCw,
    FiMenu, FiSettings, FiUser, FiInfo 
} from 'react-icons/fi';
import { RiRobot3Fill } from 'react-icons/ri';
import { TbRobot } from 'react-icons/tb';
import { FaUser } from 'react-icons/fa';

function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [userName] = useState('Vaibhav');
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('chatHistory');
        return saved ? JSON.parse(saved) : [];
    });
    const [showHistory, setShowHistory] = useState(false);
    
    const chatEndRef = useRef(null);
    const hasAskedOnce = useRef(false);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    useEffect(() => {
        localStorage.setItem('chatHistory', JSON.stringify(history));
    }, [history]);

    const saveToHistory = (msgs) => {
        if (msgs.length < 2) return;
        const newEntry = {
            id: Date.now(),
            title: msgs[0].text.substring(0, 30) + (msgs[0].text.length > 30 ? '...' : ''),
            timestamp: new Date().toLocaleString(),
            messages: msgs
        };
        setHistory(prev => [newEntry, ...prev]);
    };

    const clearChat = () => {
        if (messages.length > 0) saveToHistory(messages);
        setMessages([]);
    };

    const loadHistory = (item) => {
        setMessages(item.messages);
        setShowHistory(false);
    };

    const deleteHistory = (id) => {
        setHistory(prev => prev.filter(h => h.id !== id));
    };

    const askQuestion = async (question, showUserMessage = true) => {
        if (!question.trim() || loading) return;

        if (showUserMessage) {
            setMessages(prev => [...prev, { from: userName, text: question }]);
        }

        setLoading(true);

        try {
            const baseUrl = (process.env.REACT_APP_API_URL || "https://spring-ai-build-generative-ai-application-ktur.onrender.com").replace(/\/+$/, "");
            console.log(">>> Requesting:", `${baseUrl}/user/chat?question=${encodeURIComponent(question)}`);
            
            const response = await axios.get(`${baseUrl}/user/chat`, {
                params: { question },
                timeout: 30000,
            });

            console.log(">>> Response Status:", response.status);
            console.log(">>> Response Data:", response.data);

            const samReply = {
                from: "Kairo",
                text: typeof response.data === 'string' ? response.data : JSON.stringify(response.data)
            };

            setMessages(prev => [...prev, samReply]);
        } catch (error) {
            console.error(">>> Request Failed:", error);
            setMessages(prev => [...prev, { 
                from: "Kairo", 
                text: `❌ Error: ${error.message}. Please check if the backend is live at ${process.env.REACT_APP_API_URL || "https://spring-ai-build-generative-ai-application-ktur.onrender.com"}` 
            }]);
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
            <div style={styles.bgGlow1}></div>
            <div style={styles.bgGlow2}></div>

            {showHistory && (
                <div style={styles.historyOverlay}>
                    <div style={styles.historyPanel}>
                        <div style={styles.historyHeader}>
                            <div style={styles.historyHeaderLeft}>
                                <FiClock size={18} />
                                <h3 style={styles.historyTitle}>History</h3>
                            </div>
                            <button onClick={() => setShowHistory(false)} style={styles.iconBtn}>
                                <FiX size={18} />
                            </button>
                        </div>
                        <div style={styles.historyList}>
                            {history.length === 0 ? (
                                <div style={styles.emptyHistory}>No history yet</div>
                            ) : (
                                history.map(item => (
                                    <div key={item.id} style={styles.historyItem}>
                                        <div style={styles.historyContent} onClick={() => loadHistory(item)}>
                                            <div style={styles.historyItemTitle}>{item.title}</div>
                                            <div style={styles.historyItemMeta}>{item.timestamp}</div>
                                        </div>
                                        <div style={styles.historyItemActions}>
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
                    <div style={styles.logoBox}><RiRobot3Fill style={styles.logoIcon} /></div>
                    <div style={styles.headerText}>
                        <h1 style={styles.title}>Kairo AI</h1>
                        <p style={styles.subtitle}>Spring AI + Groq Llama 3.1</p>
                    </div>
                    <div style={styles.headerActions}>
                        <button onClick={() => setShowHistory(true)} style={styles.headerIconBtn} title="History"><FiClock size={18} /></button>
                        <button onClick={clearChat} style={styles.headerIconBtn} title="Clear Chat"><FiTrash2 size={18} /></button>
                    </div>
                </div>

                <div style={styles.chatBox}>
                    {messages.map((msg, idx) => {
                        const isUser = msg.from === userName;
                        return (
                            <div key={idx} style={{...styles.messageRow, justifyContent: isUser ? 'flex-end' : 'flex-start'}}>
                                {!isUser && <div style={styles.botAvatar}><TbRobot /></div>}
                                <div style={{...styles.messageBubble, ...(isUser ? styles.userBubble : styles.botBubble)}}>
                                    <div style={styles.messageSender}>{msg.from}</div>
                                    {isUser ? (
                                        <div style={styles.messageText}>{msg.text}</div>
                                    ) : (
                                        <MarkdownMessage content={msg.text} />
                                    )}
                                </div>
                                {isUser && <div style={styles.userAvatar}><FaUser /></div>}
                            </div>
                        );
                    })}
                    {loading && (
                        <div style={{...styles.messageRow, justifyContent: 'flex-start'}}>
                            <div style={styles.botAvatar}><TbRobot /></div>
                            <div style={{...styles.messageBubble, ...styles.botBubble}}>
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
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()} 
                    />
                    <button style={styles.button} onClick={sendMessage}><FiSend size={18} /></button>
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
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : 'text';
                        const codeText = String(children).replace(/\n$/, '');
                        if (!inline) {
                            return <CodeBlock code={codeText} language={language} />;
                        }
                        return <code style={styles.inlineCode} {...props}>{children}</code>;
                    },
                    p: ({ children }) => <p style={styles.paragraph}>{children}</p>,
                    ul: ({ children }) => <ul style={styles.ul}>{children}</ul>,
                    li: ({ children }) => <li style={styles.li}>{children}</li>
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
                        <span>{copied ? 'Copied' : 'Copy'}</span>
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
    page: { width: '100vw', height: '100vh', background: '#0a0b10', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', fontFamily: "'Inter', sans-serif" },
    bgGlow1: { position: 'absolute', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', top: '-100px', right: '-100px' },
    bgGlow2: { position: 'absolute', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)', bottom: '-150px', left: '-150px' },
    container: { width: '95%', maxWidth: '800px', height: '90vh', background: 'rgba(23, 25, 35, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', zIndex: 10 },
    header: { padding: '20px 30px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', gap: '15px' },
    logoBox: { width: '40px', height: '40px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    logoIcon: { fontSize: '22px', color: '#fff' },
    headerText: { flex: 1 },
    title: { fontSize: '18px', fontWeight: '700', margin: 0, color: '#fff' },
    subtitle: { fontSize: '12px', color: '#94a3b8', margin: 0 },
    headerActions: { display: 'flex', gap: '10px' },
    headerIconBtn: { background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '5px' },
    chatBox: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' },
    messageRow: { display: 'flex', gap: '12px', width: '100%' },
    botAvatar: { width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    userAvatar: { width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    messageBubble: { maxWidth: '80%', padding: '12px 16px', borderRadius: '16px', fontSize: '14px', lineHeight: '1.5' },
    botBubble: { background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)', color: '#e2e8f0' },
    userBubble: { background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff' },
    messageSender: { fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px', opacity: 0.6 },
    messageText: { whiteSpace: 'pre-wrap' },
    inputArea: { padding: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '12px' },
    input: { flex: 1, background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '12px 16px', color: '#fff', outline: 'none' },
    button: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: '12px', padding: '0 20px', cursor: 'pointer' },
    markdownWrapper: { overflowWrap: 'anywhere' },
    paragraph: { margin: '0 0 8px 0' },
    ul: { margin: '0 0 8px 20px', padding: 0 },
    li: { margin: '0 0 4px 0' },
    inlineCode: { background: 'rgba(255, 255, 255, 0.1)', padding: '2px 4px', borderRadius: '4px', fontSize: '0.9em', color: '#818cf8' },
    codeBlockContainer: { margin: '12px 0', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' },
    codeHeader: { background: '#1e1e2e', padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    codeLang: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' },
    copyBtn: { background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' },
    syntaxContent: { margin: 0, padding: '16px', fontSize: '13px' },
    historyOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.6)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' },
    historyPanel: { width: '300px', height: '100%', background: '#171923', display: 'flex', flexDirection: 'column' },
    historyHeader: { padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between' },
    historyHeaderLeft: { display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' },
    historyTitle: { fontSize: '16px', margin: 0 },
    historyList: { flex: 1, overflowY: 'auto', padding: '15px' },
    historyItem: { padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', marginBottom: '10px', cursor: 'pointer' },
    historyContent: { flex: 1 },
    historyItemTitle: { fontSize: '14px', fontWeight: '500', color: '#fff' },
    historyItemMeta: { fontSize: '10px', color: '#666' },
    historyItemActions: { display: 'flex', justifyContent: 'flex-end' },
    historyDeleteBtn: { background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer' },
    typing: { display: 'flex', gap: '4px', padding: '5px 0' },
    dot: { width: '5px', height: '5px', background: '#818cf8', borderRadius: '50%', animation: 'blink 1.4s infinite' },
};

export default App;