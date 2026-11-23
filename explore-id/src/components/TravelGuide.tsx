
import type { DestinationGuide } from "../data/destinationGuides";

type TravelGuideProps = {
  destinationName: string;
  guide: DestinationGuide;
};

export default function TravelGuide({
  destinationName,
  guide,
}: TravelGuideProps) {
  return (
    <section className="visit-guide-section">
      <div className="visit-guide-content">
        <div>
          <span className="eyebrow">TRAVEL GUIDE</span>
          <h2>Plan your visit</h2>
          <p>
            Panduan singkat untuk membantu kamu mengenal{" "}
            {destinationName} sebelum berkunjung.
          </p>
        </div>

        <div className="visit-guide-list">
          <div className="visit-guide-item">
            <span>01</span>
            <div>
              <strong>Destination Highlights</strong>
              <p>
                Hal menarik yang menjadi daya tarik utama destinasi ini.
              </p>
              <ul>
                {guide.highlights.map((text, index) => (
                  <li key={index}>{text}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="visit-guide-item">
            <span>02</span>
            <div>
              <strong>Things to Do</strong>
              <p>
                Aktivitas yang dapat kamu pertimbangkan saat berkunjung.
              </p>
              <ul>
                {guide.activities.map((text, index) => (
                  <li key={index}>{text}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="visit-guide-item">
            <span>03</span>
            <div>
              <strong>How to Get There</strong>
              <p>{guide.access}</p>
            </div>
          </div>

          <div className="visit-guide-item">
            <span>04</span>
            <div>
              <strong>Available Facilities</strong>
              <p>{guide.facilities}</p>
            </div>
          </div>

          <div className="visit-guide-item">
            <span>05</span>
            <div>
              <strong>Travel Tips</strong>
              <p>
                Beberapa hal yang perlu diperhatikan sebelum dan selama perjalanan.
              </p>
              <ul>
                {guide.tips.map((text, index) => (
                  <li key={index}>{text}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
