import { supabase } from './config.js';
import { Game } from './game_engine.js?v=3.0';

// Global State
let activeGame = null;
let currentUser = null;
let currentProfile = null;

// --- DOM Elements ---
const screens = {
    auth: document.getElementById('auth-screen'),
    username: document.getElementById('username-modal'),
    entry: document.getElementById('entry-screen'),
    game: document.getElementById('game-interface'),
    postGame: document.getElementById('post-game-screen'),
    leaderboard: document.getElementById('leaderboard-modal')
};

const forms = {
    emailLogin: document.getElementById('email-login-form'),
    username: document.getElementById('username-form')
};

const buttons = {
    googleLogin: document.getElementById('google-login-btn'),
    toggleAuth: document.getElementById('toggle-auth-mode-btn'),
    startGameZone: document.getElementById('start-game-zone'),
    openLeaderboard: document.getElementById('open-leaderboard-btn'),
    logout: document.getElementById('logout-btn'),
    share: document.getElementById('share-btn'),
    restart: document.getElementById('restart-btn')
};

// --- Initialization ---
init();

async function init() {
    // Check Session
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        handleUserAuthenticated(session.user);
    } else {
        showScreen('auth');
    }

    // Event Listeners
    setupEventListeners();

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') handleUserAuthenticated(session.user);
        if (event === 'SIGNED_OUT') {
            currentUser = null;
            currentProfile = null;
            showScreen('auth');
        }
    });
}

function setupEventListeners() {
    // Auth
    buttons.googleLogin.addEventListener('click', async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        });
    });

    // Email Auth (Simplified for MVP, can be expanded)
    forms.emailLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email-input').value;
        const password = document.getElementById('password-input').value;

        // Try sign in
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) alert(error.message);
    });

    buttons.toggleAuth.addEventListener('click', () => {
        const btn = buttons.toggleAuth;
        const formBtn = forms.emailLogin.querySelector('button');
        const title = document.querySelector('.form-wrapper h1');

        if (btn.innerText.includes('Sign Up')) {
            // Switch to Sign Up Mode context
            btn.innerText = 'Already pledged allegiance? Log In';
            formBtn.innerText = 'Forge Account';
            title.innerText = 'JOIN THE REALM';
            forms.emailLogin.onsubmit = async (e) => {
                e.preventDefault();
                const email = document.getElementById('email-input').value;
                const password = document.getElementById('password-input').value;
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) alert(error.message);
                else alert('Check your email scrolls to confirm the oath.');
            };
        } else {
            // Switch back to Login
            btn.innerText = 'Forging a new path? Sign Up';
            formBtn.innerText = 'Enter via Email';
            title.innerText = 'ENTER THE CASTLE';
            forms.emailLogin.onsubmit = async (e) => { /* Reset to login logic above */ };
            location.reload(); // Simplest way to reset handlers for now
        }
    });

    // Username Setup
    forms.username.addEventListener('submit', handleUsernameSubmit);

    // Navigation
    buttons.startGameZone.addEventListener('click', startGame);
    buttons.openLeaderboard.addEventListener('click', showLeaderboard);
    buttons.logout.addEventListener('click', () => supabase.auth.signOut());

    // Post Game
    buttons.restart.addEventListener('click', () => {
        screens.postGame.classList.add('hidden');
        startGame();
    });

    document.getElementById('home-btn').addEventListener('click', () => {
        screens.postGame.classList.add('hidden');
        loadEntryScreen();
    });

    buttons.share.addEventListener('click', shareResult);
}

// --- Auth Flow ---

async function handleUserAuthenticated(user) {
    currentUser = user;

    // Fetch Profile
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Profile fetch error:', error);
        return;
    }

    if (!profile || !profile.username) {
        // New user or no username
        showScreen('username');
    } else {
        currentProfile = profile;
        loadEntryScreen();
    }
}

async function handleUsernameSubmit(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('new-username');
    const errorMsg = document.getElementById('username-error');
    const username = usernameInput.value.trim();

    // Validate
    if (!/^[a-zA-Z0-9_]{3,15}$/.test(username)) {
        errorMsg.innerText = "Username must be 3-15 chars, alphanumeric or underscore.";
        return;
    }

    // Check Uniqueness (Optimistic: try update, catch violation)
    const { error } = await supabase
        .from('profiles')
        .upsert({ id: currentUser.id, username: username, high_score: 0 });

    if (error) {
        if (error.code === '23505') { // Unique violation
            errorMsg.innerText = "This title is already taken.";
        } else {
            errorMsg.innerText = "Error carving name: " + error.message;
        }
    } else {
        currentProfile = { id: currentUser.id, username, high_score: 0 };
        loadEntryScreen();
    }
}

// --- Entry & Leaderboard ---

async function loadEntryScreen() {
    showScreen('entry');
    updateLeaderboardPreview();
}

async function updateLeaderboardPreview() {
    const list = document.getElementById('top-knights-list');

    const { data: knights } = await supabase
        .from('profiles')
        .select('username, high_score')
        .order('high_score', { ascending: false })
        .limit(3);

    list.innerHTML = '';
    if (knights) {
        knights.forEach((k, i) => {
            const li = document.createElement('li');
            li.innerText = `#${i + 1} ${k.username} - ${k.high_score}m`;
            list.appendChild(li);
        });
    }
}

async function showLeaderboard() {
    screens.leaderboard.classList.remove('hidden');
    const tbody = document.querySelector('#full-leaderboard-table tbody');
    tbody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';

    const { data: knights } = await supabase
        .from('profiles')
        .select('username, high_score')
        .order('high_score', { ascending: false })
        .limit(50);

    tbody.innerHTML = '';
    if (knights) {
        knights.forEach((k, i) => {
            const row = `<tr>
                <td>#${i + 1}</td>
                <td>${k.username} ${currentProfile?.username === k.username ? '(You)' : ''}</td>
                <td>${k.high_score}m</td>
            </tr>`;
            tbody.innerHTML += row;
        });
    }
}

// --- Game Logic ---

function startGame() {
    showScreen('game');

    if (!activeGame) {
        activeGame = new Game('gameCanvas', currentUser.id, currentProfile.high_score, handleGameEnd);
    } else {
        activeGame.highScore = currentProfile.high_score; // Sync latest
    }

    activeGame.start();
}

async function handleGameEnd(score) {
    const finalScore = Math.floor(score);
    const isNewBest = finalScore > currentProfile.high_score;

    // Update Local State
    if (isNewBest) currentProfile.high_score = finalScore;

    // Show Result Screen
    document.getElementById('result-distance').innerText = `${finalScore}m`;
    document.getElementById('result-best').innerText = `${currentProfile.high_score}m`;

    // Get Rank (approximate)
    const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('high_score', finalScore);

    document.getElementById('result-rank').innerText = `#${(count || 0) + 1}`;
    document.getElementById('result-title').innerText = isNewBest ? "NEW LEGEND" : "DOOMED";
    document.getElementById('result-title').style.color = isNewBest ? "#ffd700" : "#ff4444";

    screens.postGame.classList.remove('hidden');

    // Persist Data (Fire and Forget to not block UI)
    saveGameData(finalScore);
}

async function saveGameData(score) {
    const time = activeGame.timeSurvived;

    // 1. Update Profile Stats (Total Distance, Games Played, High Score)
    const { data: profile } = await supabase.from('profiles').select('games_played, total_distance, high_score').eq('id', currentUser.id).single();

    const newGamesPlayed = (profile?.games_played || 0) + 1;
    const newTotalDist = (profile?.total_distance || 0) + score;
    const updates = {
        games_played: newGamesPlayed,
        total_distance: newTotalDist,
        updated_at: new Date()
    };

    if (score > (profile?.high_score || 0)) {
        updates.high_score = score;
    }

    await supabase.from('profiles').update(updates).eq('id', currentUser.id);

    // 2. Insert Run Record
    await supabase.from('game_runs').insert({
        user_id: currentUser.id,
        distance: score,
        time_survived: time
    });
}

// --- Social Sharing ---

async function shareResult() {
    // 1. Capture Screenshot
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    // Create a composite image (Canvas + Text)
    const storedCanvas = document.createElement('canvas');
    storedCanvas.width = canvas.width;
    storedCanvas.height = canvas.height;
    const ctx = storedCanvas.getContext('2d');

    // Draw Game
    ctx.drawImage(canvas, 0, 0);

    // Overlay Score
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, storedCanvas.width, storedCanvas.height);

    // Title
    ctx.font = 'bold 40px Cinzel';
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'center';
    ctx.fillText('ENTER THE CASTLE', storedCanvas.width / 2, 100);

    // Score
    ctx.font = '60px Inter';
    ctx.fillStyle = '#fff';
    ctx.fillText(`${Math.floor(activeGame.distanceTravelled)}m`, storedCanvas.width / 2, storedCanvas.height / 2);

    // Label
    ctx.font = '24px Inter';
    ctx.fillStyle = '#a0a0a0';
    ctx.fillText('SURVIVED', storedCanvas.width / 2, storedCanvas.height / 2 - 50);

    // URL
    ctx.font = '16px Inter';
    ctx.fillStyle = '#666';
    ctx.fillText('enterthecastle.com', storedCanvas.width / 2, storedCanvas.height - 40);


    // Convert to Blob
    storedCanvas.toBlob(async (blob) => {
        const file = new File([blob], 'masoleum_record.png', { type: 'image/png' });

        const text = `I survived ${Math.floor(activeGame.distanceTravelled)}m in Enter The Castle! #EnterTheCastle`;

        if (navigator.share && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    title: 'Enter The Castle Record',
                    text: text,
                    files: [file]
                });
            } catch (err) {
                console.log('Share canceled or failed', err);
                fallbackShare(text);
            }
        } else {
            fallbackShare(text);
            // Auto download as valid fallback
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'my-score.png';
            a.click();
            alert('Screenshot downloaded! Share it manually.');
        }
    });
}

function fallbackShare(text) {
    navigator.clipboard.writeText(text);
    alert('Score copied! Image downloaded (if supported).');
}

// --- Helpers ---
function showScreen(name) {
    Object.values(screens).forEach(el => el.classList.add('hidden'));
    screens[name].classList.remove('hidden');
}

