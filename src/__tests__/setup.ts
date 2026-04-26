// Minimal browser-API shim so node-based vitest can import modules
// that lazily reach for localStorage during initialization.
// Node 25 exposes a broken localStorage without --localstorage-file, so we
// always overwrite rather than checking for undefined.
const store: Record<string, string> = {};
Object.defineProperty(globalThis, 'localStorage', {
	configurable: true,
	value: {
		getItem: (k: string) => (k in store ? store[k] : null),
		setItem: (k: string, v: string) => {
			store[k] = String(v);
		},
		removeItem: (k: string) => {
			delete store[k];
		},
		clear: () => {
			for (const k of Object.keys(store)) delete store[k];
		},
		key: (i: number) => Object.keys(store)[i] ?? null,
		get length() {
			return Object.keys(store).length;
		},
	} as Storage,
});
