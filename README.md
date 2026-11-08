# 🛰️ SKYLINK CanSat 2026 — Team Outreach & Mini-Game Arcade

The official outreach website for **SKYLINK CanSat Team** from **University of Technology Bahrain (UTB Bahrain 2026)**.

Designed with a glowing frosted tablet interface, playful bubbly typography (**Fredoka** + **Quicksand**), muted rose/crimson/slate team hues, 5 interactive mini-games, an interactive 3D-styled soda-can explorer, live leaderboards, and an organizer prize management portal.

---

## 🎮 The 5 Mini-Games

1. 🪂 **Flappy CanSat** — Flappy-bird style navigation! Tap/space to flap mini-thrusters through ground antenna towers.
2. 🌪️ **Can-Drop** — Parachute deployment and wind-drift descent glide from 1000m to 0m.
3. 📡 **Telemetry Jam** — 4-lane rhythm reaction tuner matching ground station LoRa frequencies.
4. 🎯 **Target Touchdown** — 2D physics lunar/planetary target lander with attitude thrust control.
5. ⚡ **Data Catcher** — Orbit telemetry packet collector sliding the dish while dodging solar storms.

---

## 👥 The SKYLINK Team

- **Supervisor:** Dr. Sateesh Kumar Nataraj
- **Electrical Lead:** Mohammad Shoaib
- **Mechanical Lead:** Mohsin Akil
- **Software & Data Lead:** Mohammad Ali
- **Project Manager:** Osama Zahid
- **Science & Outreach:** Zaid Ahmad Khan

---

## 🏆 Leaderboard & Prizes

- **Fresh Start:** The leaderboard starts empty (`[]`) and reactively logs real player scores when they complete games and enter their callsign, name, and contact info.
- **Prizes:**
  - 🥇 **Overall Grand Prix Top 3**
  - 🏆 **1st Place Champion for each of the 5 Games**
  - All prizes are currently tagged as *Mystery Prize ✨ (To Be Announced)*.
- **Organizer Desk:** Click the key icon on the leaderboard (password: `cansat2026` or `admin`) to view private player contacts, export winners to CSV, or clear logs for new events.

---

## 🚀 How to Host on GitHub Pages

The repository is already pre-configured with:
- `vite.config.ts` (`base: './'`) for relative asset paths on any repository subfolder.
- `.github/workflows/deploy.yml` for automated GitHub Pages CI/CD.

### Quick GitHub Setup:
1. Initialize git and commit your files:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of SKYLINK CanSat site"
   ```
2. Create a repository on GitHub (e.g. `skylink-cansat`).
3. Link your remote and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOUR-USERNAME>/<REPO-NAME>.git
   git push -u origin main
   ```
4. In your GitHub repository:
   - Go to **Settings** → **Pages**.
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.
   - Your site will automatically build and publish at `https://<YOUR-USERNAME>.github.io/<REPO-NAME>/`!
