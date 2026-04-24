import React, { useState, useEffect, useRef } from 'react';
import { Hash, Compass, Plus, Mic, Headphones, Settings, Bell, Pin, Users, Search, Inbox, HelpCircle, CheckCircle2, Bot, User, Home, Info } from 'lucide-react';

function Tooltip({ children, text }) {
  return (
    <div className="tooltip-container">
      {children}
      <div className="tooltip">{text}</div>
    </div>
  );
}

export default function App() {
  const [activeServer, setActiveServer] = useState('info'); // Start at info page
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'text',
      author: 'Discord Reminders Bot',
      isBot: true,
      text: 'Hello! I am the exact Discord Reminders Bot simulator. Type `/` to see my commands and use the interactive options menu!',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [reminders, setReminders] = useState([]);
  const [stats, setStats] = useState({ completed: 5, not_completed: 1, total: 6, current_streak: 3, longest_streak: 5 });
  
  // Slash command UI state
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedAutocompleteIndex, setSelectedAutocompleteIndex] = useState(0);
  const [activeCommand, setActiveCommand] = useState(null);
  const [commandOptions, setCommandOptions] = useState({});
  const [focusedOption, setFocusedOption] = useState(null);

  const messagesEndRef = useRef(null);
  const optionRefs = useRef({});
  const extraInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (activeCommand) {
      if (focusedOption && optionRefs.current[focusedOption]) {
        optionRefs.current[focusedOption].focus();
      } else if (!focusedOption && extraInputRef.current) {
        extraInputRef.current.focus();
      }
    }
  }, [focusedOption, activeCommand]);

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
    { 
      name: 'reminder', 
      desc: 'Create a new reminder',
      options: [
        { name: 'name', desc: 'Description/name for your reminder', choices: null },
        { name: 'time', desc: 'Time in HH:MM format', choices: null },
        { name: 'day', desc: 'Day of the week', choices: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
        { name: 'timezone', desc: 'Your timezone', choices: ['UTC', 'EST', 'CST', 'MST', 'PST', 'GMT'] },
        { name: 'ping', desc: 'Should the bot ping you?', choices: ['true', 'false'] }
      ]
    },
    { 
      name: 'list', 
      desc: 'Show all your active reminders',
      options: []
    },
    { 
      name: 'remove', 
      desc: 'Remove a specific reminder',
      options: [
        { name: 'reminder', desc: 'Select the reminder (ID)', choices: null }
      ]
    },
    { 
      name: 'clean', 
      desc: 'Remove all your active reminders',
      options: []
    },
    { 
      name: 'edit', 
      desc: 'Edit an existing reminder',
      options: [
        { name: 'reminder', desc: 'Select the reminder to edit (ID)', choices: null },
        { name: 'time', desc: 'New time in HH:MM format', choices: null },
        { name: 'day', desc: 'New day of the week', choices: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
        { name: 'timezone', desc: 'New timezone', choices: ['UTC', 'EST', 'CST', 'MST', 'PST', 'GMT'] }
      ]
    },
    { 
      name: 'repeat', 
      desc: 'Set repeat days for an existing reminder',
      options: [
        { name: 'reminder', desc: 'Select the reminder (ID)', choices: null },
        { name: 'days', desc: 'Days to repeat (comma-separated)', choices: null }
      ]
    },
    { 
      name: 'stats', 
      desc: 'View your reminder statistics and streak',
      options: []
    }
  ];

  const processCommand = (cmdName, args) => {
    if (cmdName === 'reminder') {
      const name = args.name || 'Untitled Reminder';
      const time = args.time || '12:00';
      const day = args.day || 'Today';
      const timezone = args.timezone || 'UTC';
      const ping = args.ping || 'true';
      
      let targetDate = new Date();
      try {
        const timeParts = time.match(/(\d+)(?::(\d+))?\s*(am|pm)?/i);
        if (timeParts) {
          let hours = parseInt(timeParts[1]);
          const mins = parseInt(timeParts[2]) || 0;
          const ampm = timeParts[3]?.toLowerCase();
          if (ampm === 'pm' && hours < 12) hours += 12;
          if (ampm === 'am' && hours === 12) hours = 0;
          targetDate.setHours(hours, mins, 0, 0);
          if (targetDate < new Date()) targetDate.setDate(targetDate.getDate() + 1); // Next day if time passed
        }
      } catch (e) {}
      const timestampSeconds = Math.floor(targetDate.getTime() / 1000);
      
      const newReminder = { id: Date.now().toString().slice(-4), name, time, day, timezone, ping: ping === 'true' };
      setReminders(prev => [...prev, newReminder]);
      setStats(prev => ({ ...prev, total: prev.total + 1 }));

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
            { name: '🕰️ Reminder Time', value: `<t:${timestampSeconds}:F>`, inline: false }
          ],
          footer: `Reminder ID: ${newReminder.id}`
        }
      });

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
    else if (cmdName === 'list') {
      if (reminders.length === 0) {
        pushMessage({ type: 'embed', author: 'Discord Reminders Bot', isBot: true, embed: { color: 'color-info', title: '📋 No Active Reminders', description: 'You don\'t have any active reminders. Use `/reminder` to create one!' } });
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
    else if (cmdName === 'clean') {
      if (reminders.length === 0) {
        pushMessage({ type: 'embed', author: 'Discord Reminders Bot', isBot: true, embed: { color: 'color-info', title: '📋 No Reminders to Clean', description: 'You don\'t have any active reminders to remove.' } });
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
    else if (cmdName === 'remove') {
      const id = args.reminder;
      if (!id) return pushMessage({ type: 'embed', author: 'Discord Reminders Bot', isBot: true, embed: { color: 'color-error', title: '❌ Error', description: 'Please provide a reminder ID.' } });
      
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
            color: 'color-success', title: '✅ Reminder Removed', description: `Your reminder **"${reminderToRemove.name}"** has been successfully removed.`,
            fields: [
              { name: '🕐 Time', value: reminderToRemove.time, inline: true },
              { name: '📅 Day', value: reminderToRemove.day, inline: true },
              { name: '🆔 ID', value: reminderToRemove.id.toString(), inline: true }
            ]
          }
        });
      }
    }
    else if (cmdName === 'edit') {
      const id = args.reminder;
      if (!id) return pushMessage({ type: 'embed', author: 'Discord Reminders Bot', isBot: true, embed: { color: 'color-error', title: '❌ Error', description: 'Please provide a reminder ID.' } });
      const existing = reminders.find(r => r.id === id);
      if (!existing) return pushMessage({ type: 'embed', author: 'Discord Reminders Bot', isBot: true, embed: { color: 'color-error', title: '❌ Invalid Selection', description: `No reminder found with ID: ${id}` } });
      if (!args.time && !args.day && !args.timezone) return pushMessage({ type: 'embed', author: 'Discord Reminders Bot', isBot: true, embed: { color: 'color-error', title: '❌ No Changes', description: `Please specify at least one field to edit (time, day, timezone).` } });

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
          color: 'color-success', title: '✅ Reminder Updated', description: `Your reminder **"${updated.name}"** has been successfully updated.`,
          fields: [
            { name: '🕐 Time', value: updated.time, inline: true },
            { name: '📅 Day', value: updated.day, inline: true },
            { name: '🌍 Timezone', value: updated.timezone, inline: true },
            { name: '🆔 ID', value: updated.id.toString(), inline: false }
          ]
        }
      });
    }
    else if (cmdName === 'repeat') {
      const id = args.reminder;
      const days = args.days;
      if (!id || !days) return pushMessage({ type: 'embed', author: 'Discord Reminders Bot', isBot: true, embed: { color: 'color-error', title: '❌ Error', description: 'Please provide `reminder` and `days`.' } });
      const existing = reminders.find(r => r.id === id);
      if (!existing) return pushMessage({ type: 'embed', author: 'Discord Reminders Bot', isBot: true, embed: { color: 'color-error', title: '❌ Invalid Selection', description: `No reminder found with ID: ${id}` } });
      
      const updated = { ...existing, repeat_days: days };
      setReminders(prev => prev.map(r => r.id === id ? updated : r));
      pushMessage({
        type: 'embed',
        author: 'Discord Reminders Bot',
        isBot: true,
        embed: { 
          color: 'color-success', title: '✅ Repeat Settings Updated', description: `Repeat settings for **"${updated.name}"** have been updated.`,
          fields: [
            { name: '🕐 Time', value: updated.time, inline: true },
            { name: '📅 Original Day', value: updated.day, inline: true },
            { name: '🔄 Repeat Days', value: days, inline: false },
            { name: '🆔 ID', value: updated.id.toString(), inline: true }
          ]
        }
      });
    }
    else if (cmdName === 'stats') {
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

      if (completionRate >= 80) fields.push({ name: '🏆 Achievement', value: 'Excellent performance! You\'re doing great!', inline: false });
      else if (completionRate >= 60) fields.push({ name: '💪 Keep Going', value: 'Good progress! Keep working on improving your completion rate.', inline: false });
      else if (stats.total > 0) fields.push({ name: '📚 Room for Improvement', value: 'Focus on completing more reminders to build your streak.', inline: false });

      pushMessage({
        type: 'embed',
        author: 'Discord Reminders Bot',
        isBot: true,
        embed: {
          color: color, title: '📊 Your Reminder Statistics',
          description: stats.total === 0 ? 'You haven\'t completed any reminders yet. Start creating reminders with `/reminder` and build your streak!' : 'Here\'s your performance overview',
          thumbnail: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png',
          fields: fields, footer: 'Keep up the great work! Every completed reminder builds your streak.'
        }
      });
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    setShowAutocomplete(val.startsWith('/'));
  };

  const handleTextSubmit = (e) => {
    if ((e.key === 'Enter' || e.key === 'Tab') && inputValue.trim()) {
      if (showAutocomplete && filteredCommands.length > 0) {
        e.preventDefault();
        const selectedCmd = filteredCommands[selectedAutocompleteIndex];
        setActiveCommand(selectedCmd);
        setCommandOptions({});
        if (selectedCmd.options.length > 0) {
          setFocusedOption(selectedCmd.options[0].name);
        }
        setInputValue('');
        setShowAutocomplete(false);
        return;
      }

      if (e.key === 'Enter') {
        pushMessage({ type: 'text', author: 'You', isBot: false, text: inputValue });
        setInputValue('');
        setShowAutocomplete(false);
      }
    } else if (e.key === 'ArrowDown' && showAutocomplete) {
      e.preventDefault();
      setSelectedAutocompleteIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp' && showAutocomplete) {
      e.preventDefault();
      setSelectedAutocompleteIndex(prev => Math.max(prev - 1, 0));
    }
  };

  const submitCommandUI = () => {
    let commandText = `/${activeCommand.name}`;
    Object.keys(commandOptions).forEach(k => {
      if (commandOptions[k]) commandText += ` ${k}: ${commandOptions[k]}`;
    });
    pushMessage({ type: 'text', author: 'You', isBot: false, text: commandText });
    processCommand(activeCommand.name, commandOptions);
    setActiveCommand(null);
    setCommandOptions({});
    setFocusedOption(null);
    setInputValue(''); // Fixed: Clear input value so it doesn't stay stuck
  };

  const handleOptionKeyDown = (e, optName) => {
    const optObj = activeCommand.options.find(o => o.name === optName);
    const val = commandOptions[optName] || '';
    const choices = optObj?.choices?.filter(c => c.toLowerCase().startsWith(val.toLowerCase())) || [];
    const canAutocomplete = optObj?.choices && choices.length > 0 && val.toLowerCase() !== choices[0].toLowerCase();

    if (e.key === 'Tab') {
      e.preventDefault();
      if (canAutocomplete) {
        setCommandOptions(prev => ({...prev, [optName]: choices[0]}));
      }
      const idx = activeCommand.options.findIndex(o => o.name === optName);
      if (idx !== -1 && idx < activeCommand.options.length - 1) {
        setFocusedOption(activeCommand.options[idx + 1].name);
      } else {
        setFocusedOption(null); // This will focus the extra input
      }
    } else if (e.key === 'Enter') {
      if (canAutocomplete) {
        e.preventDefault();
        setCommandOptions(prev => ({...prev, [optName]: choices[0]}));
        const idx = activeCommand.options.findIndex(o => o.name === optName);
        if (idx !== -1 && idx < activeCommand.options.length - 1) {
          setFocusedOption(activeCommand.options[idx + 1].name);
        } else {
          setFocusedOption(null);
        }
      } else {
        submitCommandUI();
      }
    } else if (e.key === 'Backspace' && !val) {
      e.preventDefault();
      const idx = activeCommand.options.findIndex(o => o.name === optName);
      if (idx > 0) {
        setFocusedOption(activeCommand.options[idx - 1].name);
      } else {
        const cmdName = activeCommand.name;
        setActiveCommand(null);
        setInputValue('/' + cmdName);
      }
    }
  };

  const filteredCommands = commands.filter(cmd => 
    ('/' + cmd.name).startsWith(inputValue.split(' ')[0].toLowerCase())
  );

  const activeOptionObj = activeCommand?.options.find(o => o.name === focusedOption);

  return (
    <div className="discord-app">
      <div className="server-sidebar">
        {/* Home / Info Server Button at the very top */}
        <Tooltip text="Web Simulator Information">
          <div className={`server-icon ${activeServer === 'info' ? 'active' : ''}`} style={{ backgroundColor: activeServer === 'info' ? 'var(--brand-color)' : '#1e1f22', color: 'white' }} onClick={() => setActiveServer('info')}>
            <Home size={28} />
          </div>
        </Tooltip>

        <div className="server-separator"></div>

        <Tooltip text="Discord-reminders-bot Simulator">
          <div className={`server-icon ${activeServer === 'bot' ? 'active' : ''}`} onClick={() => setActiveServer('bot')}>
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

      {activeServer === 'info' ? (
        <div style={{ flex: 1, backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <Info size={64} color="var(--brand-color)" style={{ marginBottom: '24px' }} />
          <h1 style={{ fontSize: '36px', marginBottom: '16px', fontWeight: 800, color: 'white' }}>Welcome to the Web Simulator</h1>
          <p style={{ fontSize: '18px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '600px', lineHeight: '1.6' }}>
            This website is a fully interactive replica of the Discord UI, created specifically to let you test the <strong>Discord-reminders-bot</strong> directly from your browser—without needing to invite it to a real server.
          </p>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: '8px', marginTop: '40px', maxWidth: '600px', width: '100%', borderLeft: '4px solid #f39c12' }}>
            <h3 style={{ color: 'var(--header-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚠️ Experimental Version
            </h3>
            <p style={{ color: 'var(--text-normal)', lineHeight: '1.5' }}>
              Please note that this is an experimental web version. Data is stored temporarily and will be cleared if you refresh the page. The <strong>real Discord bot</strong> runs on an actual database, guaranteeing superior persistence, stability, and performance.
            </p>
          </div>
        </div>
      ) : (
        <>
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
              {showAutocomplete && inputValue.startsWith('/') && !activeCommand && (
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
                            setActiveCommand(cmd);
                            setCommandOptions({});
                            if (cmd.options.length > 0) setFocusedOption(cmd.options[0].name);
                            setInputValue('');
                            setShowAutocomplete(false);
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

              {activeCommand && focusedOption && activeOptionObj?.choices && (
                <div className="autocomplete-popup" style={{ width: '250px' }}>
                  <div className="autocomplete-header">OPTIONS</div>
                  <div className="autocomplete-list">
                    {(activeOptionObj.choices.filter(c => c.toLowerCase().startsWith((commandOptions[focusedOption] || '').toLowerCase())).length > 0 
                      ? activeOptionObj.choices.filter(c => c.toLowerCase().startsWith((commandOptions[focusedOption] || '').toLowerCase()))
                      : activeOptionObj.choices).map((choice, idx) => (
                      <div 
                        key={choice} 
                        className="autocomplete-item"
                        onClick={() => {
                          setCommandOptions({...commandOptions, [focusedOption]: choice});
                          const optIdx = activeCommand.options.findIndex(o => o.name === focusedOption);
                          if (optIdx !== -1 && optIdx < activeCommand.options.length - 1) {
                            setFocusedOption(activeCommand.options[optIdx + 1].name);
                          } else {
                            setFocusedOption(null);
                          }
                        }}
                      >
                        <div className="autocomplete-name">{choice}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="chat-input-wrapper" onClick={() => {
                if (activeCommand && !focusedOption) {
                  const lastOpt = activeCommand.options[activeCommand.options.length - 1];
                  if (lastOpt) setFocusedOption(lastOpt.name);
                }
              }}>
                <Plus size={24} color="var(--interactive-normal)" style={{ marginRight: '16px', cursor: 'pointer' }} />
                
                {activeCommand ? (
                  <div className="slash-command-ui">
                    <span className="slash-command-name">/{activeCommand.name}</span>
                    {activeCommand.options.map((opt) => (
                      <div 
                        className={`command-option-pill ${focusedOption === opt.name ? 'focused' : ''}`} 
                        key={opt.name} 
                        onClick={(e) => { e.stopPropagation(); setFocusedOption(opt.name); }}
                      >
                        <span className="command-option-name">{opt.name}</span>
                        <input 
                          ref={el => optionRefs.current[opt.name] = el}
                          type="text" 
                          className="command-option-value" 
                          value={commandOptions[opt.name] || ''}
                          onChange={(e) => setCommandOptions({...commandOptions, [opt.name]: e.target.value})}
                          onFocus={() => setFocusedOption(opt.name)}
                          onKeyDown={(e) => handleOptionKeyDown(e, opt.name)}
                          autoFocus={focusedOption === opt.name}
                          style={{ width: commandOptions[opt.name] ? `${Math.max(commandOptions[opt.name].length, 1) + 1.5}ch` : '2ch' }}
                        />
                      </div>
                    ))}
                    <input
                      ref={extraInputRef}
                      type="text"
                      className="slash-command-extra-input"
                      value=""
                      onChange={() => {}}
                      onFocus={() => setFocusedOption(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace') {
                          e.preventDefault();
                          const lastOpt = activeCommand.options[activeCommand.options.length - 1];
                          if (lastOpt) setFocusedOption(lastOpt.name);
                          else {
                            const cmdName = activeCommand.name;
                            setActiveCommand(null);
                            setInputValue('/' + cmdName);
                          }
                        } else if (e.key === 'Enter') {
                          submitCommandUI();
                        }
                      }}
                      style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', cursor: 'text', minWidth: '10px' }}
                    />
                  </div>
                ) : (
                  <input 
                    type="text" 
                    className="chat-input" 
                    placeholder="Message #bot-testing (Try typing / to see bot commands)" 
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleTextSubmit}
                    autoComplete="off"
                  />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
