import { writable } from 'svelte/store';

export const user = writable(null);
export const expiry = writable(null);

const EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export const login = (password) => {
    const credentials = {
        'godmode': 'Ayush',
        'executivemode': 'Adnan',
        'operationsmode': 'Alina'
    };

    const name = credentials[password];
    if (name) {
        const expireAt = Date.now() + EXPIRY_MS;
        user.set(name);
        expiry.set(expireAt);
        localStorage.setItem('addy_admin', name);
        localStorage.setItem('addy_expiry', expireAt);
        return true;
    }
    return false;
};

export const logout = () => {
    user.set(null);
    expiry.set(null);
    localStorage.removeItem('addy_admin');
    localStorage.removeItem('addy_expiry');
};

export const checkSession = () => {
	const name = localStorage.getItem('addy_admin');
	const savedExpiry = Number(localStorage.getItem('addy_expiry'));

	if (name && savedExpiry && Date.now() < savedExpiry) {
		user.set(name);
		expiry.set(savedExpiry);
	} else {
		logout();
	}
};