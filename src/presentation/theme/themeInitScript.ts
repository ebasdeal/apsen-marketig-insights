import { THEME_STORAGE_KEY } from '../stores/themeStore';
import { DARK_MEDIA_QUERY } from './resolveTheme';

const storageKey = JSON.stringify(THEME_STORAGE_KEY);
const mediaQuery = JSON.stringify(DARK_MEDIA_QUERY);

export const themeInitScript = `(function(){try{var p='system';var raw=window.localStorage.getItem(${storageKey});if(raw){var s=JSON.parse(raw);var v=s&&s.state&&s.state.preference;if(v==='light'||v==='dark'){p=v;}}var dark=p==='dark'||(p==='system'&&window.matchMedia(${mediaQuery}).matches);document.documentElement.classList.toggle('dark',dark);}catch(e){}})();`;
