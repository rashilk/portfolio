import React, { useEffect } from 'react';
import { Project } from '../data/portfolioData';
import { ParticleDisintegrate } from './ParticleDisintegrate';
import { SplitText } from './SplitText';
import { Footer } from './Footer';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onHomeClick: (e: React.MouseEvent) => void;
  onNavigate: (path: string) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onBack,
  onHomeClick,
  onNavigate
}) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [project.slug]);

  return (
    <div className="project-detail">
      <section className="project-detail__intro">
        <button type="button" className="project-detail__backShell" onClick={onBack}>
          <ParticleDisintegrate>
            <span className="project-detail__linkText t-20">
              <svg
                className="project-detail__icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 12H4M4 12L10 18M4 12L10 6" />
              </svg>
              Back to work
            </span>
          </ParticleDisintegrate>
        </button>

        <div className="project-detail__titleRow">
          <SplitText type="blur-anim" delay={0.3} className="label t-85 project-detail__title">
            {project.title}
          </SplitText>
          {(project.year || project.info) && (
            <SplitText type="blur-anim" delay={0.4} className="label t-20 muted project-detail__meta">
              {project.year || project.info}
            </SplitText>
          )}
        </div>
      </section>

      <div className="project-detail__heroWrap">
        {project.video ? (
          <video
            className="project-detail__hero"
            data-entered="true"
            src={project.video}
            aria-label={project.title}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : project.image ? (
          <img
            src={project.image}
            alt={project.title}
            className="project-detail__hero project-detail__heroImage"
            data-entered="true"
          />
        ) : (
          <div className="project-detail__hero playground__poster" data-entered="true" aria-hidden="true">
            <span className="playground__posterTitle t-60">{project.title}</span>
          </div>
        )}
      </div>

      <section className="project-detail__body">
        <div className="project-detail__credit">
          <SplitText type="split" className="label t-60 project-detail__tagline">
            {project.tagline}
            {project.partner && project.partnerUrl && (
              <>
                {' '}
                <a
                  href={project.partnerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="no-anim project-detail__taglinePartnerLink"
                >
                  <ParticleDisintegrate>
                    <span className="project-detail__linkText t-20">— with {project.partner}</span>
                  </ParticleDisintegrate>
                </a>
              </>
            )}
          </SplitText>
        </div>

        {project.description.map((desc, idx) => (
          <SplitText key={idx} type="split" className="label t-30 project-detail__paragraph">
            {desc}
          </SplitText>
        ))}

        {project.collaboration && (
          <div className="project-detail__section project-detail__collaboration">
            <SplitText type="blur-anim" className="label t-16 muted project-detail__sectionLabel">
              Collaboration
            </SplitText>
            <SplitText type="split" className="label t-30 project-detail__paragraph">
              {project.collaboration}
            </SplitText>
          </div>
        )}

        {(project.stack.length > 0 || project.stackNote) && (
          <div className="project-detail__section project-detail__stack">
            <SplitText type="blur-anim" className="label t-16 muted project-detail__sectionLabel">
              Tech Stack
            </SplitText>
            <ul className="project-detail__stackList">
              {project.stack.map((item, idx) => (
                <li key={idx} className="project-detail__stackItem t-16">
                  {item}
                </li>
              ))}
            </ul>
            {project.stackNote && (
              <SplitText type="split" className="label t-30 project-detail__paragraph">
                {project.stackNote}
              </SplitText>
            )}
          </div>
        )}

        {project.href && (
          <div className="project-detail__section">
            <a
              href={project.href}
              target="_blank"
              rel="noreferrer"
              className="project-detail__visitShell"
            >
              <ParticleDisintegrate>
                <span className="project-detail__linkText t-20">
                  View Project
                  <svg
                    className="project-detail__icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </span>
              </ParticleDisintegrate>
            </a>
          </div>
        )}
      </section>

      <Footer onHomeClick={onHomeClick} onNavigate={onNavigate} />
    </div>
  );
};

