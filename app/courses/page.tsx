import type { Metadata } from "next";
import { courses } from "@/content/courses";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Hands-on build tutorials from Nahiyan Ibn Ershad — real projects, including the dead ends. Starting with a self-hosted social-media automation.",
};

export default function CoursesPage() {
  return (
    <section className="section" id="courses" style={{ paddingTop: 128 }}>
      <div className="container">
        <div className="eyebrow" style={{ marginBottom: 18 }}>
          Courses
        </div>
        <h1 className="sec-title">
          Build it <em>yourself.</em>
        </h1>
        <p className="sec-sub" style={{ marginTop: 18 }}>
          Hands-on tutorials for the automations and systems I use — the real build, including the
          traps that cost an hour each. More on the way.
        </p>

        <div className="course-grid">
          {courses.map((c) => (
            <a key={c.slug} href={`/courses/${c.slug}/`} className="course-card" data-cursor="Open">
              <span className="course-tag">{c.tag}</span>
              <h3 className="course-title">{c.title}</h3>
              <p className="course-blurb">{c.blurb}</p>
              <div className="course-foot">
                <span className="course-meta">{c.meta}</span>
                <span className="course-go" aria-hidden>
                  Start →
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
