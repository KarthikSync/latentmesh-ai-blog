// Block 1 — Coverage banner. Split coverage statements per track.
// Shows which articles are covered and a common disclaimer footer.

interface Props {
  showSystemTrack: boolean;
  showModelTrack: boolean;
  systemArticleCount: number;
  systemArticles: string;
}

export function CoverageBanner({
  showSystemTrack,
  showModelTrack,
  systemArticleCount,
  systemArticles,
}: Props) {
  return (
    <div className="cl-coverage-banner" role="region" aria-label="Obligation coverage">
      {showSystemTrack && (
        <p className="cl-coverage-line">
          Showing applicable system obligations from {systemArticleCount} EU AI Act articles ({systemArticles}).
          Organisational obligations (such as AI literacy under Art. 4) are not included.
        </p>
      )}
      {showModelTrack && (
        <p className="cl-coverage-line">
          Showing GPAI model obligations from covered articles (Art. 53).
        </p>
      )}
      <p className="cl-coverage-footer">This is not a complete legal inventory.</p>
    </div>
  );
}
