import React from 'react';
import { terminalBus } from '../lib/terminalBus';

export default function FooterOpenTerminalButton() {
  return (
    <button onClick={() => terminalBus.emitOpen()} title="Open Terminal">
      Open Terminal
    </button>
  );
}


