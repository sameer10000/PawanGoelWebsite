import type { Metadata } from "next";
import { Prose } from "@/components/site/Prose";
import { getSettings } from "@/lib/queries";

export const metadata: Metadata = {
  alternates: { canonical: "/disclaimer" },
  title: "Medical Disclaimer",
  description:
    "The information on this website is general in nature and is not a substitute for medical consultation.",
};

export default async function DisclaimerPage() {
  const settings = await getSettings();

  const content = `## Informational purpose only

The content on this website — including descriptions of conditions, treatments and technology — is provided for general awareness. It is not medical advice, and it is not a diagnosis or a treatment plan for any individual.

## No doctor–patient relationship

Reading this website, submitting the appointment form, or messaging the clinic does not by itself create a doctor–patient relationship. That relationship begins at consultation.

## Individual variation

Endocrine conditions present differently in different people. Treatment depends on your age, other illnesses, medicines, test results and circumstances. What is appropriate for one person may be unsafe for another. Do not start, stop or change any medication based on what you read here.

## No guarantee of outcome

No outcome or result is promised or implied anywhere on this site. Response to treatment varies between individuals, and reference to any condition or technology should not be read as an assurance of improvement.

## Emergencies

This website is not monitored continuously and must never be used for urgent problems. If you have severe symptoms — including very high or very low blood sugar, chest pain, breathlessness, severe dehydration, confusion, seizure or loss of consciousness — go to the nearest emergency department immediately.

## External links

Links to hospital and directory websites are provided for convenience. ${settings.doctorName} is not responsible for the content or accuracy of external sites.

## Timings and fees

Consulting timings, locations and fees shown here are indicative and may change without notice, particularly at hospital OPDs. Please confirm by telephone before travelling.`;

  return (
    <div className="container-prose py-14 lg:py-20">
      <h1 className="font-serif text-4xl font-semibold">Medical disclaimer</h1>
      <Prose content={content} className="mt-8" />
    </div>
  );
}
