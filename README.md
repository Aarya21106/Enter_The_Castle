
# 🥷 Enter The Castle

**Ninja Gravity Run** is a **mobile-first vertical endless runner** built around **speed, perception, and precise control**.
Players race upward through a dangerous castle by switching gravity between walls using a **single tap**, competing on a **global leaderboard** for real prizes.

> *Easy to learn. Hard to master. Pure skill.*

---

## 🎮 Game Overview

* **Genre:** Endless Runner / Arcade / Skill-based
* **Platform:** Mobile (Portrait)
* **Control:** Single tap
* **Engine:** Antigravity (or Unity 2D equivalent)
* **Players:** 500+ competitive users
* **Session Length:** 20–90 seconds (average)

The game is designed to be:

* Smooth and fair
* Highly replayable
* Competitive by nature
* Resistant to cheating
* Launch-ready within one week

---

## 🥷 Core Gameplay

* The player controls a **ninja** that runs **vertically upward**
* The environment scrolls upward continuously
* The ninja can attach to either:

  * Left wall
  * Right wall
* **One tap = switch gravity to the opposite wall**
* The player cannot stop or slow down manually

### Game Over Conditions

* Hitting an obstacle
* Touching an enemy without protection
* Falling below the bottom of the screen

---

## ⏱ Difficulty & Speed Progression

All difficulty is controlled by **time and distance**, never randomness.

### Phases (Simplified)

* **0–7 seconds (Trial Phase)**

  * Slow speed
  * Only wall blades
  * Minimal obstacles
  * Guaranteed learning window

* **7–15 seconds**

  * Speed increases slightly every 3 seconds
  * Middle spinning shurikens appear (center)

* **15–25 seconds**

  * Middle shurikens shift slightly left/right
  * Still fully passable
  * No enemies yet

* **25–30 seconds**

  * First enemy ninjas appear (low count)
  * Shield and boost power-ups enabled

* **30+ seconds**

  * Speed increases smoothly and continuously
  * More obstacles and enemies
  * Spacing remains fair
  * Only skill determines survival

The game never becomes unfair — only faster and denser.

---

## ⚠️ Obstacles & Enemies

### Obstacles

* Wall blades (early game)
* Middle spinning shurikens
* Axial shurikens (off-center positions)

### Enemies

* Static **bad ninjas**
* Kill on contact
* Introduced gradually
* Predictable placement for fairness

---

## ⚡ Power-Ups

Power-ups are **rare and supportive**, never dominant.

* **Shield**

  * Blocks one hit
  * Can destroy enemy ninjas
  * Short duration

* **Boost**

  * Instantly advances the player upward
  * Helps escape dense sections
  * Does NOT inflate score

* **Time Slow Orb**

  * Temporarily slows game speed
  * Helps regain control during intense phases

Power-ups never stack.

---

## 📏 Scoring System

* **Score = Distance traveled**
* Distance increases with:

  * Time
  * Speed
* No bonus points
* No multipliers
* No pay-to-win mechanics

High scores represent **real player skill**.

---

## 🏆 Leaderboard System

* Global leaderboard visible to all players
* Displays:

  * Rank
  * Username
  * Best distance
* Only the **best run per player** is recorded
* Updates in real time
* Locked after **7 days** for prize evaluation

### Tie-Breaking Rules

1. Higher distance
2. Longer survival time
3. Fewer collisions

---

## 👤 User System & Authentication

### Signup Requirements

* Unique username (immutable)
* Name
* Email (OTP verification)
* Mobile number (optional but recommended)

### Login

* Email OTP (passwordless)

### Restrictions

* One account per user
* One device per account (soft enforcement)

---

## 🧠 Anti-Cheat Measures

* Server-side score validation
* Maximum speed caps
* Impossible movement detection
* Tap-rate limits
* Manual review for top leaderboard ranks

The leaderboard prioritizes **fair competition**.

---

## 🖥 UI & Screens

* **Home Screen**

  * Play
  * Leaderboard
  * Rules
  * Prize Info

* **Before Run**

  * “This run counts toward the leaderboard”
  * Best distance shown

* **Game Over Screen**

  * Distance achieved
  * Rank update animation
  * Motivational feedback
  * Retry & Share options

---

## 🔁 Replay & Retention

After each run, players see:

* Their rank
* Distance gap to next rank
* Motivational messages like:

  * “Top 18% players”
  * “Only 14m to Rank 10”
  * “New personal best!”

The game encourages replay **emotionally**, not aggressively.

---

## 📣 Marketing & Virality

* Auto-generated shareable score cards
* Optimized for WhatsApp & Instagram Stories
* Includes:

  * Username
  * Distance
  * Rank
  * Countdown to leaderboard lock

**Core campaign message:**

> *7 days. Only skill wins. Top 3 get rewarded.*

---

## 🛠 Tech Stack (Recommended)

* **Game Engine:** Antigravity / Unity 2D
* **Backend:** Node.js / FastAPI
* **Database:** Firebase / PostgreSQL
* **Auth:** Email OTP
* **Hosting:** Vercel / Firebase / Render

---

## 🎯 Design Philosophy

* No sudden difficulty spikes
* No unfair deaths
* Skill always beats luck
* Simple mechanics, deep mastery
* Smooth gameplay above all else

---

## 🏁 Final Note

**Ninja Gravity Run** is designed to feel:

* Fair in the first seconds
* Intense in later stages
* Addictive without frustration
* Competitive without cheating

This project is built to **launch fast**, **scale cleanly**, and **reward real skill**.

