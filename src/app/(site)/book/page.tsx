import { redirect } from "next/navigation";
import { getPublishedLocations } from "@/lib/queries";

const DEFAULT_BOOKING_URL = "https://tinyurl.com/Pawangoel";

export default async function BookPage() {
  const locations = await getPublishedLocations();
  const primaryClinic = locations.find((location) => location.isPrimary);

  redirect(primaryClinic?.bookingUrl || DEFAULT_BOOKING_URL);
}
