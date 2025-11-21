import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';

// Helper to send a command to the backend via socket.io and receive output
const sendCommand = (socket, cmd) => {
    return new Promise((resolve, reject) => {
        socket.emit('command', cmd);
        socket.once('command-output', data => resolve(data));
        socket.once('command-error', err => reject(new Error(err)));
    });
};

const TerminalPanel = ({ socket }) => {
    const termRef = useRef(null);
    const [term, setTerm] = useState(null);

    useEffect(() => {
        if (!termRef.current) return;
        const xterm = new Terminal({
            cursorBlink: true,
            theme: { background: 'var(--bg-color)', foreground: 'var(--text-primary)' },
        });
        xterm.open(termRef.current);
        setTerm(xterm);

        // Welcome message
        xterm.writeln('\r\n🖥️  Android Dashboard Terminal – type ADB/SSH commands');
        xterm.prompt = () => xterm.write('\r\n$ ');
        xterm.prompt();

        let command = '';
        xterm.onKey(e => {
            const { key, domEvent } = e;
            const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;
            if (domEvent.key === 'Enter') {
                const cmd = command.trim();
                command = '';
                xterm.writeln('');
                if (cmd) {
                    sendCommand(socket, cmd)
                        .then(out => {
                            xterm.writeln(out);
                            xterm.prompt();
                        })
                        .catch(err => {
                            xterm.writeln(`❌ ${err.message}`);
                            xterm.prompt();
                        });
                } else {
                    xterm.prompt();
                }
            } else if (domEvent.key === 'Backspace') {
                if (command.length > 0) {
                    command = command.slice(0, -1);
                    xterm.write('\b \b');
                }
            } else if (printable) {
                command += key;
                xterm.write(key);
            }
        });
    }, [socket]);

    return <div ref={termRef} className="terminal-panel" style={{ height: '300px', width: '100%' }} />;
};

export default TerminalPanel;
