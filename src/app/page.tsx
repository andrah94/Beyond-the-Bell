"use client";

import { useState, useRef, useCallback, useEffect, type FormEvent, type DragEvent, type ChangeEvent } from "react";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzM9ngzOZNjdLQpNBPOs9Cgb8hJ7SxpE9SmTz7DIOF632sJa1k26vSd1c4Dg3qu7XnV/exec";

const REQUIRED_FIELDS = [
  "fullName",
  "title",
  "school",
  "years",
  "cityState",
  "email",
  "phone",
  "bio",
] as const;

const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface FormData {
  fullName: string;
  preferredName: string;
  pronouns: string;
  title: string;
  school: string;
  years: string;
  cityState: string;
  email: string;
  phone: string;
  bio: string;
  social: string;
  dietary: string;
  anythingElse: string;
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    preferredName: "",
    pronouns: "",
    title: "",
    school: "",
    years: "",
    cityState: "",
    email: "",
    phone: "",
    bio: "",
    social: "",
    dietary: "",
    anythingElse: "",
  });

  const [headshot, setHeadshot] = useState<File | null>(null);
  const [headshotPreview, setHeadshotPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate progress
  useEffect(() => {
    const totalRequired = REQUIRED_FIELDS.length + 1; // +1 for headshot
    let filled = 0;
    for (const field of REQUIRED_FIELDS) {
      if (formData[field].trim()) filled++;
    }
    if (headshot) filled++;
    setProgress((filled / totalRequired) * 100);
  }, [formData, headshot]);

  const wordCount = formData.bio.trim()
    ? formData.bio.trim().split(/\s+/).length
    : 0;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          headshot: "Please upload a JPG, PNG, or WEBP image.",
        }));
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setErrors((prev) => ({
          ...prev,
          headshot: "File size must be under 10 MB.",
        }));
        return;
      }
      setHeadshot(file);
      setHeadshotPreview(URL.createObjectURL(file));
      setErrors((prev) => {
        const next = { ...prev };
        delete next.headshot;
        return next;
      });
    },
    []
  );

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const removeFile = () => {
    setHeadshot(null);
    if (headshotPreview) URL.revokeObjectURL(headshotPreview);
    setHeadshotPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    for (const field of REQUIRED_FIELDS) {
      if (!formData[field].trim()) {
        newErrors[field] = "This field is required.";
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!headshot) {
      newErrors.headshot = "Please upload a headshot.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const base64 = headshot ? await fileToBase64(headshot) : "";

      const payload = {
        ...formData,
        headshot: base64,
        headshotName: headshot?.name || "",
        headshotType: headshot?.type || "",
      };

      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setSubmitted(true);
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#ededed] p-6">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-success text-white text-3xl animate-[scaleIn_0.3s_ease-out]">
            ✓
          </div>
          <h2 className="mb-3 font-serif text-3xl font-semibold text-black">
            Thank You!
          </h2>
          <p className="mx-auto max-w-md text-lg text-zinc-600">
            We&apos;ve received your information and will be in touch with full
            production details shortly.
          </p>
          <p className="mt-6 text-sm italic text-zinc-500">
            — The ABLE Foundation Team
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 z-50 h-[3px] w-full bg-zinc-300">
        <div
          className="h-full bg-gradient-to-r from-azure to-azure-dark transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mx-auto max-w-2xl px-6 py-16">
        {/* Hero */}
        <header className="mb-12 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-azure">
            The ABLE Foundation Presents
          </p>
          <h1 className="mb-3 font-serif text-5xl font-bold text-black md:text-6xl">
            Beyond the Bell
          </h1>
          <p className="mb-4 text-lg text-zinc-600">
            A film by <span className="font-medium text-black">Jalen Christopher</span>
          </p>
          <p className="text-zinc-500">
            Black male educators from the DMV
          </p>
          <div className="mt-4 inline-block rounded-full bg-black px-4 py-1.5 text-sm font-medium text-white">
            April 25, 2026
          </div>
          <p className="mt-6 text-base text-zinc-600">
            Please complete the form below so we can finalize your introduction,
            credits, and production materials.
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          {/* Section 1: Personal Information */}
          <Section title="Personal Information" number={1}>
            <Field
              label="Full Name"
              required
              error={errors.fullName}
              hint="As you'd like it to appear in credits"
            >
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={inputClass(errors.fullName)}
              />
            </Field>
            <Field label="Preferred Name / What You Go By">
              <input
                type="text"
                name="preferredName"
                value={formData.preferredName}
                onChange={handleChange}
                className={inputClass()}
              />
            </Field>
            <Field label="Pronouns">
              <input
                type="text"
                name="pronouns"
                value={formData.pronouns}
                onChange={handleChange}
                className={inputClass()}
              />
            </Field>
          </Section>

          {/* Section 2: Professional Background */}
          <Section title="Professional Background" number={2}>
            <Field
              label="Professional Title"
              required
              error={errors.title}
              hint='e.g., "5th Grade Teacher, Assistant Principal, School Counselor"'
            >
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={inputClass(errors.title)}
              />
            </Field>
            <Field
              label="School or Organization"
              required
              error={errors.school}
            >
              <input
                type="text"
                name="school"
                value={formData.school}
                onChange={handleChange}
                className={inputClass(errors.school)}
              />
            </Field>
            <Field
              label="Years in Education"
              required
              error={errors.years}
            >
              <input
                type="text"
                name="years"
                value={formData.years}
                onChange={handleChange}
                className={inputClass(errors.years)}
              />
            </Field>
            <Field
              label="City & State"
              required
              error={errors.cityState}
            >
              <input
                type="text"
                name="cityState"
                value={formData.cityState}
                onChange={handleChange}
                className={inputClass(errors.cityState)}
              />
            </Field>
          </Section>

          {/* Section 3: Contact Information */}
          <Section title="Contact Information" number={3}>
            <Field
              label="Email Address"
              required
              error={errors.email}
            >
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={inputClass(errors.email)}
              />
            </Field>
            <Field
              label="Phone Number"
              required
              error={errors.phone}
              hint="For day-of production contact only"
            >
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={inputClass(errors.phone)}
              />
            </Field>
          </Section>

          {/* Section 4: Bio & Headshot */}
          <Section title="Bio & Headshot" number={4}>
            <Field
              label="Professional Bio"
              required
              error={errors.bio}
              hint="150–200 words, third person narrative"
            >
              <textarea
                name="bio"
                rows={6}
                value={formData.bio}
                onChange={handleChange}
                className={`${inputClass(errors.bio)} resize-y`}
              />
              <div className="mt-1 flex justify-end">
                <span
                  className={`text-sm font-medium ${
                    wordCount >= 150 && wordCount <= 200
                      ? "text-success"
                      : wordCount > 200
                      ? "text-error"
                      : "text-zinc-400"
                  }`}
                >
                  {wordCount} {wordCount === 1 ? "word" : "words"}
                </span>
              </div>
            </Field>

            <Field
              label="Headshot"
              required
              error={errors.headshot}
              hint="JPG, PNG, or WEBP — max 10 MB"
            >
              {headshotPreview ? (
                <div className="relative overflow-hidden rounded-lg border border-zinc-200 bg-white p-4">
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={headshotPreview}
                      alt="Headshot preview"
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-black">
                        {headshot?.name}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {headshot
                          ? `${(headshot.size / (1024 * 1024)).toFixed(2)} MB`
                          : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="rounded-full p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-error"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition ${
                    dragOver
                      ? "border-azure bg-azure/5"
                      : errors.headshot
                      ? "border-error bg-red-50"
                      : "border-zinc-300 bg-white hover:border-azure"
                  }`}
                >
                  <p className="text-sm text-zinc-500">
                    Drag and drop your headshot here, or{" "}
                    <span className="font-medium text-azure">click to browse</span>
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    className="hidden"
                  />
                </div>
              )}
            </Field>
          </Section>

          {/* Section 5: Additional Details */}
          <Section title="Additional Details" number={5}>
            <Field label="Social Media Handles">
              <input
                type="text"
                name="social"
                value={formData.social}
                onChange={handleChange}
                className={inputClass()}
              />
            </Field>
            <Field label="Dietary Restrictions or Accessibility Needs">
              <input
                type="text"
                name="dietary"
                value={formData.dietary}
                onChange={handleChange}
                className={inputClass()}
              />
            </Field>
            <Field label="Anything else you'd like us to know?">
              <textarea
                name="anythingElse"
                rows={3}
                value={formData.anythingElse}
                onChange={handleChange}
                className={`${inputClass()} resize-y`}
              />
            </Field>
          </Section>

          {/* Form Error */}
          {errors.form && (
            <p className="mb-4 text-center text-sm text-error">
              {errors.form}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-black py-3.5 text-base font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Information"}
          </button>
        </form>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-zinc-400">
          &copy; 2026 The ABLE Foundation &middot; All rights reserved
        </footer>
      </div>
    </>
  );
}

// ─── Helper Components ───────────────────────────────────────────────────────

function Section({
  title,
  number,
  children,
}: {
  title: string;
  number: number;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="mb-10">
      <legend className="mb-5 flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-azure text-xs font-bold text-white">
          {number}
        </span>
        <span className="font-serif text-xl font-semibold text-black">
          {title}
        </span>
      </legend>
      <div className="space-y-5">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-black">
        {label}
        {required && <span className="ml-0.5 text-error">*</span>}
      </label>
      {hint && <p className="mb-1.5 text-xs text-zinc-400">{hint}</p>}
      {children}
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}

function inputClass(error?: string) {
  return `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-black outline-none transition placeholder:text-zinc-400 focus:border-azure focus:ring-2 focus:ring-azure/20 ${
    error ? "border-error" : "border-zinc-200"
  }`;
}
