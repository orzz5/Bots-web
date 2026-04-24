import React, { useState, useEffect, useRef } from 'react';
import { Hash, Compass, Plus, Mic, Headphones, Settings, Bell, Pin, Users, Search, Inbox, HelpCircle, CheckCircle2, Bot, User } from 'lucide-react';

// Argument Parser: handles formats like -> /reminder name: "Buy Milk" time: 10:00
const parseArgs = (argsStr) => {
  const args = {};
  const regex = /(\w+):\s*(".*?"|'.*?'|[^ ]+)/g;
  let match;
  while ((match = regex.exec(argsStr)) !== null) {
    let val = match[2];
    if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1);
    else if (val.startsWith("'") && val.endsWith("'")) val = val.substring(1, val.length - 1);
    args[match[1]] = val;
  }
  return args;
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
      text: 'Hello! I am the exact Discord Reminders Bot simulator. Try typing commands with their options, for example:\n`/reminder name: "Buy Milk" time: 10:00 day: Monday timezone: UTC ping: true`\n`/list`\n`/stats`\n`/clean`',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [reminders, setReminders] = useState([]);
  const [stats, setStats] = useState({ completed: 5, not_completed: 1, total: 6, current_streak: 3, longest_streak: 5 });
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedAutocompleteIndex, setSelectedAutocompleteIndex] = useState(0);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const pushMessage = (msg) => {
    setMessages(prev => [...prev, {
      ...msg,
      id: Date.now() + Math.random(),
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }]);
  };

  const handleButton = (msgId, customId) => {
    if (customId === 'confirm_clean') {
      const removedCount = reminders.length;
      setReminders([]);
      setMessages(prev => prev.map(m => {
        if (m.id === msgId) {
          return {
            ...m,
            components: [],
            embed: {
              color: 'color-success',
              title: '✅ All Reminders Removed',
              description: `Successfully removed **${removedCount}** reminder${removedCount !== 1 ? 's' : ''}.`
            }
          };
        }
        return m;
      }));
    } else if (customId === 'cancel_clean') {
      setMessages(prev => prev.map(m => {
        if (m.id === msgId) {
          return {
            ...m,
            components: [],
            embed: {
              color: 'color-neutral',
              title: '❌ Cancelled',
              description: 'Reminder removal has been cancelled.'
            }
          };
        }
        return m;
      }));
    }
  };

  const commands = [
    { name: 'reminder', desc: 'Create a new reminder (options: name, time, day, timezone, ping)' },
    { name: 'list', desc: 'Show all your active reminders' },
    { name: 'remove', desc: 'Remove a specific reminder (options: reminder)' },
    { name: 'clean', desc: 'Remove all your active reminders' },
    { name: 'edit', desc: 'Edit an existing reminder (options: reminder, time, day, timezone)' },
    { name: 'repeat', desc: 'Set repeat days for an existing reminder (options: reminder, days)' },
    { name: 'stats', desc: 'View your reminder statistics and streak' }
  ];

  const processCommand = (cmdStr) => {
    const spaceIdx = cmdStr.indexOf(' ');
    const commandName = spaceIdx === -1 ? cmdStr.substring(1).toLowerCase() : cmdStr.substring(1, spaceIdx).toLowerCase();
    const argsStr = spaceIdx === -1 ? '' : cmdStr.substring(spaceIdx + 1);
    const args = parseArgs(argsStr);

    if (commandName === 'reminder') {
      const name = args.name || 'Untitled Reminder';
      const time = args.time || '12:00';
      const day = args.day || 'Today';
      const timezone = args.timezone || 'UTC';
      const ping = args.ping || 'true';
      
      const newReminder = { id: Date.now().toString().slice(-4), name, time, day, timezone, ping: ping === 'true' };
      setReminders(prev => [...prev, newReminder]);
      setStats(prev => ({ ...prev, total: prev.total + 1 }));

      // DM Message
      pushMessage({
        type: 'embed',
        author: 'Discord Reminders Bot (DM)',
        isBot: true,
        embed: {
          color: 'color-success',
          title: '✅ Reminder Created',
          description: `Your reminder **"${name}"** has been successfully created!`,
          fields: [
            { name: '⏰ Time', value: `${time} (${timezone})`, inline: true },
            { name: '📅 Day', value: day, inline: true },
            { name: '🔔 Ping', value: ping === 'true' ? 'Yes' : 'No', inline: true },
            { name: '🕰️ Reminder Time', value: `<t:${Math.floor(Date.now() / 1000) + 3600}:F>`, inline: false }
          ],
          footer: `Reminder ID: ${newReminder.id}`
        }
      });

      // Channel Message
      setTimeout(() => {
        pushMessage({
          type: 'embed',
          author: 'Discord Reminders Bot',
          isBot: true,
          embed: {
            color: 'color-info',
            title: '✅ Reminder Created',
            description: `Check your DMs for reminder details!`
          }
        });
      }, 500);
    } 
    else if (commandName === 'list') {
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
              value: `🕐 ${r.time} (${r.timezone})\n📅 ${r.day}${r.repeat_days ? `\n🔄 Repeats: ${r.repeat_days}` : ''}\n🔔 Ping: ${r.ping ? 'Yes' : 'No'}\n🆔 ID: ${r.id}`,
              inline: false
            }))
          }
        });
      }
    }
    else if (commandName === 'clean') {
      if (reminders.length === 0) {
        pushMessage({
          type: 'embed',
          author: 'Discord Reminders Bot',
          isBot: true,
          embed: {
            color: 'color-info',
            title: '📋 No Reminders to Clean',
            description: 'You don\'t have any active reminders to remove.'
          }
        });
      } else {
        pushMessage({
          type: 'embed',
          author: 'Discord Reminders Bot',
          isBot: true,
          embed: {
            color: 'color-error',
            title: '⚠️ Confirm Removal',
            description: `Are you sure you want to remove all **${reminders.length}** of your active reminders?\n\nThis action cannot be undone!`
          },
          components: [
            {
              type: 'ActionRow',
              buttons: [
                { label: '✅ Yes, Remove All', style: 'Danger', customId: 'confirm_clean' },
                { label: '❌ Cancel', style: 'Secondary', customId: 'cancel_clean' }
              ]
            }
          ]
        });
      }
    }
    else if (commandName === 'remove') {
      const id = args.reminder;
      if (!id) {
        pushMessage({ type: 'embed', author: 'Discord Reminders Bot', isBot: true, embed: { color: 'color-error', title: '❌ Error', description: 'Please provide a reminder ID using `reminder: ID`.' } });
        return;
      }
      const reminderToRemove = reminders.find(r => r.id === id);
      if (!reminderToRemove) {
         pushMessage({ type: 'embed', author: 'Discord Reminders Bot', isBot: true, embed: { color: 'color-error', title: '❌ Invalid Selection', description: `No reminder found with ID: ${id}` } });
      } else {
        setReminders(prev => prev.filter(r => r.id !== id));
        pushMessage({
          type: 'embed',
          author: 'Discord Reminders Bot',
          isBot: true,
          embed: { 
            color: 'color-success', 
            title: '✅ Reminder Removed', 
            description: `Your reminder **"${reminderToRemove.name}"** has been successfully removed.`,
            fields: [
              { name: '🕐 Time', value: reminderToRemove.time, inline: true },
              { name: '📅 Day', value: reminderToRemove.day, inline: true },
              { name: '🆔 ID', value: reminderToRemove.id.toString(), inline: true }
            ]
          }
        });
      }
    }
    else if (commandName === 'edit') {
      const id = args.reminder;
      if (!id) {
        pushMessage({ type: 'embed', author: 'Discord Reminders Bot', isBot: true, embed: { color: 'color-error', title: '❌ Error', description: 'Please provide a reminder ID using `reminder: ID`.' } });
        return;
      }
      const existing = reminders.find(r => r.id === id);
      if (!existing) {
        pushMessage({ type: 'embed', author: 'Discord Reminders Bot', isBot: true, embed: { color: 'color-error', title: '❌ Invalid Selection', description: `No reminder found with ID: ${id}` } });
        return;
      }
      if (!args.time && !args.day && !args.timezone) {
        pushMessage({ type: 'embed', author: 'Discord Reminders Bot', isBot: true, embed: { color: 'color-error', title: '❌ No Changes', description: `Please specify at least one field to edit (time, day, timezone).` } });
        return;
      }

      const updated = { ...existing };
      if (args.time) updated.time = args.time;
      if (args.day) updated.day = args.day;
      if (args.timezone) updated.timezone = args.timezone;

      setReminders(prev => prev.map(r => r.id === id ? updated : r));
      pushMessage({
        type: 'embed',
        author: 'Discord Reminders Bot',
        isBot: true,
        embed: { 
          color: 'color-success', 
          title: '✅ Reminder Updated', 
          description: `Your reminder **"${updated.name}"** has been successfully updated.`,
          fields: [
            { name: '🕐 Time', value: updated.time, inline: true },
            { name: '📅 Day', value: updated.day, inline: true },
            { name: '🌍 Timezone', value: updated.timezone, inline: true },
            { name: '🆔 ID', value: updated.id.toString(), inline: false }
          ]
        }
      });
    }
    else if (commandName === 'repeat') {
      const id = args.reminder;
      const days = args.days;
      if (!id || !days) {
        pushMessage({ type: 'embed', author: 'Discord Reminders Bot', isBot: true, embed: { color: 'color-error', title: '❌ Error', description: 'Please provide `reminder: ID` and `days: Monday,Tuesday`.' } });
        return;
      }
      const existing = reminders.find(r => r.id === id);
      if (!existing) {
        pushMessage({ type: 'embed', author: 'Discord Reminders Bot', isBot: true, embed: { color: 'color-error', title: '❌ Invalid Selection', description: `No reminder found with ID: ${id}` } });
        return;
      }
      
      const updated = { ...existing, repeat_days: days };
      setReminders(prev => prev.map(r => r.id === id ? updated : r));
      pushMessage({
        type: 'embed',
        author: 'Discord Reminders Bot',
        isBot: true,
        embed: { 
          color: 'color-success', 
          title: '✅ Repeat Settings Updated', 
          description: `Repeat settings for **"${updated.name}"** have been updated.`,
          fields: [
            { name: '🕐 Time', value: updated.time, inline: true },
            { name: '📅 Original Day', value: updated.day, inline: true },
            { name: '🔄 Repeat Days', value: days, inline: false },
            { name: '🆔 ID', value: updated.id.toString(), inline: true }
          ]
        }
      });
    }
    else if (commandName === 'stats') {
      const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
      let color = 'color-info';
      if (completionRate >= 80) color = 'color-success';
      else if (completionRate >= 60) color = 'color-warning';
      else if (stats.total > 0) color = 'color-error';

      const fields = [
        { name: '✅ Completed Reminders', value: stats.completed.toString(), inline: true },
        { name: '❌ Not Completed', value: stats.not_completed.toString(), inline: true },
        { name: '📈 Total Reminders', value: stats.total.toString(), inline: true },
        { name: ' Current Streak', value: `${stats.current_streak} days`, inline: true },
        { name: '⭐ Longest Streak', value: `${stats.longest_streak} days`, inline: true }
      ];

      if (completionRate >= 80) {
        fields.push({ name: '🏆 Achievement', value: 'Excellent performance! You\'re doing great!', inline: false });
      } else if (completionRate >= 60) {
        fields.push({ name: '💪 Keep Going', value: 'Good progress! Keep working on improving your completion rate.', inline: false });
      } else if (stats.total > 0) {
        fields.push({ name: '📚 Room for Improvement', value: 'Focus on completing more reminders to build your streak.', inline: false });
      }

      pushMessage({
        type: 'embed',
        author: 'Discord Reminders Bot',
        isBot: true,
        embed: {
          color: color,
          title: '📊 Your Reminder Statistics',
          description: stats.total === 0 ? 'You haven\'t completed any reminders yet. Start creating reminders with `/reminder` and build your streak!' : 'Here\'s your performance overview',
          thumbnail: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png',
          fields: fields,
          footer: 'Keep up the great work! Every completed reminder builds your streak.'
        }
      });
    }
    else {
      pushMessage({
        type: 'embed',
        author: 'Discord Reminders Bot',
        isBot: true,
        embed: { color: 'color-warning', title: '⚠️ Command Not Found', description: `The command \`/${commandName}\` does not exist.` }
      });
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    setShowAutocomplete(val.startsWith('/'));
  };

  const handleSubmit = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      const isCommand = inputValue.startsWith('/');
      
      if (showAutocomplete && filteredCommands.length > 0) {
        const selectedCmd = filteredCommands[selectedAutocompleteIndex];
        setInputValue('/' + selectedCmd.name + ' ');
        setShowAutocomplete(false);
        e.preventDefault();
        return;
      }

      pushMessage({ type: 'text', author: 'You', isBot: false, text: inputValue });

      if (isCommand) {
        processCommand(inputValue);
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

  const filteredCommands = commands.filter(cmd => 
    ('/' + cmd.name).startsWith(inputValue.split(' ')[0].toLowerCase())
  );

  return (
    <div className="discord-app">
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

      <div className="channel-sidebar">
        <div className="channel-header">Bot Simulator</div>
        <div className="channel-list">
          <div className="channel-item active"><Hash size={20} /><span>bot-testing</span></div>
          <div className="channel-item"><Hash size={20} /><span>general</span></div>
        </div>
        
        <div className="user-area">
          <div className="user-avatar"><User size={20} color="white" /></div>
          <div className="user-info">
            <div className="username">You</div>
            <a href="https://orzz.website" target="_blank" rel="noreferrer" className="status">orzz.website</a>
          </div>
          <Mic size={20} color="var(--header-secondary)" style={{cursor: 'pointer'}} />
          <Headphones size={20} color="var(--header-secondary)" style={{cursor: 'pointer'}} />
          <Settings size={20} color="var(--header-secondary)" style={{cursor: 'pointer'}} />
        </div>
      </div>

      <div className="chat-area">
        <div className="chat-header">
          <Hash size={24} color="var(--text-muted)" />
          <span>bot-testing</span>
          <div style={{ flex: 1 }}></div>
          <Bell size={24} /><Pin size={24} /><Users size={24} />
          <div style={{ width: '144px', height: '24px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', display: 'flex', alignItems: 'center', padding: '0 8px', marginLeft: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', flex: 1 }}>Search</span>
            <Search size={14} color="var(--text-muted)" />
          </div>
          <Inbox size={24} style={{ marginLeft: '16px' }} />
          <HelpCircle size={24} style={{ marginLeft: '16px' }} />
        </div>

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
                    {msg.embed.thumbnail && <img className="embed-thumbnail" src={msg.embed.thumbnail} alt="thumbnail" />}
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
                
                {msg.components && msg.components.map((row, rIdx) => (
                  <div className="action-row" key={rIdx}>
                    {row.buttons.map((btn, bIdx) => (
                      <button 
                        key={bIdx} 
                        className={`discord-button btn-${btn.style}`}
                        onClick={() => handleButton(msg.id, btn.customId)}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          {showAutocomplete && inputValue.startsWith('/') && (
            <div className="autocomplete-popup">
              <div className="autocomplete-header">Commands matching {inputValue}</div>
              <div className="autocomplete-list">
                {filteredCommands.length === 0 ? (
                  <div className="autocomplete-item"><span className="autocomplete-name" style={{ color: 'var(--text-muted)' }}>No commands found</span></div>
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
                      <div>
                        <div className="autocomplete-name">/{cmd.name}</div>
                        <div className="autocomplete-desc">{cmd.desc}</div>
                      </div>
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
