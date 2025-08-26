import React from 'react';
import { terminalBus } from '../lib/terminalBus';

export default function FooterOpenTerminalButton() {
  return (
    <button onClick={() => terminalBus.emitToggle()} title="Toggle Terminal">
      Toggle Terminal
    </button>
  );
}


