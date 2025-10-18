
import type { UserProfile } from './types';
import { defaultProfile } from './constants';

const getRank = (xp: number): string => {
  if (xp >= 1000) return 'Gold';
  if (xp >= 500) return 'Silver';
  if (xp > 0) return 'Bronze';
  return 'Unranked';
};

const getBadges = (wins: number, existingBadges: string[]): string[] => {
    const newBadges = new Set(existingBadges);
    if (wins >= 1 && !newBadges.has('First Win!')) {
        newBadges.add('First Win!');
    }
    if (wins >= 10 && !newBadges.has('10 Wins')) {
        newBadges.add('10 Wins');
    }
    if (wins >= 50 && !newBadges.has('50 Wins')) {
        newBadges.add('50 Wins');
    }
    return Array.from(newBadges);
};

export const getCurrentUserProfile = (): UserProfile | null => {
    if (typeof window === 'undefined') return null;
    const profileStr = localStorage.getItem('userProfile');
    if (!profileStr) return null;
    return JSON.parse(profileStr) as UserProfile;
};

export const updateUserProfile = (updates: { xp: number, win: boolean }) => {
    if (typeof window === 'undefined') return;
    let currentProfile = getCurrentUserProfile();
    if (!currentProfile) {
        // Create a local fallback profile if none exists
        currentProfile = {
            ...defaultProfile,
            address: '',
        } as UserProfile;
        localStorage.setItem('userProfile', JSON.stringify(currentProfile));
    }

    const newXp = (currentProfile.xp || 0) + (updates.xp || 0);

    const updatedStats = currentProfile.stats ? [...currentProfile.stats.map(s => ({...s}))] : [...defaultProfile.stats.map(s => ({...s}))];
    
    const today = new Date();
    const month = today.toLocaleString('default', { month: 'short' });
    
    let monthStat = updatedStats.find(s => s.month === month);
    if (monthStat) {
        monthStat.gamesPlayed += 1;
        if (updates.win) {
            monthStat.wins += 1;
        }
    } else {
        updatedStats.push({ month, gamesPlayed: 1, wins: updates.win ? 1 : 0 });
    }
    
    const totalWins = updatedStats.reduce((acc, s) => acc + s.wins, 0);
    
    let updatedProfile: UserProfile = { 
        ...currentProfile,
        xp: newXp,
        stats: updatedStats,
        rank: getRank(newXp),
        badges: getBadges(totalWins, currentProfile.badges || []),
    };
    
    if (updatedProfile.address) {
      localStorage.setItem(`userProfile-${updatedProfile.address}`, JSON.stringify(updatedProfile));
    }
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    
    window.dispatchEvent(new CustomEvent('profileUpdated'));
};


export const getAllUserProfiles = (): UserProfile[] => {
    if (typeof window === 'undefined') return [];
    const profiles = new Map<string, UserProfile>();
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('userProfile-')) {
            const profileStr = localStorage.getItem(key);
            if (profileStr) {
                const profile = JSON.parse(profileStr) as UserProfile;
                if (profile.address && !profiles.has(profile.address)) {
                    profiles.set(profile.address, profile);
                }
            }
        }
    }
    // Also include the generic local profile if present
    const genericProfileStr = localStorage.getItem('userProfile');
    if (genericProfileStr) {
      try {
        const genericProfile = JSON.parse(genericProfileStr) as UserProfile;
        const key = genericProfile.address || 'local';
        if (!profiles.has(key)) {
          profiles.set(key, genericProfile);
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    return Array.from(profiles.values());
};
