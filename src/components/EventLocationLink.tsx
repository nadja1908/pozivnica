import {
  EVENT_LOCATION_DISPLAY,
  EVENT_LOCATION_MAPS_URL,
} from "../constants/event";

type EventLocationLinkProps = {
  className?: string;
};

/** Klikabilno mesto — otvara Google Maps na koordinatama vikendice. */
export function EventLocationLink({ className = "" }: EventLocationLinkProps) {
  return (
    <a
      href={EVENT_LOCATION_MAPS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        "inline underline decoration-[#C99A2E]/55 underline-offset-2 transition",
        "hover:text-[#8A651C] hover:decoration-[#C99A2E]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {EVENT_LOCATION_DISPLAY}
    </a>
  );
}
