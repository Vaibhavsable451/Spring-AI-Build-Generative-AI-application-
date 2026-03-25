import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { 
    FiSend, FiTrash2, FiClock, FiX, FiCheck, FiCopy
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
                from: "Kairo AI Assistant",
                text: typeof response.data === 'string' ? response.data : JSON.stringify(response.data)
            };

            setMessages(prev => [...prev, samReply]);
        } catch (error) {
            setMessages(prev => [...prev, { 
                from: "Kairo AI Assistant", 
                text: `⚠️ **Update:** The AI is still warming up. (Error: ${error.message})` 
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
        <div style={styles.appWrapper}>
            {showHistory && (
                <div style={styles.historyOverlay}>
                    <div style={styles.historyPanel}>
                        <div style={styles.historyHeader}>
                            <h3 style={styles.historyTitle}>History</h3>
                            <button onClick={() => setShowHistory(false)} style={styles.iconBtn}><FiX size={20} /></button>
                        </div>
                        <div style={styles.historyList}>
                            {history.length === 0 ? <div style={styles.emptyHistory}>No history</div> : 
                                history.map(item => (
                                    <div key={item.id} style={styles.historyItem}>
                                        <div style={styles.historyContent} onClick={() => loadHistory(item)}>
                                            <div style={styles.historyItemTitle}>{item.title}</div>
                                            <div style={styles.historyItemMeta}>{item.timestamp}</div>
                                        </div>
                                        <button onClick={() => deleteHistory(item.id)} style={styles.deleteBtn}><FiTrash2 size={14} /></button>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            )}

            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <div style={styles.logoBox}><RiRobot3Fill style={styles.logoIcon} /></div>
                    <div>
                        <h1 style={styles.title}>Kairo AI Assistant</h1>
                        <p style={styles.subtitle}>Powered by Groq + Spring AI</p>
                    </div>
                </div>
                <div style={styles.headerActions}>
                    <button onClick={() => setShowHistory(true)} style={styles.headerIconBtn}><FiClock size={20} /></button>
                    <button onClick={clearChat} style={styles.headerIconBtn}><FiRefreshCw size={20} /></button>
                </div>
            </div>

            <div style={styles.scrollArea}>
                <div style={styles.messagesContainer}>
                    {messages.map((msg, idx) => {
                        const isUser = msg.from === userName;
                        return (
                            <div key={idx} style={{...styles.messageRow, justifyContent: isUser ? 'flex-end' : 'flex-start'}}>
                                {!isUser && <div style={styles.botAvatar}><TbRobot /></div>}
                                <div style={{...styles.messageBubble, ...(isUser ? styles.userBubble : styles.botBubble)}}>
                                    <div style={styles.messageSender}>{msg.from}</div>
                                    {isUser ? <div style={styles.messageText}>{msg.text}</div> : <MarkdownMessage content={msg.text} />}
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
            </div>

            <div style={styles.inputSection}>
                <div style={styles.inputBox}>
                    <input 
                        style={styles.input}
                        type="text" 
                        placeholder="Type a message..." 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()} 
                    />
                    <button style={styles.sendBtn} onClick={sendMessage}><FiSend size={20} /></button>
                </div>
            </div>
        </div>
    );
}

function MarkdownMessage({ content }) {
    return (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
            code({ inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : 'text';
                const codeText = String(children).replace(/\n$/, '');
                if (!inline) return <CodeBlock code={codeText} language={language} />;
                return <code style={styles.inlineCode} {...props}>{children}</code>;
            },
            p: ({ children }) => <p style={{margin: '0 0 10px 0'}}>{children}</p>,
        }}>{content}</ReactMarkdown>
    );
}

function CodeBlock({ code, language }) {
    const [copied, setCopied] = useState(false);
    return (
        <div style={styles.codeBlock}>
            <div style={styles.codeHeader}>
                <span>{language}</span>
                <CopyToClipboard text={code} onCopy={() => {setCopied(true); setTimeout(()=>setCopied(false), 2000)}}>
                    <button style={styles.copyBtn}>{copied ? <FiCheck /> : <FiCopy />} {copied ? 'Copied' : 'Copy'}</button>
                </CopyToClipboard>
            </div>
            <SyntaxHighlighter language={language} style={vscDarkPlus} customStyle={styles.syntax}>{code}</SyntaxHighlighter>
        </div>
    );
}

function TypingDots() {
    return <div style={styles.typing}><span style={styles.dot}></span><span style={styles.dot}></span><span style={styles.dot}></span></div>;
}

const styles = {
    appWrapper: { width: '100vw', height: '100vh', background: '#0a0b10', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', fontFamily: "'Inter', sans-serif", color: '#fff' },
    header: { padding: '15px 30px', background: 'rgba(23, 25, 35, 0.95)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100, backdropFilter: 'blur(10px)' },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '15px' },
    logoBox: { width: '42px', height: '42px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    logoIcon: { fontSize: '24px' },
    title: { fontSize: '18px', fontWeight: '700', margin: 0 },
    subtitle: { fontSize: '12px', color: '#94a3b8', margin: 0 },
    headerActions: { display: 'flex', gap: '15px' },
    headerIconBtn: { background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' },
    scrollArea: { flex: 1, overflowY: 'auto', padding: '30px 20px', display: 'flex', flexDirection: 'column-reverse' },
    messagesContainer: { maxWidth: '1000px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px', justifyContent: 'flex-end' },
    messageRow: { display: 'flex', gap: '15px', width: '100%', animation: 'fadeIn 0.3s ease-in' },
    botAvatar: { width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', flexShrink: 0 },
    userAvatar: { width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', flexShrink: 0 },
    messageBubble: { maxWidth: '80%', padding: '16px 20px', borderRadius: '18px', fontSize: '15px', lineHeight: '1.6' },
    botBubble: { background: 'rgba(30, 41, 59, 0.6)', color: '#fff' },
    userBubble: { background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', color: '#fff' },
    messageSender: { fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px', opacity: 0.6 },
    messageText: { whiteSpace: 'pre-wrap' },
    inputSection: { padding: '20px 30px', background: 'rgba(23, 25, 35, 0.95)', borderTop: '1px solid rgba(255, 255, 255, 0.1)' },
    inputBox: { maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '15px' },
    input: { flex: 1, background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '14px 20px', color: '#fff', outline: 'none' },
    sendBtn: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: '14px', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
    inlineCode: { background: 'rgba(255, 255, 255, 0.1)', padding: '2px 5px', borderRadius: '4px', color: '#818cf8' },
    codeBlock: { margin: '15px 0', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' },
    codeHeader: { background: '#1e1e2e', padding: '8px 15px', display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px' },
    copyBtn: { background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
    syntax: { margin: 0, padding: '20px', fontSize: '14px' },
    typing: { display: 'flex', gap: '5px', padding: '8px 0' },
    dot: { width: '6px', height: '6px', background: '#818cf8', borderRadius: '50%', animation: 'blink 1.4s infinite' },
    historyOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', justifyContent: 'flex-end' },
    historyPanel: { width: '320px', height: '100%', background: '#171923', display: 'flex', flexDirection: 'column' },
    historyHeader: { padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between' },
    historyTitle: { margin: 0 },
    historyList: { flex: 1, overflowY: 'auto', padding: '20px' },
    historyItem: { padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between' },
    historyContent: { flex: 1, cursor: 'pointer' },
    historyItemTitle: { fontSize: '14px', fontWeight: 'bold' },
    historyItemMeta: { fontSize: '11px', color: '#718096' },
    deleteBtn: { background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' },
    iconBtn: { background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }
};

export default App;