const API_URL =
  "https://loy1awpsg1.execute-api.us-east-2.amazonaws.com/v1/resume";

async function loadResume() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Resume API returned ${response.status}`);
    }

    const resume = await response.json();

    renderProfile(resume.profile);
    renderExpertise(resume.expertise);
    renderExperience(resume.experience);
    renderTechnology(resume.technology);
    renderEducation(resume.education);

  } catch (error) {
    console.error("Unable to load resume:", error);
  }
}