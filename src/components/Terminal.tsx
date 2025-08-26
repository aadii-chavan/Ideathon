import React, { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

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
		const css = getComputedStyle(document.documentElement);
		const h = (name: string) => `hsl(${css.getPropertyValue(name).trim()})`;

		const term = new XTerm({
			convertEol: true,
			cursorBlink: true,
			cursorStyle: 'bar',
			fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
			fontSize: 12,
			theme: {
				background: h('--card'),
				foreground: h('--foreground'),
				selection: 'rgba(124, 58, 237, 0.35)',
				cursor: h('--accent'),
				black: '#1F2937',
				red: h('--destructive'),
				green: h('--success'),
				yellow: h('--warning'),
				blue: h('--secondary'),
				magenta: h('--accent'),
				cyan: '#22D3EE',
				white: '#E5E7EB',
				brightBlack: '#6B7280',
				brightRed: '#EF4444',
				brightGreen: '#22C55E',
				brightYellow: '#F59E0B',
				brightBlue: '#3B82F6',
				brightMagenta: '#A855F7',
				brightCyan: '#06B6D4',
				brightWhite: '#F9FAFB',
			},
			...props.options,
		});
		const fitAddon = new FitAddon();
		term.loadAddon(fitAddon);

		termRef.current = term;
		fitAddonRef.current = fitAddon;

		const safeFit = () => {
			const container = containerRef.current;
			if (!container || !container.isConnected) return;
			if (container.clientWidth === 0 || container.clientHeight === 0) return;
			const t = termRef.current;
			const f = fitAddonRef.current;
			if (!t || !f) return;
			try {
				const dims = f.proposeDimensions();
				if (dims && dims.cols > 0 && dims.rows > 0) {
					t.resize(dims.cols, dims.rows);
				}
			} catch (_) {}
		};

		if (containerRef.current) {
			term.open(containerRef.current);
			requestAnimationFrame(() => {
				safeFit();
				setIsReady(true);
			});
		}

		const onResize = () => safeFit();
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
		fit: () => {
			const container = containerRef.current;
			const t = termRef.current;
			const f = fitAddonRef.current;
			if (!container || !container.isConnected || !t || !f) return;
			if (container.clientWidth === 0 || container.clientHeight === 0) return;
			try {
				const dims = f.proposeDimensions();
				if (dims && dims.cols > 0 && dims.rows > 0) {
					t.resize(dims.cols, dims.rows);
				}
			} catch (_) {}
		},
	}), []);

	return (
		<div className={props.className} style={{ width: '100%', height: `${props.heightPx ?? 240}px`, background: '#000' }}>
			<div ref={containerRef} style={{ width: '100%', height: '100%' }} />
			{!isReady && <div>Preparing terminal…</div>}
		</div>
	);
});

export default Terminal;


