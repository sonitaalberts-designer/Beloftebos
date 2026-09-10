import { Shell } from "@/components/site/shell";
import { meta } from "@/lib/seo";
export const generateMetadata = () =>
  meta(
    "Privacy notice",
    "How BelofteBos uses information provided through booking and enquiry forms.",
    "/privacy-policy",
  );
export default function Page() {
  return (
    <Shell>
      <main id="main" className="legal">
        <span className="eyebrow">Your information</span>
        <h1>Privacy notice</h1>
        <p>
          This notice describes the information handled by this website. For
          privacy questions, contact reservations@beloftebos.net.
        </p>
        <h2>What we collect</h2>
        <p>
          Booking and enquiry forms collect the contact details and trip or
          event information you choose to provide. Booking records may include
          guest names, dates, group sizes, arrival details and special requests.
          Please avoid including sensitive personal information that is not
          needed for your enquiry.
        </p>
        <h2>How it is used</h2>
        <p>
          We use this information to respond to enquiries, manage reservations,
          coordinate your stay and maintain records of booking changes.
          Administrators can access the records necessary to manage the
          property. The website also uses limited request information to help
          prevent spam and abuse.
        </p>
        <h2>Service providers</h2>
        <p>
          Website hosting, database storage and configured email providers
          process information needed to deliver these services. External booking
          platforms operate under their own privacy terms. Google Maps is loaded
          only when you choose to open the interactive map.
        </p>
        <h2>Cookies and analytics</h2>
        <p>
          Essential session cookies support secure administrator sign-in.
          Optional analytics are enabled only after consent. You can change your
          choice on the cookie policy page.
        </p>
        <h2>Your choices</h2>
        <p>
          Contact reservations@beloftebos.net to request access to, correction
          of or deletion of information you have submitted. Requests are
          reviewed with regard to applicable recordkeeping obligations. You may
          also contact South Africa’s Information Regulator about a privacy
          concern.
        </p>
        <h2>Retention and security</h2>
        <p>
          Access to operational records is restricted to authorised
          administrators. Contact the property for its confirmed retention
          schedule and information about a particular record.
        </p>
      </main>
    </Shell>
  );
}
