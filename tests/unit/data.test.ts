import {
  projects,
  skillCategories,
  experience,
  filterCategories,
  siteConfig,
} from "@/lib/data";

describe("projects data integrity", () => {
  it("every project has non-empty title, category, summary, and metric", () => {
    for (const project of projects) {
      expect(project.title.trim().length).toBeGreaterThan(0);
      expect(project.category.trim().length).toBeGreaterThan(0);
      expect(project.summary.trim().length).toBeGreaterThan(0);
      expect(project.metric.trim().length).toBeGreaterThan(0);
    }
  });

  it("github url, when present, is a non-empty string", () => {
    for (const project of projects) {
      expect(
        typeof project.githubUrl === "undefined" || project.githubUrl.trim().length > 0
      ).toBe(true);
    }
  });

  it("site config exposes a canonical github profile link", () => {
    // Used as the fallback "View code" destination for projects without a per-project githubUrl.
    expect(siteConfig.github.trim().length).toBeGreaterThan(0);
  });
});

describe("skillCategories data integrity", () => {
  it("every skill has a proficiency level between 0 and 100", () => {
    for (const category of skillCategories) {
      expect(category.skills.length).toBeGreaterThan(0);
      for (const skill of category.skills) {
        expect(skill.level).toBeGreaterThanOrEqual(0);
        expect(skill.level).toBeLessThanOrEqual(100);
      }
    }
  });
});

describe("experience data integrity", () => {
  it("has at least one entry", () => {
    expect(experience.length).toBeGreaterThan(0);
  });

  it("every entry has non-empty company, title, period, and at least one detail", () => {
    for (const entry of experience) {
      expect(entry.company.trim().length).toBeGreaterThan(0);
      expect(entry.title.trim().length).toBeGreaterThan(0);
      expect(entry.period.trim().length).toBeGreaterThan(0);
      expect(entry.details.length).toBeGreaterThan(0);
    }
  });
});

describe("filterCategories coverage", () => {
  it("covers every category used by projects, plus 'All'", () => {
    const usedCategories = new Set(projects.map((p) => p.category));
    for (const category of usedCategories) {
      expect(filterCategories).toContain(category);
    }
    expect(filterCategories).toContain("All");
  });
});
