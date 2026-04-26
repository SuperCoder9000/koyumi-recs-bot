# 🎌 KoyumiRecs — Anime Recommendation Discord Bot

A feature-rich Discord bot built with **Node.js** and **Discord.js** that helps users discover anime through intelligent search, filtering, and interactive UI components.

---

## 🚀 Features

### 🔍 Anime Search (Interactive)

* Search any anime using `!anime <name>`
* Interactive dropdown selection for:

  * TV series
  * Movies
  * OVA / ONA / Specials
* Displays:

  * Synopsis (trimmed + full details link)
  * Rating, Episodes, Status
  * High-quality cover image

---

### 🎯 Smart Recommendations

* Multi-genre filtering:

  ```
  !recommend action fantasy
  ```
* Supports multiple genres + themes
* Intelligent filtering ensures:

  * Matches ALL selected genres
  * Removes duplicate seasons
  * Shows only unique anime

---

### 🧠 Advanced Filtering Logic

* Deduplicates sequels and alternate versions
* Groups anime by base title
* Prioritizes higher-rated entries
* Fallback system for broader recommendations

---

### 🏷 Theme Support

Supports special tags:

* isekai
* highschool
* ecchi

Example:

```
!recommend isekai action
```

---

### 📅 Seasonal Anime

Browse anime by season:

```
!season winter 2024
```

---

### 📖 Help Command

Built-in command guide:

```
!help
```

---

## 🛠 Tech Stack

* Node.js
* Discord.js
* Axios
* Jikan API (MyAnimeList)

---

## ⚙️ Setup & Installation

### 1. Clone the repository

```
git clone https://github.com/your-username/koyumi-recs-bot.git
cd koyumi-recs-bot
```

### 2. Install dependencies

```
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```
DISCORD_TOKEN=your_discord_bot_token
```

---

### 4. Run the bot

```
node index.js
```

---

## 📌 Available Commands

| Command                   | Description                             |
| ------------------------- | --------------------------------------- |
| `!anime <name>`           | Search anime with interactive selection |
| `!recommend <genres>`     | Get recommendations                     |
| `!season <season> <year>` | Seasonal anime                          |
| `!help`                   | Show command guide                      |

---

## 🧩 Architecture Highlights

* Modular command handling
* Asynchronous API handling with proper error control
* Rate-limit aware API usage (Jikan)
* Interactive Discord UI (Select Menus)
* Data normalization & deduplication logic

---

## ⚠️ Notes

* Uses Jikan API (unofficial MyAnimeList API)
* Rate limits may apply under heavy usage

---

## 📈 Future Improvements

* Slash command support
* Pagination for large results
* User watchlist system
* Deployment with uptime monitoring
* Caching layer for performance

---

## 👨‍💻 Author

Developed by **Your Name**

---

## ⭐ Show your support

If you like this project, consider giving it a ⭐ on GitHub!
