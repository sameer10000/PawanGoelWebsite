import type { Metadata } from "next";
import { Prose } from "@/components/site/Prose";
import { getSettings } from "@/lib/queries";

export const metadata: Metadata = {
  alternates: { canonical: "/terms" },
  title: "Terms of Use",
  description: "Terms governing the use of this website.",
};

export default async function TermsPage() {
  const settings = await getSettings();

  const content = `## Acceptance

By using this website you agree to these terms. If you do not agree, please do not use the site.

## Purpose of this website

This website provides information about the practice of ${settings.doctorName}, Consultant Endocrinologist, including qualifications, conditions treated, consulting locations and timings. It exists to inform patients, in keeping with the professional conduct requirements applicable to registered medical practitioners in India.

## Appointment requests

Submitting the appointment form creates a request, not a confirmed booking. An appointment is confirmed only when the clinic contacts you and agrees a time. Appointments at hospital locations are subject to that hospital's own booking process, availability and fees.

## Accuracy of information

Reasonable care is taken to keep this website accurate and current. Timings, fees and locations may nonetheless change without notice. Medical information reflects general understanding at the time of writing and may be superseded.

## Your responsibilities

You agree to provide accurate contact details when submitting a request, not to use the site for any unlawful purpose, and not to attempt to disrupt, probe or gain unauthorised access to the site or its systems.

## Intellectual property

The text, layout and images on this website are the property of the practice and may not be reproduced or republished elsewhere without permission.

## Limitation of liability

To the extent permitted by law, no liability is accepted for any loss arising from reliance on the general information published here, or from any interruption in the availability of this website.

## Governing law

These terms are governed by the laws of India, and the courts at Delhi shall have jurisdiction over any dispute arising from the use of this website.`;

  return (
    <div className="container-prose py-14 lg:py-20">
      <h1 className="font-serif text-4xl font-semibold">Terms of use</h1>
      <Prose content={content} className="mt-8" />
    </div>
  );
}
