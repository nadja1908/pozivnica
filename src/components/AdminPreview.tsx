import type { RsvpResponse } from "../types/rsvp";
import {
  attendanceLabel,
  formatDrinkPreferences,
  pickupLabel,
  transportDirectionLabel,
} from "../lib/labels";
import { SectionCard } from "./SectionCard";

interface AdminPreviewProps {
  responses: RsvpResponse[];
  loading: boolean;
  error: string | null;
}

export function AdminPreview({
  responses,
  loading,
  error,
}: AdminPreviewProps) {
  return (
    <SectionCard id="responses">
      <h2 className="font-display text-2xl font-semibold text-velvet-900 sm:text-3xl md:text-4xl">
        Pregled odgovora
      </h2>
      <p className="mt-2 text-sm text-champagne-600">
        Podaci iz Supabase tabele. Za produkciju dodaj zaštitu ili login.
      </p>

      {loading && (
        <div className="mt-8 flex items-center gap-3 text-champagne-700">
          <span
            className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blush-300 border-t-blush-600"
            aria-hidden
          />
          Učitavam…
        </div>
      )}

      {error && !loading && (
        <div
          className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      {!loading && !error && responses.length === 0 && (
        <p className="mt-8 text-champagne-600">
          Još nema odgovora — čim neko pošalje potvrdu, pojavljuje se ovde.
        </p>
      )}

      {!loading && !error && responses.length > 0 && (
        <div className="mt-8 hidden overflow-x-auto rounded-2xl border border-champagne-200 bg-white/60 md:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-champagne-200 bg-champagne-50/80">
                <th className="px-4 py-3 font-semibold text-champagne-900">
                  ID spiska
                </th>
                <th className="px-4 py-3 font-semibold text-champagne-900">
                  Gost
                </th>
                <th className="px-4 py-3 font-semibold text-champagne-900">
                  Telefon
                </th>
                <th className="px-4 py-3 font-semibold text-champagne-900">
                  Dolazak
                </th>
                <th className="px-4 py-3 font-semibold text-champagne-900">
                  Prevoz / zone
                </th>
                <th className="px-4 py-3 font-semibold text-champagne-900">
                  Piće
                </th>
                <th className="px-4 py-3 font-semibold text-champagne-900">
                  Pesma
                </th>
              </tr>
            </thead>
            <tbody>
              {responses.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-champagne-100 transition hover:bg-blush-50/50"
                >
                  <td className="px-4 py-3 font-mono text-xs text-champagne-700">
                    {r.guestId ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-medium text-champagne-900">
                    {r.fullName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-champagne-800">
                    {r.phoneE164 ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-champagne-800">
                    {attendanceLabel(r.attendanceStatus)}
                  </td>
                  <td className="max-w-[220px] px-4 py-3 text-sm text-champagne-800">
                    <div>{transportDirectionLabel(r.transportDirection)}</div>
                    {(r.pickupLocation || r.pickupLocationReturn) && (
                      <div className="mt-1 text-xs leading-snug text-champagne-700">
                        {r.pickupLocation && (
                          <span>
                            Pol.:{" "}
                            {pickupLabel(r.pickupLocation)}
                            {r.pickupLocation === "other" && r.customPickupLocation
                              ? ` (${r.customPickupLocation})`
                              : ""}
                          </span>
                        )}
                        {r.pickupLocation && r.pickupLocationReturn ? (
                          <br />
                        ) : null}
                        {r.pickupLocationReturn && (
                          <span>
                            Pov.:{" "}
                            {pickupLabel(r.pickupLocationReturn)}
                            {r.pickupLocationReturn === "other" &&
                            r.customPickupLocationReturn
                              ? ` (${r.customPickupLocationReturn})`
                              : ""}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="max-w-[240px] px-4 py-3 text-champagne-800">
                    {formatDrinkPreferences(r.drinkPreferences)}
                  </td>
                  <td className="px-4 py-3 text-champagne-700">
                    {r.songRequest || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 grid gap-4 md:hidden">
        {!loading &&
          !error &&
          responses.length > 0 &&
          responses.map((r) => (
            <article
              key={`card-${r.id}`}
              className="rounded-2xl border border-champagne-200 bg-white/70 p-4 shadow-sm"
            >
              <p className="font-display text-xl text-velvet-900">{r.fullName}</p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-champagne-600">ID spiska</dt>
                  <dd className="font-mono text-champagne-900">
                    {r.guestId ?? "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-champagne-600">Telefon</dt>
                  <dd className="font-mono text-sm text-champagne-900">
                    {r.phoneE164 ?? "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-champagne-600">Dolazak</dt>
                  <dd className="text-right text-champagne-900">
                    {attendanceLabel(r.attendanceStatus)}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="shrink-0 text-champagne-600">Prevoz</dt>
                  <dd className="max-w-[70%] text-right text-champagne-900">
                    <div>{transportDirectionLabel(r.transportDirection)}</div>
                    {(r.pickupLocation || r.pickupLocationReturn) && (
                      <div className="mt-1 text-xs leading-snug text-champagne-700">
                        {r.pickupLocation && (
                          <span>
                            Pol.: {pickupLabel(r.pickupLocation)}
                            {r.pickupLocation === "other" && r.customPickupLocation
                              ? ` (${r.customPickupLocation})`
                              : ""}
                          </span>
                        )}
                        {r.pickupLocation && r.pickupLocationReturn ? (
                          <br />
                        ) : null}
                        {r.pickupLocationReturn && (
                          <span>
                            Pov.: {pickupLabel(r.pickupLocationReturn)}
                            {r.pickupLocationReturn === "other" &&
                            r.customPickupLocationReturn
                              ? ` (${r.customPickupLocationReturn})`
                              : ""}
                          </span>
                        )}
                      </div>
                    )}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-champagne-600">Piće</dt>
                  <dd className="max-w-[70%] text-right text-champagne-900">
                    {formatDrinkPreferences(r.drinkPreferences)}
                  </dd>
                </div>
                <div>
                  <dt className="text-champagne-600">Pesma</dt>
                  <dd className="text-champagne-900">{r.songRequest || "—"}</dd>
                </div>
              </dl>
            </article>
          ))}
      </div>
    </SectionCard>
  );
}
