import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.content.length > 100) return;
  //help block
if (message.content.startsWith("!help")) {
  const embed = new EmbedBuilder()
    .setTitle("📖 KoyumiRecs Help Menu")
    .setColor(0x00bfff)
    .setDescription("Here are the available commands:")
    .addFields(
      {
        name: "🔍 !anime <name>",
        value: "Search for an anime and select a version (TV, Movie, OVA, etc).",
      },
      {
        name: "🎯 !recommend <genres>",
        value: "Get anime recommendations based on genres.\nExample: `!recommend action fantasy`",
      },
      {
        name: "❤️ !like <anime>",
        value: "Get recommendations similar to a specific anime.\nExample: `!like naruto`",
      },
      {
        name: "📅 !season <season> <year>",
        value: "Browse anime from a specific season.\nExample: `!season winter 2024`",
      },
      {
        name: "📖 !help",
        value: "Show this help menu.",
      }
    )
    .setFooter({ text: "KoyumiRecs • Anime Recommendation Bot" });

  message.reply({ embeds: [embed] });
  return;
}
  //anime block 
  if (message.content.startsWith("!anime")) {
    const query = message.content.replace("!anime ", "").trim();

    if (!query) {
      return message.reply("Please provide an anime name.");
    }
    
    let loading;
    try {
       loading = await message.reply("Fetching anime data...");

       const res = await axios.get(
           `https://api.jikan.moe/v4/anime?q=${query}&limit=10`
  );
  const results = res.data?.data || [];
  //GROUP BY TYPE
  const tv = [];
  const movies = [];
  const others = [];

results.forEach((anime) => {
  const type = anime.type || "Unknown";

  if (type === "TV") {
    tv.push(anime);
  } else if (type === "Movie") {
    movies.push(anime);
  } else if (["OVA", "ONA", "Special"].includes(type)) {
    others.push(anime);
  }
});
     if (!results.length) {
  await loading.edit("Anime not found.");
  return;
}
//BUILD GROUPED OPTIONS
const options = [];

//TV (priority)
tv.slice(0, 10).forEach((anime) => {
  options.push({
    label: `📺 ${anime.title}`.substring(0, 100),
    description: "TV Series",
    value: String(anime.mal_id),
  });
});

//Movies
movies.slice(0, 5).forEach((anime) => {
  options.push({
    label: `🎬 ${anime.title}`.substring(0, 100),
    description: "Movie",
    value: String(anime.mal_id),
  });
});

//Others (OVA/ONA/Special)
others.slice(0, 5).forEach((anime) => {
  options.push({
    label: `📀 ${anime.title}`.substring(0, 100),
    description: "OVA / ONA / Special",
    value: String(anime.mal_id),
  });
});

if (!options.length) {
  await loading.edit("No valid anime options found.");
  return;
}

const selectMenu = new StringSelectMenuBuilder()
  .setCustomId(`anime_select_${message.id}`)
  .setPlaceholder("Choose an anime")
  .addOptions(options);

const row = new ActionRowBuilder().addComponents(selectMenu);
await loading.edit({
  content: `Results for "${query}" — choose a version:`,
  components: [row],
});
  return;
} catch (error) {
  console.error(error.response?.data || error.message);
  if (error.response?.status === 429) {
    if (loading) {
      await loading.edit("API is busy. Try again in a few seconds.");
    } else {
      message.reply("API is busy. Try again in a few seconds.");
    }
    return;
  }
  if (loading) {
    await loading.edit("Error fetching anime data.");
  } else {
    message.reply("Error fetching anime data.");
  }
}
}
  // recommend block
  if (message.content.startsWith("!recommend")) {
  const input = message.content.replace("!recommend ", "").trim().toLowerCase();

// split multiple genres
let genres = input.split(" ").filter(g => g !== "");

  const genreMap = {
  action: 1,
  adventure: 2, 
  comedy: 4,
  drama: 8,
  ecchi: 9,
  fantasy: 10,
  horror: 14,
  mystery: 7,
  romance: 22,
  "sci-fi": 24,
  slice: 36,          // slice of life
  sports: 30,
  supernatural: 37,
  thriller: 41,
};
const themeMap = {
  isekai: 62,
  highschool: 23,
};

let genreIds = [];
let themeIds = [];


genres.forEach((g) => {
  if (g === "of") return;

  if (g === "slice") {
    genreIds.push(36);
    return;
  }

  if (genreMap[g]) {
    genreIds.push(genreMap[g]);
  }

  if (themeMap[g]) {
    themeIds.push(themeMap[g]);
  }
});
genreIds = [...new Set(genreIds)];
themeIds = [...new Set(themeIds)];
  if (!genreIds.length && !themeIds.length) {
    return message.reply(
      "Invalid genre. Try: action, adventure, comedy, drama, fantasy, horror, romance, sci-fi or themes like highschool or isekai."
    );
  }
  let loading;
  try {
    loading = await message.reply("Fetching recommendations...");
    let url = `https://api.jikan.moe/v4/anime?order_by=popularity&sort=asc&limit=25`;

if (genreIds.length) {
  url += `&genres=${genreIds.join(",")}`;
}

if (themeIds.length) {
  url += `&themes=${themeIds.join(",")}`;
}
    const res = await axios.get(url);

    const results = res.data.data;
    const filtered = results.filter((anime) => {
  const animeGenreIds = (anime.genres || []).map((g) => g.mal_id);
  const animeThemeIds = (anime.themes || []).map((t) => t.mal_id);

  const genreMatch = genreIds.length === 0 || genreIds.every((id) => animeGenreIds.includes(id));
  const themeMatch = themeIds.length === 0 || themeIds.every((id) => animeThemeIds.includes(id));

  return genreMatch && themeMatch;
});
const unique = [];
const seen = new Set();

filtered.forEach((anime) => {
  const baseTitle = (anime.title_english || anime.title || "")
  .toLowerCase()
  .replace(/[:\-–].*/g, "")              // remove subtitles
  .replace(/\b(season|movie|part)\b.*$/g, "") // remove words like season/movie/part
  .replace(/\b(ii|iii|iv|v)\b/g, "")     // remove roman numerals
  .replace(/\d+/g, "")                   // remove numbers
  .replace(/[^a-z\s]/g, "")              // remove special characters (°, ., etc.)
  .replace(/\s+/g, " ")                  // normalize spaces
  .trim();

  if (!seen.has(baseTitle)) {
  seen.add(baseTitle);
  unique.push(anime);
} else {
  // replace with higher rated version
  const index = unique.findIndex(a =>
    (a.title_english || a.title || "").toLowerCase().includes(baseTitle)
  );

  if (index !== -1 && anime.score > (unique[index].score || 0)) {
    unique[index] = anime;
  }
}
});
    if (!unique.length) {
  // fallback: relax filtering
  const fallback = results.filter((anime) => {
  const animeGenreIds = (anime.genres || []).map((g) => g.mal_id);
  const animeThemeIds = (anime.themes || []).map((t) => t.mal_id);

  const genreFallback =
    genreIds.length === 0 ||
    genreIds.some((id) => animeGenreIds.includes(id));

  const themeFallback =
    themeIds.length === 0 ||
    themeIds.some((id) => animeThemeIds.includes(id));

  return genreFallback && themeFallback;
});

  if (!fallback.length) {
    await loading.edit("No recommendations found.");
return;
  }
  await loading.edit("No exact matches found. Showing closest results...");
  fallback.forEach((anime) => {
  const baseTitle = (anime.title_english || anime.title || "")
    .toLowerCase()
    .replace(/[:\-–].*/g, "")
    .replace(/\b(season|movie|part)\b.*$/g, "")
    .replace(/\b(ii|iii|iv|v)\b/g, "")
    .replace(/\d+/g, "")
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!seen.has(baseTitle)) {
    seen.add(baseTitle);
    unique.push(anime);
  }
});
}

    const embed = new EmbedBuilder()
      .setTitle(`Top ${genres.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(" ")} Anime`)
      .setColor(0xff4500)
      .setFooter({ text: "KoyumiRecs • Recommendations" });

    unique.slice(0, 8).forEach((anime, index) => {
      embed.addFields({
        name: `${index + 1}. ${anime.title}`,
        value: `⭐ Rating: ${anime.score || "N/A"} | 📺 Episodes: ${anime.episodes || "N/A"}`,
        inline: false,
      });
    });

    // Add image (from first anime)
    if (unique.length > 0) {
  embed.setImage(unique[0].images?.jpg?.large_image_url);
}

    await loading.edit({ content: "", embeds: [embed] });
    return;

  } catch (error) {
  console.error(error.response?.data || error.message);

  if (loading) {
    await loading.edit("Error fetching recommendations.");
  } else {
    message.reply("Error fetching recommendations.");
  }

  return;
}
}
//like block
if (message.content.startsWith("!like")) {
  const query = message.content.replace("!like ", "").trim();

  if (!query) {
    return message.reply("Please provide an anime name.");
  }

  try {
    // Step 1: Find anime ID
    const loading = await message.reply("Finding similar anime...");
    const searchRes = await axios.get(
      `https://api.jikan.moe/v4/anime?q=${query}&limit=1`
    );

    const anime = searchRes.data.data[0];

    if (!anime) {
      return message.reply("Anime not found.");
    }

    // Step 2: Get recommendations using ID
    const recRes = await axios.get(
      `https://api.jikan.moe/v4/anime/${anime.mal_id}/recommendations`
    );

    const recommendations = recRes.data.data.slice(0, 5);

    if (!recommendations.length) {
      return message.reply("No recommendations found.");
    }

    // Step 3: Create embed
    const embed = new EmbedBuilder()
  .setTitle(`If you liked ${anime.title}, try:`)
  .setColor(0x8a2be2)
  .setFooter({ text: "KoyumiRecs • Similar Anime" });

recommendations.forEach((rec, index) => {
  embed.addFields({
    name: `${index + 1}. ${rec.entry.title}`,
    value: `[View Anime](${rec.entry.url})`,
    inline: false,
  });
});

// Show first anime image
embed.setThumbnail(recommendations[0].entry.images?.jpg?.image_url);

await message.reply({ embeds: [embed] });
loading.delete();

  } catch (error) {
    console.error(error);
    message.reply("Error fetching recommendations.");
  }
}
//season block
else if (message.content.startsWith("!season")) {
  const args = message.content.split(" ");
  const season = args[1]?.toLowerCase();
  const year = args[2];

  const validSeasons = ["winter", "spring", "summer", "fall"];

  if (!validSeasons.includes(season) || !year) {
    return message.reply("Usage: !season <winter|spring|summer|fall> <year>");
  }

  let loading;

  try {
    loading = await message.reply("Fetching seasonal anime...");

    const res = await axios.get(
      `https://api.jikan.moe/v4/seasons/${year}/${season}`
    );

    const results = res.data.data;

    if (!results.length) {
      await loading.edit("No anime found for that season.");
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`Top ${season.charAt(0).toUpperCase() + season.slice(1)} ${year} Anime`)
      .setColor(0x00ff99)
      .setFooter({ text: "KoyumiRecs • Seasonal Anime" });

    results.slice(0, 8).forEach((anime, index) => {
      embed.addFields({
        name: `${index + 1}. ${anime.title}`,
        value: `⭐ Rating: ${anime.score || "N/A"} | 📺 Episodes: ${anime.episodes || "N/A"}`,
        inline: false,
      });
    });

    // image
    if (results[0]?.images?.jpg?.large_image_url) {
      embed.setImage(results[0].images.jpg.large_image_url);
    }

    await loading.edit({ content: "", embeds: [embed] });

  } catch (error) {
    console.error(error.response?.data || error.message);

    if (loading) {
      await loading.edit("Error fetching seasonal anime.");
    } else {
      message.reply("Error fetching seasonal anime.");
    }
  }
}
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId.startsWith("anime_select")) {

    const animeId = interaction.values[0];

    try {
      const res = await axios.get(
        `https://api.jikan.moe/v4/anime/${animeId}`
      );

      const anime = res.data.data;

      let summary = anime.synopsis || "No summary available.";


if (summary.length > 1200) {
  summary = summary.slice(0, 1200);

  const lastPeriod = summary.lastIndexOf(".");
  if (lastPeriod !== -1) {
    summary = summary.slice(0, lastPeriod + 1);
  }

  summary += "...";
}

//ADD READ MORE LINK
summary += `\n\n🔗 [View full details](${anime.url})`;

      const embed = new EmbedBuilder()
        .setTitle(anime.title)
        .setURL(anime.url)
        .setDescription(summary)
        .setColor(0x00bfff)
        .addFields(
          { name: "Episodes", value: String(anime.episodes || "N/A"), inline: true },
          { name: "Rating", value: String(anime.score || "N/A"), inline: true },
          { name: "Status", value: anime.status, inline: true }
        )
        .setImage(anime.images?.jpg?.large_image_url)
        .setFooter({ text: "KoyumiRecs • Anime Details" });

      // ✅ CORRECT RESPONSE METHOD
      await interaction.update({
        content: "",
        embeds: [embed],
        components: [],
      });

    } catch (error) {
      console.error(error);

      await interaction.reply({
        content: "Error fetching anime.",
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);