import { Shell } from "@/components/site/shell";
import { meta } from "@/lib/seo";
export const generateMetadata = () =>
  meta(
    "Booking terms",
    "How booking requests and enquiries are handled by BelofteBos Farmhouse Inn.",
    "/terms",
  );
export default function Page() {
  return (
    <Shell>
      <main id="main" className="legal">
        <span className="eyebrow">Before confirming your stay</span>
        <h1>Booking terms</h1>
        <h2>Requests and confirmation</h2>
        <p>
          Submitting a direct booking request or function enquiry is not final
          confirmation. BelofteBos will confirm availability and arrangements
          with you. Keep your booking reference and contact the property if you
          have not received a response.
        </p>
        <h2>Rates and payments</h2>
        <p>
          Where a rate is displayed, review the dates, guest numbers and total
          shown before submitting. This website does not collect card payments.
          The property will provide payment instructions and confirm what is
          included before finalising your booking.
        </p>
        <h2>Changes and cancellations</h2>
        <p>
          Ask for the cancellation, amendment and payment terms that apply to
          your booking before confirming. No cancellation fee or refund
          entitlement is specified on this page. Bookings made through external
          platforms are also subject to the terms presented by those platforms.
        </p>
        <h2>Arrival, departure and meals</h2>
        <p>
          Check-in and check-out arrangements must be confirmed with the
          property. Breakfast, lunch and dinner are available by arrangement.
          Please discuss meal times and dietary needs in advance.
        </p>
        <h2>Functions and special requests</h2>
        <p>
          Function suitability, capacity, catering, timing and accommodation are
          subject to a separate confirmation. Special requests are not
          guaranteed until agreed by the property.
        </p>
        <h2>Contact</h2>
        <p>
          Heidi Alberts · +27 83 409 1170
          <br />
          reservations@beloftebos.net
        </p>
      </main>
    </Shell>
  );
}
