import { detectRepo, suggestActions, formatSuggestions } from './index';

const profile = detectRepo('/home/karina/Documents/rinawarp-business');
console.log('Profile:', profile);

const actions = suggestActions(profile);
console.log('Actions:', actions);

const formatted = formatSuggestions(profile, actions);
console.log('\nFormatted Suggestions:\n' + formatted);
