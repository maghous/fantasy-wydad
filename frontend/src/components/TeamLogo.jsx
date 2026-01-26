import { DEFAULT_LOGOS } from '../utils/constants';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TeamLogo = ({ teamName, logoUrl, size = "w-12 h-12", className = "" }) => {
    const normalizedName = teamName ? teamName.toLowerCase().trim() : "";

    // Priority:
    // 1. Explicit logoUrl (from Admin/DB)
    // 2. Predefined mapping (Exact match)
    // 3. Predefined mapping (Normalized match)
    // 4. Fallback: try to guess /logos/TEAM NAME.png (literal guess)
    const finalLogo = logoUrl ||
        DEFAULT_LOGOS[teamName] ||
        DEFAULT_LOGOS[normalizedName];

    // Debugging during dev
    if (!finalLogo && teamName && process.env.NODE_ENV === 'development') {
        console.warn(`[Logo] No mapping found for: "${teamName}". Filename check recommended.`);
    }

    // Attempt literal guess if no mapping found
    const displayLogo = finalLogo || (teamName ? `/logos/${teamName}.png` : null);

    // Prefix with API_URL if it's an uploaded file
    const srcUrl = displayLogo && displayLogo.startsWith('/uploads')
        ? `${API_URL}${displayLogo}`
        : displayLogo;

    if (srcUrl) {
        return (
            <div className={`${size} rounded-full overflow-hidden bg-white/10 p-1 flex items-center justify-center border border-white/5 ${className}`}>
                <img
                    src={srcUrl}
                    alt={`${teamName} logo`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                        e.target.onerror = null;
                        // Final fallback to initials if image fails to load
                        e.target.style.display = 'none';
                        const parent = e.target.parentNode;
                        if (parent) {
                            parent.innerHTML = `<span class="text-[10px] uppercase font-black">${teamName ? teamName[0] : '?'}</span>`;
                        }
                    }}
                />
            </div>
        );
    }

    // Fallback if no logo found
    return (
        <div className={`${size} rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center text-white font-black uppercase text-xs ${className}`}>
            {teamName ? teamName.substring(0, 2) : '?'}
        </div>
    );
};

export default TeamLogo;
