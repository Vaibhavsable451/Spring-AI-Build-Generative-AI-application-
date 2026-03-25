import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { 
    FiSend, FiTrash2, FiClock, FiX, FiCheck, FiCopy, FiRefreshCw,
    FiMenu, FiSettings, FiUser, FiInfo, FiLayout
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
            const response = await axios.get(`${baseUrl}/user/chat`, {
                params: { question },
                timeout: 60000,
            });

            const samReply = {
                from: "Kairo AI",
                text: typeof response.data === 'string' ? response.data : JSON.stringify(response.data)
            };

            setMessages(prev => [...prev, samReply]);
        } catch (error) {
            setMessages(prev => [...prev, { 
                from: "Kairo AI", 
                text: `⚠️ Connection Issue: ${error.message}. Please check if the Render backend is still awake.` 
            }]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!hasAskedOnce.current) {
            askQuestion("Hello! Who are you?", false);
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
                                <h3 style={styles.historyTitle}>Your History</h3>
                            </div>
                            <button onClick={() => setShowHistory(false)} style={styles.iconBtn}>
                                <FiX size={20} />
                            </button>
                        </div>
                        <div style={styles.historyList}>
                            {history.length === 0 ? (
                                <div style={styles.emptyHistory}>No chats saved yet.</div>
                            ) : (
                                history.map(item => (
                                    <div key={item.id} style={styles.historyItem}>
                                        <div style={styles.historyContent} onClick={() => loadHistory(item)}>
                                            <div style={styles.historyItemTitle}>{item.title}</div>
                                            <div style={styles.historyItemMeta}>{item.timestamp}</div>
                                        </div>
                                        <div style={styles.historyItemActions}>
                                            <button onClick={() => deleteHistory(item.id)} style={styles.historyDeleteBtn}>
                                                <FiTrash2 size={16} />
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
                        <h1 style={styles.title}>Kairo Assistant</h1>
                        <p style={styles.subtitle}>Supercharged with Llama 3.1 & Spring AI</p>
                    </div>
                    <div style={styles.headerActions}>
                        <button onClick={() => setShowHistory(true)} style={styles.headerIconBtn} title="History"><FiClock size={20} /></button>
                        <button onClick={clearChat} style={styles.headerIconBtn} title="Clear Chat"><FiTrash2 size={20} /></button>
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
                                <div style={styles.messageSender}>Kairo AI</div>
                                <TypingDots />
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <div style={styles.inputArea}>
                    <div style={styles.inputWrapper}>
                        <input 
                            style={styles.input}
                            type="text" 
                            placeholder="Ask me anything..." 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()} 
                        />
                        <button 
                            style={{...styles.button, opacity: input.trim() ? 1 : 0.6}} 
                            onClick={sendMessage}
                            disabled={!input.trim()}
                        >
                            <FiSend size={20} />
                        </button>
                    </div>
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
                        {copied ? <FiCheck size={14} /> : <FiCopy size={16} />}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                </CopyToClipboard>
            </div>
            <SyntaxHighlighter 
                language={language} 
                style={vscDarkPlus} 
                customStyle={styles.syntaxContent}
            >
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
    page: { width: '100vw', height: '100vh', background: '#0a0b10', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', fontFamily: "'Inter', sans-serif", color: '#fff' },
    bgGlow1: { position: 'absolute', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', top: '-100px', right: '-100px' },
    bgGlow2: { position: 'absolute', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)', bottom: '-150px', left: '-150px' },
    container: { width: '100%', height: '100%', maxWidth: '1400px', background: 'rgba(23, 25, 35, 0.85)', backdropFilter: 'blur(30px)', display: 'flex', flexDirection: 'column', zIndex: 10 },
    header: { padding: '20px 40px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', gap: '20px' },
    logoBox: { width: '45px', height: '45px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)' },
    logoIcon: { fontSize: '24px' },
    headerText: { flex: 1 },
    title: { fontSize: '22px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' },
    subtitle: { fontSize: '13px', color: '#94a3b8', margin: '2px 0 0 0', fontWeight: '500' },
    headerActions: { display: 'flex', gap: '15px' },
    headerIconBtn: { background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', borderRadius: '12px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' },
    chatBox: { flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px' },
    messageRow: { display: 'flex', gap: '16px', maxWidth: '1000px', margin: '0 auto', width: '100%' },
    botAvatar: { width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(99, 102, 241, 0.2)', flexShrink: 0 },
    userAvatar: { width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(168, 85, 247, 0.2)', flexShrink: 0 },
    messageBubble: { maxWidth: '85%', padding: '18px 24px', borderRadius: '20px', fontSize: '15.5px', lineHeight: '1.6', position: 'relative' },
    botBubble: { background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', color: '#e2e8f0', borderTopLeftRadius: '4px' },
    userBubble: { background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', borderTopRightRadius: '4px', boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.3)' },
    messageSender: { fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.5, letterSpacing: '0.05em' },
    messageText: { whiteSpace: 'pre-wrap' },
    inputArea: { padding: '30px 40px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' },
    inputWrapper: { maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '15px', position: 'relative' },
    input: { flex: 1, background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '16px 24px', color: '#fff', fontSize: '16px', outline: 'none', transition: 'all 0.2s' },
    button: { background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: '#fff', border: 'none', borderRadius: '16px', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)' },
    markdownWrapper: { overflowWrap: 'anywhere' },
    paragraph: { margin: '0 0 12px 0' },
    ul: { margin: '0 0 12px 24px' },
    li: { margin: '0 0 6px 0' },
    inlineCode: { background: 'rgba(255, 255, 255, 0.1)', padding: '2px 6px', borderRadius: '4px', color: '#818cf8', fontWeight: '600' },
    codeBlockContainer: { margin: '15px 0', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' },
    codeHeader: { background: '#1e1e2e', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    codeLang: { fontSize: '12px', color: '#94a3b8', fontWeight: '700' },
    copyBtn: { background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '12px', display: 'flex', gap: '6px', cursor: 'pointer' },
    syntaxContent: { margin: 0, padding: '20px' },
    historyOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' },
    historyPanel: { width: '380px', height: '100%', background: '#0f111a', borderLeft: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' },
    historyHeader: { padding: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    historyHeaderLeft: { display: 'flex', alignItems: 'center', gap: '12px', color: '#fff' },
    historyTitle: { fontSize: '20px', margin: 0, fontWeight: '700' },
    historyList: { flex: 1, overflowY: 'auto', padding: '20px' },
    historyItem: { padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', marginBottom: '15px', border: '1px solid rgba(255,255,255,0.05)', transition: '0.2s' },
    historyContent: { cursor: 'pointer' },
    historyItemTitle: { fontSize: '15px', fontWeight: '600', color: '#e2e8f0', marginBottom: '5px' },
    historyItemMeta: { fontSize: '11px', color: '#718096' },
    historyItemActions: { display: 'flex', justifyContent: 'flex-end', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' },
    historyDeleteBtn: { color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' },
    iconBtn: { background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' },
    typing: { display: 'flex', gap: '5px', padding: '8px 0' },
    dot: { width: '6px', height: '6px', background: '#818cf8', borderRadius: '50%', animation: 'blink 1.4s infinite' },
};

export default App;