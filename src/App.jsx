import React, { useState, useEffect, useRef } from 'react';
import { Hash, Compass, Plus, Mic, Headphones, Settings, Bell, Pin, Users, Search, Inbox, HelpCircle, CheckCircle2, Bot, Trash2, User } from 'lucide-react';

// Simplified Bot Simulator Logic
const botSimulator = {
  commands: [
    { name: 'reminder', desc: 'Create a new reminder' },
    { name: 'list', desc: 'Show all your active reminders' },
    { name: 'remove', desc: 'Remove a specific reminder' },
    { name: 'clean', desc: 'Remove all your reminders' },
    { name: 'edit', desc: 'Edit an existing reminder' },
    { name: 'repeat', desc: 'Manage repeat days for a reminder' },
    { name: 'stats', desc: 'Show reminder statistics' }
  ],
  processCommand(cmdStr, reminders, setReminders, pushMessage) {
    const parts = cmdStr.split(' ');
    const command = parts[0].substring(1).toLowerCase();
    const args = parts.slice(1);

    if (command === 'reminder') {
      const name = args.join(' ') || 'Untitled Reminder';
      const newReminder = { id: Date.now().toString().slice(-4), name, time: '12:00', day: 'Today', timezone: 'UTC', ping: true };
      setReminders([...reminders, newReminder]);
      
      pushMessage({
        type: 'embed',
        author: 'Discord Reminders Bot',
        isBot: true,
        embed: {
          color: 'color-success',
          title: '✅ Reminder Created',
          description: `Your reminder **"${name}"** has been successfully created!`,
          fields: [
            { name: '⏰ Time', value: '12:00 (UTC)', inline: true },
            { name: '📅 Day', value: 'Today', inline: true },
            { name: '🔔 Ping', value: 'Yes', inline: true }
          ],
          footer: `Reminder ID: ${newReminder.id}`
        }
      });
    } 
    else if (command === 'list') {
      if (reminders.length === 0) {
        pushMessage({
          type: 'embed',
          author: 'Discord Reminders Bot',
          isBot: true,
          embed: {
            color: 'color-info',
            title: '📋 No Active Reminders',
            description: 'You don\'t have any active reminders. Use `/reminder` to create one!'
          }
        });
      } else {
        pushMessage({
          type: 'embed',
          author: 'Discord Reminders Bot',
          isBot: true,
          embed: {
            color: 'color-info',
            title: '📋 Your Active Reminders',
            description: `You have **${reminders.length}** active reminder${reminders.length !== 1 ? 's' : ''}`,
            fields: reminders.map((r, i) => ({
              name: `${i + 1}. ${r.name}`,
              value: `🕐 ${r.time} (${r.timezone})\n📅 ${r.day}\n🔔 Ping: Yes\n🆔 ID: ${r.id}`,
              inline: false
            }))
          }
        });
      }
    }
    else if (command === 'clean') {
      setReminders([]);
      pushMessage({
        type: 'embed',
        author: 'Discord Reminders Bot',
        isBot: true,
        embed: {
          color: 'color-success',
          title: '🧹 Reminders Cleaned',
          description: 'All your reminders have been successfully removed.'
        }
      });
    }
    else if (command === 'remove') {
      const id = args[0];
      if (!id) {
        pushMessage({
          type: 'embed',
          author: 'Discord Reminders Bot',
          isBot: true,
          embed: { color: 'color-error', title: '❌ Error', description: 'Please provide a reminder ID.' }
        });
        return;
      }
      const newReminders = reminders.filter(r => r.id !== id);
      if (newReminders.length === reminders.length) {
         pushMessage({
          type: 'embed',
          author: 'Discord Reminders Bot',
          isBot: true,
          embed: { color: 'color-error', title: '❌ Not Found', description: `No reminder found with ID: ${id}` }
        });
      } else {
        setReminders(newReminders);
        pushMessage({
          type: 'embed',
          author: 'Discord Reminders Bot',
          isBot: true,
          embed: { color: 'color-success', title: '🗑️ Reminder Removed', description: `Reminder with ID **${id}** has been removed.` }
        });
      }
    }
    else {
      pushMessage({
        type: 'embed',
        author: 'Discord Reminders Bot',
        isBot: true,
        embed: {
          color: 'color-warning',
          title: '⚠️ Command Not Implemented',
          description: `The command \`/${command}\` is recognized but not fully simulated in this preview.`
        }
      });
    }
  }
};

function Tooltip({ children, text }) {
  return (
    <div className="tooltip-container">
      {children}
      <div className="tooltip">{text}</div>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'text',
      author: 'Discord Reminders Bot',
      isBot: true,
      text: 'Hello! I am the Discord Reminders Bot. Try typing `/reminder`, `/list`, or `/clean` to test my commands in this web simulator!',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [reminders, setReminders] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedAutocompleteIndex, setSelectedAutocompleteIndex] = useState(0);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (val.startsWith('/')) {
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
    }
  };

  const pushMessage = (msg) => {
    setMessages(prev => [...prev, {
      ...msg,
      id: Date.now(),
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }]);
  };

  const handleSubmit = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      if (showAutocomplete && filteredCommands.length > 0) {
        // use autocomplete
        const selectedCmd = filteredCommands[selectedAutocompleteIndex];
        setInputValue('/' + selectedCmd.name + ' ');
        setShowAutocomplete(false);
        e.preventDefault();
        return;
      }

      const isCommand = inputValue.startsWith('/');
      
      pushMessage({
        type: 'text',
        author: 'You',
        isBot: false,
        text: inputValue
      });

      if (isCommand) {
        botSimulator.processCommand(inputValue, reminders, setReminders, pushMessage);
      }
      
      setInputValue('');
      setShowAutocomplete(false);
    } else if (e.key === 'ArrowDown' && showAutocomplete) {
      e.preventDefault();
      setSelectedAutocompleteIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp' && showAutocomplete) {
      e.preventDefault();
      setSelectedAutocompleteIndex(prev => Math.max(prev - 1, 0));
    }
  };

  const filteredCommands = botSimulator.commands.filter(cmd => 
    ('/' + cmd.name).startsWith(inputValue.split(' ')[0].toLowerCase())
  );

  return (
    <div className="discord-app">
      {/* Server Sidebar */}
      <div className="server-sidebar">
        <Tooltip text="Direct Messages">
          <div className="server-icon" style={{ backgroundColor: '#5865F2', color: 'white' }}>
            <img src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png" alt="Discord" />
          </div>
        </Tooltip>
        
        <div className="server-separator"></div>
        
        <Tooltip text="Discord-reminders-bot Simulator">
          <div className="server-icon active">
            <Bot size={28} />
          </div>
        </Tooltip>
        
        <div className="server-icon" style={{ backgroundColor: 'transparent', color: '#2ecc71', border: '1px dashed #2ecc71' }}>
          <Plus size={24} />
        </div>
        <div className="server-icon" style={{ backgroundColor: 'transparent', color: '#2ecc71', border: '1px dashed #2ecc71' }}>
          <Compass size={24} />
        </div>
      </div>

      {/* Channels / DMs Sidebar */}
      <div className="channel-sidebar">
        <div className="channel-header">
          Bot Simulator
        </div>
        <div className="channel-list">
          <div className="channel-item active">
            <Hash size={20} />
            <span>bot-testing</span>
          </div>
          <div className="channel-item">
            <Hash size={20} />
            <span>general</span>
          </div>
        </div>
        
        {/* User Area - linking to orzz.website */}
        <div className="user-area">
          <div className="user-avatar">
            <User size={20} color="white" />
          </div>
          <div className="user-info">
            <div className="username">You</div>
            <a href="https://orzz.website" target="_blank" rel="noreferrer" className="status">orzz.website</a>
          </div>
          <Mic size={20} color="var(--header-secondary)" style={{cursor: 'pointer'}} />
          <Headphones size={20} color="var(--header-secondary)" style={{cursor: 'pointer'}} />
          <Settings size={20} color="var(--header-secondary)" style={{cursor: 'pointer'}} />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-area">
        {/* Chat Header */}
        <div className="chat-header">
          <Hash size={24} color="var(--text-muted)" />
          <span>bot-testing</span>
          <div style={{ flex: 1 }}></div>
          <Bell size={24} />
          <Pin size={24} />
          <Users size={24} />
          <div style={{ width: '144px', height: '24px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', display: 'flex', alignItems: 'center', padding: '0 8px', marginLeft: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', flex: 1 }}>Search</span>
            <Search size={14} color="var(--text-muted)" />
          </div>
          <Inbox size={24} style={{ marginLeft: '16px' }} />
          <HelpCircle size={24} style={{ marginLeft: '16px' }} />
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg) => (
            <div className="message-wrapper" key={msg.id}>
              <div className="message-avatar">
                {msg.isBot ? <Bot size={24} color="white" /> : <User size={24} color="white" />}
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-author">{msg.author}</span>
                  {msg.isBot && <span className="bot-tag"><CheckCircle2 size={10} /> BOT</span>}
                  <span className="message-time" style={{ marginLeft: '8px' }}>{msg.time}</span>
                </div>
                {msg.type === 'text' && <div className="message-text">{msg.text}</div>}
                
                {msg.type === 'embed' && (
                  <div className={`discord-embed ${msg.embed.color}`}>
                    {msg.embed.title && <div className="embed-title">{msg.embed.title}</div>}
                    {msg.embed.description && <div className="embed-description">{msg.embed.description}</div>}
                    
                    {msg.embed.fields && msg.embed.fields.length > 0 && (
                      <div className="embed-fields">
                        {msg.embed.fields.map((field, idx) => (
                          <div className={`embed-field ${field.inline ? 'inline' : ''}`} key={idx}>
                            <div className="embed-field-name">{field.name}</div>
                            <div className="embed-field-value">{field.value}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {msg.embed.footer && (
                      <div className="embed-footer">
                        {msg.embed.footer}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-container">
          {showAutocomplete && inputValue.startsWith('/') && (
            <div className="autocomplete-popup">
              <div className="autocomplete-header">Commands matching {inputValue}</div>
              <div className="autocomplete-list">
                {filteredCommands.length === 0 ? (
                  <div className="autocomplete-item">
                    <span className="autocomplete-name" style={{ color: 'var(--text-muted)' }}>No commands found</span>
                  </div>
                ) : (
                  filteredCommands.map((cmd, idx) => (
                    <div 
                      key={cmd.name} 
                      className={`autocomplete-item ${idx === selectedAutocompleteIndex ? 'selected' : ''}`}
                      onClick={() => {
                        setInputValue('/' + cmd.name + ' ');
                        setShowAutocomplete(false);
                        document.querySelector('.chat-input').focus();
                      }}
                      onMouseEnter={() => setSelectedAutocompleteIndex(idx)}
                    >
                      <div className="autocomplete-icon"><Bot size={20} color="var(--text-normal)" /></div>
                      <div className="autocomplete-name">/{cmd.name}</div>
                      <div className="autocomplete-desc">{cmd.desc}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="chat-input-wrapper">
            <Plus size={24} color="var(--interactive-normal)" style={{ marginRight: '16px', cursor: 'pointer' }} />
            <input 
              type="text" 
              className="chat-input" 
              placeholder="Message #bot-testing (Try typing / to see bot commands)" 
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleSubmit}
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
