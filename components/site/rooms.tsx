import { Photo } from "@/components/site/photo";
import { type Entry } from "@/lib/content";
import { ArrowUpRight } from "lucide-react";
export function RoomCards({
  rooms,
  preview = false,
}: {
  rooms: Entry[];
  preview?: boolean;
}) {
  if (!rooms.length)
    return (
      <div className="room-editorial">
        <Photo
          src="/images/countryside-stay.webp"
          width={1200}
          height={1600}
          alt="Sunlit farmhouse bedroom with twin beds, green throws and an arched garden-facing window"
          loading="lazy"
        />
        <div>
          <span className="eyebrow">A room for your kind of stay</span>
          <h3>Rest comes naturally here.</h3>
          <p>
            Travelling together, stopping overnight or taking a little time for
            yourself? Speak to Heidi about the accommodation that suits your
            stay.
          </p>
          <p>
            Current room options and rates are available through our booking
            partners or directly from the property.
          </p>
          <a className="button" href={preview ? "/accommodation" : "/contact?subject=Accommodation%20enquiry"}>
            {preview ? "Explore our accommodation" : "Enquire about a room"} <ArrowUpRight size={17} />
          </a>
        </div>
      </div>
    );
  return (
    <div className="room-grid">
      {rooms.slice(0, preview ? 3 : undefined).map((r) => (
        <article className="room-card" key={r.id}>
          {r.image ? (
            <Photo src={String(r.image)} alt={String(r.name)} loading="lazy" />
          ) : (
            <div className="image-placeholder">
              Room photograph awaiting upload
            </div>
          )}
          <div>
            <span className="eyebrow">
              {r.capacity
                ? `Up to ${r.capacity} guests`
                : "Ask about your stay"}
            </span>
            <h3>{r.name}</h3>
            <p>{r.description}</p>
            {r.price != null && (
              <p>From R {Number(r.price).toLocaleString("en-ZA")} / night</p>
            )}
            <div className="room-actions">
              <a className="text-link" href={"/accommodation/" + r.id}>
                View room <ArrowUpRight size={16} />
              </a>
              <a className="button" href={"/book?room=" + r.id}>
                Book now
              </a>
            </div>
            <a className="small-link" href={"/book?room=" + r.id}>
              Check availability
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
