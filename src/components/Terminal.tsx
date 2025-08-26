import React, { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export type TerminalHandle = {
	write: (data: string) => void;
	onData: (cb: (data: string) => void) => void;
	clear: () => void;
	fit: () => void;
};

type Props = {
	className?: string;
	options?: ConstructorParameters<typeof XTerm>[0];
	heightPx?: number;
};

const Terminal = forwardRef<TerminalHandle, Props>(function Terminal(props, ref) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const termRef = useRef<XTerm | null>(null);
	const fitAddonRef = useRef<FitAddon | null>(null);
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		const term = new XTerm({
			convertEol: true,
			cursorBlink: true,
			theme: { background: '#000000' },
			...props.options,
		});
		const fitAddon = new FitAddon();
		term.loadAddon(fitAddon);

		termRef.current = term;
		fitAddonRef.current = fitAddon;

		if (containerRef.current) {
			term.open(containerRef.current);
			fitAddon.fit();
			setIsReady(true);
		}

		const onResize = () => {
			fitAddon.fit();
		};
		window.addEventListener('resize', onResize);

		return () => {
			window.removeEventListener('resize', onResize);
			term.dispose();
		};
	}, []);

	useImperativeHandle(ref, () => ({
		write: (data: string) => termRef.current?.write(data),
		onData: (cb: (data: string) => void) => {
			if (!termRef.current) return;
			termRef.current.onData(cb);
		},
		clear: () => termRef.current?.clear(),
		fit: () => fitAddonRef.current?.fit(),
	}), []);

	return (
		<div className={props.className} style={{ width: '100%', height: `${props.heightPx ?? 240}px`, background: '#000' }}>
			<div ref={containerRef} style={{ width: '100%', height: '100%' }} />
			{!isReady && <div>Preparing terminal…</div>}
		</div>
	);
});

export default Terminal;


