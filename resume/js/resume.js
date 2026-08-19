const API_URL =
  "https://loy1awpsg1.execute-api.us-east-2.amazonaws.com/v1/resume";

async function loadResume() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Resume API returned ${response.status}`);
    }

    const blocks = await response.json();

    renderProfile(blocks);
    renderExperience(blocks);

  } catch (error) {
    console.error("Unable to load resume:", error);
  }
}

function renderProfile(blocks) {
  const profile = blocks.find(block => block.type === "profile");

  if (!profile) {
    return;
  }

  const name = document.getElementById("resume-name");
  const headline = document.getElementById("resume-headline");
  const summary = document.getElementById("resume-summary");

  if (name) name.textContent = profile.name;
  if (headline) headline.textContent = profile.headline;
  if (summary) summary.textContent = profile.summary;
}

function renderExperience(blocks) {
  const container = document.getElementById("experience-content");

  if (!container) {
    return;
  }

  const experiences = blocks
    .filter(block => block.type === "experience")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  container.innerHTML = "";

  experiences.forEach(experience => {
    const article = document.createElement("article");

    const title = document.createElement("h3");
    title.textContent = experience.title;

    const company = document.createElement("p");
    company.textContent = experience.company;

    const dates = document.createElement("p");
    dates.textContent = experience.current
      ? `${experience.startDate} – Present`
      : `${experience.startDate} – ${experience.endDate}`;

    const bullets = document.createElement("ul");

    experience.bullets.forEach(bullet => {
      const item = document.createElement("li");
      item.textContent = bullet;
      bullets.appendChild(item);
    });

    article.append(title, company, dates, bullets);
    container.appendChild(article);
  });
}

loadResume();