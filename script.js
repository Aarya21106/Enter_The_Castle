import { supabase } from './config.js';
import { Game } from './game_engine.js';

let activeGame = null;

function startGame(user) {
    document.querySelector('.auth-container').classList.add('hidden');
    document.getElementById('game-interface').classList.remove('hidden');

    // Initialize Game
    if (!activeGame) {
        activeGame = new Game('gameCanvas', user.id);
    }
    activeGame.start();
}

// Expose toggleAuth to global scope since it's called by HTML onclick
window.toggleAuth = function () {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (loginForm.classList.contains('hidden')) {
        // Switch to Login
        signupForm.style.opacity = '0';
        setTimeout(() => {
            signupForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            void loginForm.offsetWidth;
            loginForm.style.opacity = '0';
            requestAnimationFrame(() => {
                loginForm.style.opacity = '1';
            });
        }, 300);
    } else {
        // Switch to Signup
        loginForm.style.opacity = '0';
        setTimeout(() => {
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
            void signupForm.offsetWidth;
            signupForm.style.opacity = '0';
            requestAnimationFrame(() => {
                signupForm.style.opacity = '1';
            });
        }, 300);
    }
}

// Handle Login
document.querySelector('#login-form form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const btn = e.target.querySelector('button');
    const originalText = btn.innerHTML;

    btn.innerHTML = 'Opening Gate...';
    btn.disabled = true;

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        alert('Access Denied: ' + error.message);
        btn.innerHTML = originalText;
        btn.disabled = false;
    } else {
        // alert('Welcome back to the Castle, ' + (data.user.email || 'Traveler'));
        startGame(data.user);
    }
});

// Handle Signup
document.querySelector('#signup-form form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const btn = e.target.querySelector('button');
    const originalText = btn.innerHTML;

    btn.innerHTML = 'Forging Key...';
    btn.disabled = true;

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                full_name: name,
            },
        },
    });

    if (error) {
        alert('Forging Failed: ' + error.message);
        btn.innerHTML = originalText;
        btn.disabled = false;
    } else {
        // alert('Citizenship Granted! Please check your scrolls (email) to confirm your oath.');
        startGame(data.user);
    }
});
