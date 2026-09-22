import type { Metadata } from "next";
import { Prose } from "@/components/site/Prose";
import { getSettings } from "@/lib/queries";
import { formatPhone } from "@/lib/format";

export const metadata: Metadata = {
  alternates: { canonical: "/privacy" },
  title: "Privacy Policy",
  description:
    "How personal information submitted through this website is collected, used and protected.",
};

export default async function PrivacyPage() {
  const settings = await getSettings();

  const content = `This policy explains what personal information is collected through this website, why it is collected, and how it is handled. It is written to align with the Digital Personal Data Protection Act, 2023.

## Who is responsible

This website is operated on behalf of ${settings.doctorName}, Consultant Endocrinologist. Questions about this policy or about your personal data can be sent to the clinic on ${formatPhone(settings.primaryPhone)}.

## What is collected

When you submit the appointment request form, the following is collected: your name, mobile number, and optionally your email address, preferred location, preferred date and time, the reason for your visit, and any additional message you choose to write.

The website does not require you to create an account, and does not ask for identity documents, insurance details or payment information.

## Why it is collected

Information submitted through the appointment form is used for one purpose only: to contact you and arrange your consultation. It is not used for marketing, and it is not sold, rented or shared with advertisers or third-party marketers.

## Please do not send medical details here

The appointment form is a scheduling tool, not a medical record. Please do not upload or type detailed medical history, test results or images into it. Bring those to your consultation instead, where they can be handled appropriately.

## Consent

By submitting the form you consent to being contacted about that request. You may withdraw consent at any time by telling the clinic, after which your details will be removed from the appointment list.

## How long it is kept

Appointment requests are retained only as long as needed to schedule and follow up on the consultation, and are deleted periodically thereafter. Clinical records created during an actual consultation are separate from this website and are governed by the applicable medical record-keeping requirements.

## Security

Data submitted through this site is transmitted over an encrypted connection and stored with access restricted to the clinic. No method of transmission or storage is completely secure, and this cannot be guaranteed absolutely.

## Cookies and analytics

This website does not use advertising cookies or third-party tracking for advertising purposes. Any analytics used is limited to aggregate measurement of page visits and does not identify you personally.

## Your rights

You may ask what personal data about you is held, ask for it to be corrected, or ask for it to be erased. Requests can be made using the clinic contact details above.

## Changes

This policy may be updated from time to time. The version published on this page is the current one.`;

  return (
    <div className="container-prose py-14 lg:py-20">
      <h1 className="font-serif text-4xl font-semibold">Privacy policy</h1>
      <Prose content={content} className="mt-8" />
    </div>
  );
}
