const API_URL =
  "https://loy1awpsg1.execute-api.us-east-2.amazonaws.com/v1/resume";


/**
 * Load resume data from the Resume API.
 */
async function loadResume() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Resume API returned ${response.status}`);
    }

    const resume = await response.json();

    console.log("Resume data loaded:", resume);

    renderProfile(resume.profile);
    renderExpertise(resume.expertise);
    renderExperience(resume.experience);
    renderTechnology(resume.technology);
    renderEducation(resume.education);

  } catch (error) {
    console.error("Unable to load resume:", error);
  }
}


/**
 * Render profile / hero information.
 */
function renderProfile(profile) {
  if (!profile) {
    console.warn("Profile data not found.");
    return;
  }

  setText("resume-name", profile.name);
  setText("resume-eyebrow", profile.eyebrow);
  setText("resume-headline", profile.headline);

  const container = document.getElementById("profile-content");

  if (!container) {
    console.warn("profile-content element not found.");
    return;
  }

  container.innerHTML = "";

  (profile.summaries || []).forEach(summary => {
    const paragraph = document.createElement("p");

    paragraph.className = "summary";
    paragraph.textContent = summary;

    container.appendChild(paragraph);
  });
}


/**
 * Render Core Expertise chips.
 */
function renderExpertise(expertise = []) {
  const container = document.getElementById("expertise-content");

  if (!container) {
    console.warn("expertise-content element not found.");
    return;
  }

  container.innerHTML = "";

  expertise.forEach(item => {
    const chip = document.createElement("span");

    chip.className = "chip";
    chip.textContent = item;

    container.appendChild(chip);
  });
}


/**
 * Render Professional Experience.
 */
function renderExperience(experiences = []) {
  const container = document.getElementById("experience-content");

  if (!container) {
    console.warn("experience-content element not found.");
    return;
  }

  container.innerHTML = "";

  const sortedExperiences = [...experiences].sort(
    (a, b) => (a.sortOrder || 999) - (b.sortOrder || 999)
  );

  sortedExperiences.forEach(experience => {

    /*
     * Main role card
     */
    const article = document.createElement("article");
    article.className = "role";


    /*
     * Role header
     */
    const roleHead = document.createElement("div");
    roleHead.className = "role-head";


    /*
     * Left side of header:
     * title + company/location
     */
    const roleInfo = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = experience.title || "";

    const company = document.createElement("div");
    company.className = "company";

    if (experience.company && experience.location) {
      company.textContent =
        `${experience.company} • ${experience.location}`;
    } else {
      company.textContent =
        experience.company || experience.location || "";
    }

    roleInfo.appendChild(title);
    roleInfo.appendChild(company);


    /*
     * Right side of header:
     * employment dates
     */
    const date = document.createElement("div");
    date.className = "date";

    if (experience.current) {
      date.textContent =
        `${experience.startYear}–Present`;
    } else {
      date.textContent =
        `${experience.startYear}–${experience.endYear}`;
    }


    roleHead.appendChild(roleInfo);
    roleHead.appendChild(date);

    article.appendChild(roleHead);


    /*
     * Accomplishment bullets
     */
    if (
      Array.isArray(experience.bullets) &&
      experience.bullets.length > 0
    ) {
      const bulletList = document.createElement("ul");

      experience.bullets.forEach(bullet => {
        const listItem = document.createElement("li");

        listItem.textContent = bullet;

        bulletList.appendChild(listItem);
      });

      article.appendChild(bulletList);
    }


    /*
     * Optional Focus section
     */
    if (
      Array.isArray(experience.focus) &&
      experience.focus.length > 0
    ) {
      const focus = document.createElement("div");
      focus.className = "techline";

      const label = document.createElement("strong");
      label.textContent = "Focus: ";

      const focusText = document.createTextNode(
        experience.focus.join(" • ")
      );

      focus.appendChild(label);
      focus.appendChild(focusText);

      article.appendChild(focus);
    }


    container.appendChild(article);
  });
}


/**
 * Render Technology cards.
 */
function renderTechnology(technology = []) {
  const container = document.getElementById("technology-content");

  if (!container) {
    console.warn("technology-content element not found.");
    return;
  }

  container.innerHTML = "";

  const sortedTechnology = [...technology].sort(
    (a, b) => (a.sortOrder || 999) - (b.sortOrder || 999)
  );

  sortedTechnology.forEach(group => {

    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h3");
    title.textContent = group.title || "";

    const items = document.createElement("p");

    if (Array.isArray(group.items)) {
      items.textContent = group.items.join(", ");
    }

    card.appendChild(title);
    card.appendChild(items);

    container.appendChild(card);
  });
}


/**
 * Render Education.
 */
function renderEducation(education = []) {
  const container = document.getElementById("education-content");

  if (!container) {
    console.warn("education-content element not found.");
    return;
  }

  container.innerHTML = "";

  const sortedEducation = [...education].sort(
    (a, b) => (a.sortOrder || 999) - (b.sortOrder || 999)
  );

  sortedEducation.forEach(item => {

    const card = document.createElement("div");
    card.className = "card";

    const school = document.createElement("h3");
    school.textContent = item.school || "";

    const details = document.createElement("p");

    let detailText = item.degree || "";

    if (item.startYear && item.endYear) {
      detailText +=
        ` • ${item.startYear}–${item.endYear}`;
    }

    details.textContent = detailText;

    card.appendChild(school);
    card.appendChild(details);

    container.appendChild(card);
  });
}


/**
 * Helper for safely updating existing text elements.
 */
function setText(id, value) {
  const element = document.getElementById(id);

  if (element && value !== undefined && value !== null) {
    element.textContent = value;
  }
}


/**
 * Start loading the resume after the page DOM is available.
 */
document.addEventListener("DOMContentLoaded", () => {
  loadResume();
});