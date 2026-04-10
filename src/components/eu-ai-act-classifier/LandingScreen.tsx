import { LANDING_COPY } from "../../data/eu-ai-act-classifier/copy";

interface Props {
  onStart: () => void;
}

export function LandingScreen({ onStart }: Props) {
  return (
    <div className="cl-landing">
      <div className="cl-landing-meta">{LANDING_COPY.regulationRef}</div>
      <h1 className="cl-landing-headline">{LANDING_COPY.headline}</h1>
      <p className="cl-landing-subhead">{LANDING_COPY.subhead}</p>
      <p className="cl-landing-meta">{LANDING_COPY.estimatedTime}</p>
      <p className="cl-landing-trust">{LANDING_COPY.trust}</p>
      <button className="cl-btn-primary" onClick={onStart} type="button">
        {LANDING_COPY.cta}
      </button>
    </div>
  );
}
