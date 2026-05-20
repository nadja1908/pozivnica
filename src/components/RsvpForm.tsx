import { useCallback, useEffect, useMemo, useState } from "react";
import { publicSelfieUrl, validateSelfieFile } from "../services/selfieUpload";
import type { Guest } from "../data/guests";
import { getGuestNameFrom, sortGuestsByName } from "../data/guests";
import type { FieldErrors, FormState } from "../types/rsvpForm";
import { emptyFormState } from "../types/rsvpForm";
import { GuestSearchPick } from "./GuestSearchPick";
import {
  ATTENDANCE_OPTIONS,
  DRINK_OPTIONS,
  PICKUP_LOCATIONS,
} from "../constants/options";
import {
  attendanceLabel,
  formatDrinkPreferences,
  pickupLabel,
  transportDirectionLabel,
} from "../lib/labels";
import { isValidPhoneLocal, sanitizePhoneLocal } from "../lib/phone";
import type {
  AttendanceStatus,
  DrinkPreference,
  PickupLocation,
  TransportDirection,
} from "../types/rsvp";

export type { FormState } from "../types/rsvpForm";

type StepId =
  | "name"
  | "phone"
  | "attendance"
  | "decline"
  | "transport"
  | "pickupZone"
  | "selfie"
  | "drink"
  | "extra"
  | "review";

const TRANSPORT_OPTIONS: {
  value: TransportDirection;
  label: string;
}[] = [
  { value: "to_cottage", label: "Samo do vikendice (polazak iz NS)" },
  { value: "return_only", label: "Samo povratak (do Novog Sada)" },
  { value: "both", label: "Oba smera (polazak i povratak)" },
  { value: "none", label: "Ne treba mi organizovan prevoz" },
];

function toggleDrinkPreference(
  prefs: DrinkPreference[],
  v: DrinkPreference,
): DrinkPreference[] {
  const i = prefs.indexOf(v);
  if (i >= 0) return prefs.filter((_, j) => j !== i);
  if (prefs.length >= 2) return prefs;
  return [...prefs, v];
}

function wantsPickupZones(form: FormState): boolean {
  const d = form.transportDirection;
  return (
    form.attendanceStatus !== "no" &&
    (d === "to_cottage" || d === "return_only" || d === "both")
  );
}

function needsOutboundZone(d: FormState["transportDirection"]): boolean {
  return d === "to_cottage" || d === "both";
}

function needsReturnZone(d: FormState["transportDirection"]): boolean {
  return d === "return_only" || d === "both";
}

function stepOrder(form: FormState): StepId[] {
  const o: StepId[] = ["name", "attendance"];
  if (form.attendanceStatus === "no") {
    o.push("decline");
    return o;
  }
  if (form.attendanceStatus === "yes" || form.attendanceStatus === "") {
    o.push("phone");
    o.push("transport");
    if (wantsPickupZones(form)) {
      o.push("pickupZone");
    }
    o.push("selfie");
  }
  o.push("drink", "extra", "review");
  return o;
}

function validateStep(step: StepId, form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  const d = form.transportDirection;

  switch (step) {
    case "name":
      if (!form.guestId) {
        errors.guestId = "Izaberi ime sa liste gostiju.";
      }
      break;
    case "phone": {
      const p = form.phoneLocal.trim();
      if (!p) {
        errors.phoneLocal = "Upiši broj telefona.";
      } else if (!isValidPhoneLocal(p)) {
        errors.phoneLocal =
          "Broj treba da počinje sa 6, bez vodeće nule (npr. 64…, ne 064…). 8–9 cifara posle 6.";
      }
      break;
    }
    case "attendance":
      if (!form.attendanceStatus) {
        errors.attendanceStatus = "Reci nam da li dolaziš.";
      }
      break;
    case "transport":
      if (!form.transportDirection) {
        errors.transportDirection =
          "Izaberi smer prevoza ili da ti ne treba prevoz.";
      }
      break;
    case "pickupZone":
      if (wantsPickupZones(form)) {
        if (needsOutboundZone(d)) {
          if (!form.pickupLocation) {
            errors.pickupLocation = "Izaberi zonu / stanicu za polazak.";
          }
          if (
            form.pickupLocation === "other" &&
            !form.customPickupLocation.trim()
          ) {
            errors.customPickupLocation =
              "Opiši tačno mesto polaska.";
          }
        }
        if (needsReturnZone(d)) {
          if (!form.pickupLocationReturn) {
            errors.pickupLocationReturn =
              "Izaberi zonu / stanicu za povratak.";
          }
          if (
            form.pickupLocationReturn === "other" &&
            !form.customPickupLocationReturn.trim()
          ) {
            errors.customPickupLocationReturn =
              "Opiši tačno mesto za povratak.";
          }
        }
      }
      break;
    case "drink":
      if (form.drinkPreferences.length === 0) {
        errors.drinkPreferences = "Izaberi bar jedno piće.";
      } else if (form.drinkPreferences.length > 2) {
        errors.drinkPreferences = "Najviše dva izbora.";
      }
      break;
    case "decline":
      break;
    default:
      break;
  }
  return errors;
}

function validateAll(form: FormState): FieldErrors {
  let e: FieldErrors = {};
  if (form.attendanceStatus === "no") {
    e = { ...e, ...validateStep("name", form) };
    e = { ...e, ...validateStep("attendance", form) };
    return e;
  }
  for (const step of stepOrder(form)) {
    if (
      step === "review" ||
      step === "extra" ||
      step === "selfie" ||
      step === "decline"
    ) {
      continue;
    }
    e = { ...e, ...validateStep(step, form) };
  }
  return e;
}

interface RsvpFormProps {
  guests: Guest[];
  guestsLoading: boolean;
  guestIdsAlreadySubmitted?: string[];
  initialValues?: Partial<FormState>;
  lockGuestSelection?: boolean;
  onSubmit: (payload: FormState) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
  success: boolean;
  configWarning: string | null;
  onBackToInvite?: () => void;
}

const stepTitles: Record<StepId, string> = {
  name: "Ko si na listi?",
  phone: "Broj telefona",
  attendance: "Da li dolaziš?",
  decline: "Imaš još jedan momenat da razmisliš",
  transport: "Do žurke",
  pickupZone: "Zone (polazak i povratak)",
  selfie: "Selfi",
  drink: "Šta sipamo?",
  extra: "Zahtev za pesmu",
  review: "Gotovo — pregled",
};

export function RsvpForm({
  guests,
  guestsLoading,
  guestIdsAlreadySubmitted = [],
  initialValues,
  lockGuestSelection = false,
  onSubmit,
  isSubmitting,
  submitError,
  success,
  configWarning,
  onBackToInvite,
}: RsvpFormProps) {
  const [form, setForm] = useState<FormState>(() =>
    lockGuestSelection && initialValues?.guestId
      ? { ...emptyFormState(), ...initialValues }
      : emptyFormState(),
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [activeStepId, setActiveStepId] = useState<StepId>(() =>
    lockGuestSelection && initialValues?.guestId ? "attendance" : "name",
  );
  const [pageMotion, setPageMotion] = useState<"next" | "prev">("next");
  const [selfiePreviewUrl, setSelfiePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (form.selfieFile) {
      const u = URL.createObjectURL(form.selfieFile);
      setSelfiePreviewUrl(u);
      return () => URL.revokeObjectURL(u);
    }
    setSelfiePreviewUrl(
      form.selfieStoragePath
        ? publicSelfieUrl(form.selfieStoragePath)
        : null,
    );
  }, [form.selfieFile, form.selfieStoragePath]);

  const guestsSorted = useMemo(() => sortGuestsByName(guests), [guests]);
  const guestsForNameStep = useMemo(() => {
    if (lockGuestSelection) return guestsSorted;
    const blocked = new Set(guestIdsAlreadySubmitted);
    return guestsSorted.filter((g) => !blocked.has(g.id));
  }, [guestsSorted, guestIdsAlreadySubmitted, lockGuestSelection]);

  const hasGuestList = !guestsLoading && guests.length > 0;
  const nameStepBlocked =
    guestsLoading ||
    !hasGuestList ||
    (!lockGuestSelection && guestsForNameStep.length === 0);

  const steps = useMemo(
    () => stepOrder(form),
    [form.attendanceStatus, form.transportDirection],
  );
  const currentStep: StepId = steps.includes(activeStepId)
    ? activeStepId
    : (steps[0] ?? "name");
  const stepIndex = steps.indexOf(currentStep);
  const totalSteps = steps.length;

  useEffect(() => {
    if (steps.includes(activeStepId)) return;
    if (
      activeStepId === "phone" &&
      form.attendanceStatus === ""
    ) {
      setActiveStepId("attendance");
      return;
    }
    if (activeStepId === "phone" && form.attendanceStatus === "no") {
      setActiveStepId("decline");
      return;
    }
    if (activeStepId === "pickupZone") {
      setActiveStepId("selfie");
      return;
    }
    if (activeStepId === "transport") {
      setActiveStepId(wantsPickupZones(form) ? "pickupZone" : "selfie");
      return;
    }
    if (steps.includes("decline")) {
      setActiveStepId("decline");
      return;
    }
    setActiveStepId(steps[0] ?? "name");
  }, [steps, activeStepId, form.transportDirection, form.attendanceStatus]);

  const showPickupZoneStep = wantsPickupZones(form);

  const goNext = useCallback(() => {
    if (currentStep === "name" && nameStepBlocked) return;
    const errs = validateStep(currentStep, form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setPageMotion("next");
    const i = steps.indexOf(currentStep);
    const next = steps[i + 1];
    if (next) setActiveStepId(next);
  }, [currentStep, form, steps, nameStepBlocked]);

  const goBack = useCallback(() => {
    setPageMotion("prev");
    setErrors({});
    const i = steps.indexOf(currentStep);
    const prev = steps[i - 1];
    if (prev) setActiveStepId(prev);
  }, [currentStep, steps]);

  async function handleFinalSubmit() {
    const next = validateAll(form);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    await onSubmit(form);
  }

  if (success) {
    const declined = form.attendanceStatus === "no";

    return (
      <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden px-4 py-5">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <div className="rounded-[2rem] border border-[rgba(138,101,28,0.15)] bg-white/90 p-[1px] shadow-[0_20px_50px_-20px_rgba(90,70,30,0.2)] backdrop-blur-xl">
            <div className="rounded-[1.95rem] bg-gradient-to-b from-[#FFFCF7] via-[#FBF6EF] to-[#F5ECD8]/90 px-7 py-10 text-center sm:px-8 sm:py-11">
              {declined ? (
                <p className="font-display text-2xl font-semibold tracking-tight text-[#1c1917] sm:text-[1.85rem]">
                  Hvala što si javio ili javila
                </p>
              ) : (
                <>
                  <p className="font-display text-2xl font-semibold tracking-tight text-[#1c1917] sm:text-[1.85rem]">
                    Jedva čekam da se vidimo!
                  </p>
                  <p className="mt-4 text-base font-bold leading-relaxed text-champagne-800 sm:text-lg">
                    Tačnu adresu i vreme polaska ću javiti u međuvremenu. Ako
                    zaboravim, pitajte me.
                  </p>
                </>
              )}
              {onBackToInvite && (
                <button
                  type="button"
                  onClick={onBackToInvite}
                  className="mx-auto mt-10 min-h-[48px] w-full max-w-xs rounded-full border-2 border-[rgba(138,101,28,0.22)] bg-white/95 px-6 py-3 text-sm font-semibold text-[#5c4a32] shadow-sm transition hover:bg-[#FFFCF7]"
                >
                  Nazad na pozivnicu
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-0 py-0 sm:py-1">
      <div className="mx-auto flex min-h-0 w-full max-w-none flex-1 min-w-0 flex-col overflow-hidden rounded-2xl border border-[rgba(138,101,28,0.14)] bg-[#FFFCF7]/95 p-[2px] shadow-[0_16px_44px_-18px_rgba(60,45,20,0.18)] sm:rounded-[1.75rem] sm:p-[3px]">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[1.65rem] bg-gradient-to-b from-[#FFFCF7] to-[#FBF6EF] px-4 py-4 sm:rounded-[1.7rem] sm:px-8 sm:py-5">
          <div className="mx-auto flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-1">

        {!guestsLoading && !hasGuestList && (
          <div
            className="mt-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
            role="alert"
          >
            Lista gostiju je prazna — dodaj imena u{" "}
            <code className="rounded bg-red-100 px-1">public/guests.json</code>{" "}
            i osveži stranicu.
          </div>
        )}

        {!guestsLoading &&
          hasGuestList &&
          !lockGuestSelection &&
          guestsForNameStep.length === 0 && (
            <div
              className="mt-2 rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50 to-[#FFFCF7] px-4 py-3 text-sm text-amber-950"
              role="status"
            >
              Svi pozvani su već potvrdili — za izmenu odgovora javi domaćinu.
            </div>
          )}

        {configWarning && (
          <div
            className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-900"
            role="alert"
          >
            {configWarning}
          </div>
        )}

        {currentStep !== "name" && (
          <div className="mt-1 flex flex-col items-center gap-1 sm:mt-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A651C] sm:text-xs">
              Korak {stepIndex + 1} / {totalSteps}
            </p>
            <div
              className="flex w-full max-w-2xl justify-center gap-1.5 px-1"
              role="progressbar"
              aria-valuenow={stepIndex + 1}
              aria-valuemin={1}
              aria-valuemax={totalSteps}
            >
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    i <= stepIndex
                      ? "bg-gradient-to-r from-[#E7C76F] to-[#C99A2E]"
                      : "bg-[#E8DFD0]"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-2 min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] sm:mt-3">
          <div
            key={currentStep}
            className={`flex min-h-0 w-full min-w-0 flex-col pt-1 pb-2 ${
              pageMotion === "next" ? "animate-pageNext" : "animate-pagePrev"
            }`}
          >
            {currentStep !== "name" && (
              <h3
                className={`font-display text-xl font-semibold leading-snug text-[#1c1917] sm:text-2xl ${
                  currentStep === "decline" ? "w-full text-center" : ""
                }`}
              >
                {stepTitles[currentStep]}
              </h3>
            )}

            {currentStep === "name" && (
              <div className="mt-1 min-h-0 flex-1 overflow-hidden sm:mt-2">
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A651C] sm:text-xs"
                  role="progressbar"
                  aria-valuenow={stepIndex + 1}
                  aria-valuemin={1}
                  aria-valuemax={totalSteps}
                >
                  {stepIndex + 1} / {totalSteps}
                </p>
                <p className="mb-2 mt-2 text-sm font-semibold text-[#1c1917]">
                  Ime kao na pozivnici{" "}
                  <span className="text-[#C99A2E]">*</span>
                </p>
                {guestsLoading ? (
                  <p className="mt-2 flex items-center gap-2 text-sm text-[#6b5b42]">
                    <span
                      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#E7C76F] border-t-[#C99A2E]"
                      aria-hidden
                    />
                    Učitavam listu gostiju…
                  </p>
                ) : (
                  <GuestSearchPick
                    guests={guestsForNameStep}
                    value={form.guestId}
                    onChange={(id) =>
                      setForm((f) => ({
                        ...f,
                        guestId: id,
                      }))
                    }
                    selectionLocked={lockGuestSelection}
                    disabled={!hasGuestList}
                    ariaInvalid={!!errors.guestId}
                    inputId="invite-guest-search"
                  />
                )}
                {errors.guestId && (
                  <p className="mt-2 text-sm text-[#9a3b2f]">{errors.guestId}</p>
                )}
              </div>
            )}

            {currentStep === "phone" && (
              <div className="mt-4 space-y-3">
                <label
                  htmlFor="phoneLocal"
                  className="block text-sm font-semibold text-[#1c1917]"
                >
                  Tvoj broj <span className="text-[#C99A2E]">*</span>
                </label>
                <div className="flex min-h-[48px] items-center gap-2 rounded-xl border border-[rgba(138,101,28,0.2)] bg-white px-3 py-2 shadow-sm focus-within:border-[#C99A2E] focus-within:ring-2 focus-within:ring-[#E7C76F]/40 sm:px-4">
                  <span className="shrink-0 text-sm font-semibold tracking-wide text-[#5c4a32]">
                    +381
                  </span>
                  <input
                    id="phoneLocal"
                    name="phoneLocal"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={form.phoneLocal}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        phoneLocal: sanitizePhoneLocal(e.target.value),
                      }))
                    }
                    placeholder="npr. 641234567"
                    aria-invalid={!!errors.phoneLocal}
                    className="min-w-0 flex-1 border-0 bg-transparent py-1 text-sm text-[#1c1917] outline-none placeholder:text-[#a8a29e] sm:text-base"
                  />
                </div>
                <p className="text-xs leading-relaxed text-[#6b5b42] sm:text-sm">
                  Ostatak broja počinje sa{" "}
                  <strong className="text-[#1c1917]">6</strong>,{" "}
                  <strong className="text-[#1c1917]">bez</strong> početne{" "}
                  <strong className="text-[#1c1917]">0</strong> (npr.{" "}
                  <span className="whitespace-nowrap">64 …</span>, ne{" "}
                  <span className="whitespace-nowrap">064 …</span>).
                </p>
                {errors.phoneLocal && (
                  <p className="text-sm text-[#9a3b2f]">{errors.phoneLocal}</p>
                )}
              </div>
            )}

            {currentStep === "attendance" && (
              <fieldset className="mt-4">
                <legend className="sr-only">Dolazak</legend>
                <div className="flex flex-col gap-2">
                  {ATTENDANCE_OPTIONS.map(({ value, label }) => (
                    <label
                      key={value}
                      className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition active:scale-[0.99] sm:min-h-[46px] sm:px-4 sm:py-3 ${
                        form.attendanceStatus === value
                          ? "border-[#C99A2E] bg-[#FAF0D4]/90 shadow-sm"
                          : "border-[rgba(138,101,28,0.18)] bg-white/95"
                      }`}
                    >
                      <input
                        type="radio"
                        name="attendance"
                        value={value}
                        checked={form.attendanceStatus === value}
                        onChange={() =>
                          setForm((f) => ({
                            ...f,
                            attendanceStatus: value,
                            ...(value === "no"
                              ? {
                                  phoneLocal: "",
                                  transportDirection: "" as const,
                                  pickupLocation: "",
                                  customPickupLocation: "",
                                  pickupLocationReturn: "",
                                  customPickupLocationReturn: "",
                                  drinkPreferences: [],
                                  songRequest: "",
                                  selfieFile: null,
                                  selfieStoragePath: null,
                                }
                              : {}),
                          }))
                        }
                        className="h-4 w-4 accent-[#C99A2E]"
                      />
                      <span className="text-sm text-[#1c1917] sm:text-base">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.attendanceStatus && (
                  <p className="mt-2 text-sm text-[#9a3b2f]">
                    {errors.attendanceStatus}
                  </p>
                )}
              </fieldset>
            )}

            {currentStep === "transport" && (
              <div className="mt-4 space-y-4">
                <p className="rounded-xl border border-[rgba(138,101,28,0.12)] bg-[#FFFCF7] px-3 py-2.5 text-xs leading-relaxed text-[#4a4034] sm:text-sm">
                  Prvo izaberi <strong className="text-[#1c1917]">smer</strong>{" "}
                  prevoza. Na sledećem koraku biraš{" "}
                  <strong className="text-[#1c1917]">zonu</strong> u Novom Sadu
                  (polazak i/ili povratak).
                </p>

                <fieldset>
                  <legend className="text-sm font-semibold text-[#1c1917]">
                    Šta ti treba od organizovanog prevoza?{" "}
                    <span className="text-[#C99A2E]">*</span>
                  </legend>
                  <div className="mt-2 flex flex-col gap-2">
                    {TRANSPORT_OPTIONS.map(({ value, label }) => (
                      <label
                        key={value}
                        className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition active:scale-[0.99] sm:min-h-[46px] sm:px-4 sm:py-3 ${
                          form.transportDirection === value
                            ? "border-[#C99A2E] bg-[#FAF0D4]/90 shadow-sm"
                            : "border-[rgba(138,101,28,0.18)] bg-white/95"
                        }`}
                      >
                        <input
                          type="radio"
                          name="transportDirection"
                          value={value}
                          checked={form.transportDirection === value}
                          onChange={() =>
                            setForm((f): FormState => {
                              const next = value;
                              const Z = "" as PickupLocation | "";
                              const clearAll = {
                                pickupLocation: Z,
                                customPickupLocation: "",
                                pickupLocationReturn: Z,
                                customPickupLocationReturn: "",
                              };
                              if (next === "none") {
                                return {
                                  ...f,
                                  transportDirection: next,
                                  ...clearAll,
                                };
                              }
                              if (next === "to_cottage") {
                                return {
                                  ...f,
                                  transportDirection: next,
                                  pickupLocationReturn: Z,
                                  customPickupLocationReturn: "",
                                };
                              }
                              if (next === "return_only") {
                                return {
                                  ...f,
                                  transportDirection: next,
                                  pickupLocation: Z,
                                  customPickupLocation: "",
                                };
                              }
                              return { ...f, transportDirection: next };
                            })
                          }
                          className="h-4 w-4 shrink-0 accent-[#C99A2E]"
                        />
                        <span className="text-left text-sm font-medium text-[#1c1917] sm:text-[15px]">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.transportDirection && (
                    <p className="mt-2 text-sm text-[#9a3b2f]">
                      {errors.transportDirection}
                    </p>
                  )}
                </fieldset>
              </div>
            )}

            {currentStep === "pickupZone" && showPickupZoneStep && (
              <div className="mt-4 space-y-4">
                <p className="text-xs leading-relaxed text-[#6b5b42] sm:text-sm">
                  <strong className="text-[#1c1917]">Oko 19:00</strong> polasci za
                  smer ka vikendici — tačno vreme po zoni javlja domaćin.
                </p>
                <div className="space-y-5 rounded-xl border border-[rgba(138,101,28,0.12)] bg-white/95 p-4 backdrop-blur-sm">
                  {needsOutboundZone(form.transportDirection) && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-[#1c1917]">
                        Polazak (do vikendice){" "}
                        <span className="text-[#C99A2E]">*</span>
                      </p>
                      <div>
                        <label
                          htmlFor="pickupLocation"
                          className="block text-sm font-semibold text-[#1c1917]"
                        >
                          Stanica / zona (Novi Sad)
                        </label>
                        <select
                          id="pickupLocation"
                          name="pickupLocation"
                          value={form.pickupLocation}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              pickupLocation: e.target.value as
                                | PickupLocation
                                | "",
                              customPickupLocation:
                                e.target.value === "other"
                                  ? f.customPickupLocation
                                  : "",
                            }))
                          }
                          className="mt-2 w-full min-h-[48px] rounded-xl border border-[rgba(138,101,28,0.2)] bg-white px-3 py-2.5 text-sm text-[#1c1917] outline-none focus:border-[#C99A2E] focus:ring-2 focus:ring-[#E7C76F]/40 sm:text-base"
                        >
                          <option value="">Izaberi…</option>
                          {PICKUP_LOCATIONS.map(({ value, label }) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                        {errors.pickupLocation && (
                          <p className="mt-2 text-sm text-[#9a3b2f]">
                            {errors.pickupLocation}
                          </p>
                        )}
                      </div>
                      {form.pickupLocation === "other" && (
                        <div>
                          <label
                            htmlFor="customPickup"
                            className="block text-sm font-semibold text-[#1c1917]"
                          >
                            Tačno mesto (polazak){" "}
                            <span className="text-[#C99A2E]">*</span>
                          </label>
                          <input
                            id="customPickup"
                            name="customPickup"
                            type="text"
                            value={form.customPickupLocation}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                customPickupLocation: e.target.value,
                              }))
                            }
                            className="mt-2 w-full min-h-[44px] rounded-xl border border-[rgba(138,101,28,0.2)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#C99A2E] focus:ring-2 focus:ring-[#E7C76F]/40 sm:text-base"
                          />
                          {errors.customPickupLocation && (
                            <p className="mt-2 text-sm text-[#9a3b2f]">
                              {errors.customPickupLocation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {needsReturnZone(form.transportDirection) && (
                    <div
                      className={
                        needsOutboundZone(form.transportDirection)
                          ? "space-y-3 border-t border-[#E8DFD0] pt-4"
                          : "space-y-3"
                      }
                    >
                      <p className="text-sm font-semibold text-[#1c1917]">
                        Povratak (do Novog Sada){" "}
                        <span className="text-[#C99A2E]">*</span>
                      </p>
                      <div>
                        <label
                          htmlFor="pickupLocationReturn"
                          className="block text-sm font-semibold text-[#1c1917]"
                        >
                          Stanica / zona (Novi Sad)
                        </label>
                        <select
                          id="pickupLocationReturn"
                          name="pickupLocationReturn"
                          value={form.pickupLocationReturn}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              pickupLocationReturn: e.target.value as
                                | PickupLocation
                                | "",
                              customPickupLocationReturn:
                                e.target.value === "other"
                                  ? f.customPickupLocationReturn
                                  : "",
                            }))
                          }
                          className="mt-2 w-full min-h-[48px] rounded-xl border border-[rgba(138,101,28,0.2)] bg-white px-3 py-2.5 text-sm text-[#1c1917] outline-none focus:border-[#C99A2E] focus:ring-2 focus:ring-[#E7C76F]/40 sm:text-base"
                        >
                          <option value="">Izaberi…</option>
                          {PICKUP_LOCATIONS.map(({ value, label }) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                        {errors.pickupLocationReturn && (
                          <p className="mt-2 text-sm text-[#9a3b2f]">
                            {errors.pickupLocationReturn}
                          </p>
                        )}
                      </div>
                      {form.pickupLocationReturn === "other" && (
                        <div>
                          <label
                            htmlFor="customPickupReturn"
                            className="block text-sm font-semibold text-[#1c1917]"
                          >
                            Tačno mesto (povratak){" "}
                            <span className="text-[#C99A2E]">*</span>
                          </label>
                          <input
                            id="customPickupReturn"
                            name="customPickupReturn"
                            type="text"
                            value={form.customPickupLocationReturn}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                customPickupLocationReturn: e.target.value,
                              }))
                            }
                            className="mt-2 w-full min-h-[44px] rounded-xl border border-[rgba(138,101,28,0.2)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#C99A2E] focus:ring-2 focus:ring-[#E7C76F]/40 sm:text-base"
                          />
                          {errors.customPickupLocationReturn && (
                            <p className="mt-2 text-sm text-[#9a3b2f]">
                              {errors.customPickupLocationReturn}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === "selfie" && (
              <div className="mt-4 space-y-4">
                <p className="text-xs leading-relaxed text-[#6b5b42] sm:text-sm">
                  Opciono — pošalji <strong className="text-[#1c1917]">jedan
                  selfie</strong> gde ti se{" "}
                  <strong className="text-[#1c1917]">lepo vidi faca</strong>{" "}
                  (najbolje prednja kamera, dovoljno svetla). JPG, PNG ili WebP,
                  do <strong className="text-[#1c1917]">5 MB</strong>. Na telefonu
                  možeš da izabereš{" "}
                  <strong className="text-[#1c1917]">kameru ili galeriju</strong>.
                  Možeš i da preskočiš.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <label className="inline-flex min-h-[46px] cursor-pointer items-center justify-center rounded-full border-2 border-[#C99A2E] bg-[#FAF0D4]/80 px-5 py-2.5 text-sm font-semibold text-[#5c4a32] transition hover:bg-[#FAF0D4] active:scale-[0.99]">
                    <span>Dodaj selfie</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;
                        const msg = validateSelfieFile(file);
                        if (msg) {
                          setErrors((x) => ({ ...x, selfieFile: msg }));
                          return;
                        }
                        setErrors((x) => {
                          const { selfieFile: _, ...rest } = x;
                          return rest;
                        });
                        setForm((f) => ({ ...f, selfieFile: file }));
                      }}
                    />
                  </label>
                  {(form.selfieFile || form.selfieStoragePath) && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm((f) => ({
                          ...f,
                          selfieFile: null,
                          selfieStoragePath: null,
                        }));
                        setErrors((x) => {
                          const { selfieFile: _, ...rest } = x;
                          return rest;
                        });
                      }}
                      className="min-h-[46px] rounded-full border border-[rgba(138,101,28,0.35)] bg-white/90 px-4 py-2 text-sm font-semibold text-[#6b5b42] transition hover:bg-white"
                    >
                      Bez slike
                    </button>
                  )}
                </div>
                {errors.selfieFile && (
                  <p className="text-sm text-[#9a3b2f]">{errors.selfieFile}</p>
                )}
                {selfiePreviewUrl && (
                  <div className="overflow-hidden rounded-xl bg-white ring-1 ring-[rgba(138,101,28,0.15)]">
                    <img
                      src={selfiePreviewUrl}
                      alt="Pregled selfija"
                      className="mx-auto block max-h-[min(50vh,360px)] w-full object-contain"
                    />
                  </div>
                )}
              </div>
            )}

            {currentStep === "drink" && (
              <fieldset className="mt-4">
                <legend className="text-sm font-semibold text-[#1c1917]">
                  Šta da planiramo za piće?{" "}
                  <span className="text-[#C99A2E]">*</span>{" "}
                  <span className="font-normal text-[#6b5b42]">
                    (maks. dva izbora)
                  </span>
                </legend>
                <p className="mt-1 text-xs text-[#6b5b42]">
                  Dodirni jedno ili dva pića sa liste.
                </p>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {DRINK_OPTIONS.map(({ value, label }) => {
                    const checked = form.drinkPreferences.includes(value);
                    return (
                      <label
                        key={value}
                        className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition active:scale-[0.99] ${
                          checked
                            ? "border-[#C99A2E] bg-[#FAF0D4]/90 shadow-sm"
                            : "border-[rgba(138,101,28,0.18)] bg-white/95"
                        }`}
                      >
                        <input
                          type="checkbox"
                          name="drink"
                          value={value}
                          checked={checked}
                          onChange={() =>
                            setForm((f) => ({
                              ...f,
                              drinkPreferences: toggleDrinkPreference(
                                f.drinkPreferences,
                                value,
                              ),
                            }))
                          }
                          className="h-4 w-4 shrink-0 rounded border-[#C99A2E] accent-[#C99A2E]"
                        />
                        <span className="text-left text-sm text-[#1c1917]">
                          {label}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {errors.drinkPreferences && (
                  <p className="mt-2 text-sm text-[#9a3b2f]">
                    {errors.drinkPreferences}
                  </p>
                )}
              </fieldset>
            )}

            {currentStep === "extra" && (
              <div className="mt-4 space-y-3">
                <div>
                  <label htmlFor="songRequest" className="sr-only">
                    Zahtev za pesmu
                  </label>
                  <input
                    id="songRequest"
                    name="songRequest"
                    type="text"
                    value={form.songRequest}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, songRequest: e.target.value }))
                    }
                    placeholder="Izvođač — naslov pesme"
                    className="mt-1.5 w-full min-h-[44px] rounded-xl border border-[rgba(138,101,28,0.2)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#C99A2E] focus:ring-2 focus:ring-[#E7C76F]/40 sm:text-base"
                  />
                </div>
              </div>
            )}

            {currentStep === "review" && (
              <dl className="mt-3 space-y-2.5 text-xs sm:text-sm">
                <div className="flex flex-col gap-0.5 border-b border-[#E8DFD0] pb-2.5 sm:flex-row sm:justify-between">
                  <dt className="text-[#6b5b42]">Gost</dt>
                  <dd className="font-semibold text-[#1c1917]">
                    {getGuestNameFrom(guests, form.guestId) || "—"}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5 border-b border-[#E8DFD0] pb-2.5 sm:flex-row sm:justify-between">
                  <dt className="text-[#6b5b42]">Telefon</dt>
                  <dd className="font-semibold text-[#1c1917]">
                    {form.phoneLocal
                      ? `+381 ${form.phoneLocal}`
                      : "—"}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5 border-b border-[#E8DFD0] pb-2.5 sm:flex-row sm:justify-between">
                  <dt className="text-[#6b5b42]">Dolazak</dt>
                  <dd className="font-semibold text-[#1c1917]">
                    {form.attendanceStatus
                      ? attendanceLabel(form.attendanceStatus as AttendanceStatus)
                      : "—"}
                  </dd>
                </div>
                {form.attendanceStatus === "yes" && (
                  <>
                    <div className="flex flex-col gap-0.5 border-b border-[#E8DFD0] pb-2.5 sm:flex-row sm:justify-between">
                      <dt className="text-[#6b5b42]">Prevoz</dt>
                      <dd className="text-right font-semibold text-[#1c1917]">
                        {transportDirectionLabel(form.transportDirection)}
                      </dd>
                    </div>
                    {showPickupZoneStep &&
                      needsOutboundZone(form.transportDirection) &&
                      form.pickupLocation && (
                        <div className="flex flex-col gap-0.5 border-b border-[#E8DFD0] pb-2.5 sm:flex-row sm:justify-between">
                          <dt className="text-[#6b5b42]">Polazak (zona)</dt>
                          <dd className="text-right font-semibold text-[#1c1917]">
                            {pickupLabel(form.pickupLocation as PickupLocation)}
                            {form.pickupLocation === "other" &&
                            form.customPickupLocation
                              ? ` — ${form.customPickupLocation}`
                              : ""}
                          </dd>
                        </div>
                      )}
                    {showPickupZoneStep &&
                      needsReturnZone(form.transportDirection) &&
                      form.pickupLocationReturn && (
                        <div className="flex flex-col gap-0.5 border-b border-[#E8DFD0] pb-2.5 sm:flex-row sm:justify-between">
                          <dt className="text-[#6b5b42]">Povratak (zona)</dt>
                          <dd className="text-right font-semibold text-[#1c1917]">
                            {pickupLabel(
                              form.pickupLocationReturn as PickupLocation,
                            )}
                            {form.pickupLocationReturn === "other" &&
                            form.customPickupLocationReturn
                              ? ` — ${form.customPickupLocationReturn}`
                              : ""}
                          </dd>
                        </div>
                      )}
                  </>
                )}
                {(form.selfieFile || form.selfieStoragePath) &&
                  form.attendanceStatus !== "no" && (
                    <div className="flex flex-col gap-1 border-b border-[#E8DFD0] pb-2.5 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-[#6b5b42]">Selfi</dt>
                      <dd className="flex justify-end">
                        {selfiePreviewUrl ? (
                          <img
                            src={selfiePreviewUrl}
                            alt=""
                            className="h-16 w-16 rounded-lg border border-[#E8DFD0] object-cover"
                          />
                        ) : (
                          <span className="font-semibold text-[#1c1917]">Da</span>
                        )}
                      </dd>
                    </div>
                  )}
                <div className="flex flex-col gap-0.5 border-b border-[#E8DFD0] pb-2.5 sm:flex-row sm:justify-between">
                  <dt className="text-[#6b5b42]">Piće</dt>
                  <dd className="text-right font-semibold text-[#1c1917]">
                    {formatDrinkPreferences(form.drinkPreferences)}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[#6b5b42]">Pesma</dt>
                  <dd className="break-words text-[#1c1917]">
                    {form.songRequest || "—"}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </div>

            </div>

            <div className="relative z-10 shrink-0 space-y-2 border-t border-[rgba(138,101,28,0.12)] bg-gradient-to-b from-transparent to-[#FFFCF7]/90 pt-3 pb-1 sm:space-y-3 sm:pt-4">
              <div
                className={`flex flex-col-reverse gap-2 sm:flex-row sm:gap-3 ${
                  stepIndex > 0 ? "sm:justify-between" : "sm:justify-end"
                }`}
              >
                {stepIndex > 0 && (
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={isSubmitting}
                    className="min-h-[46px] rounded-full border-2 border-[rgba(138,101,28,0.25)] bg-white/95 px-5 py-2.5 text-sm font-semibold text-[#5c4a32] transition hover:bg-[#FAF0D4]/50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Nazad
                  </button>
                )}

                {currentStep !== "review" && currentStep !== "decline" ? (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={currentStep === "name" && nameStepBlocked}
                    className="min-h-[46px] flex-1 rounded-full bg-gradient-to-r from-[#C99A2E] via-[#d4af37] to-[#E7C76F] px-6 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-[0_8px_24px_-10px_rgba(138,101,28,0.5)] transition hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-xs sm:flex-none"
                  >
                    Dalje
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handleFinalSubmit()}
                    disabled={isSubmitting}
                    className="min-h-[46px] flex-1 rounded-full bg-gradient-to-r from-[#b8892c] via-[#C99A2E] to-[#d4af37] px-6 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-[0_8px_24px_-10px_rgba(100,75,20,0.45)] transition hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:max-w-xs sm:flex-none"
                  >
                    {isSubmitting
                      ? "Šaljem…"
                      : currentStep === "decline"
                        ? "Pošalji odgovor"
                        : "Pošalji potvrdu"}
                  </button>
                )}
              </div>

              {submitError && (
                <div
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                  role="alert"
                >
                  {submitError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
