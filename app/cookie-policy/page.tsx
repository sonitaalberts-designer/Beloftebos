import { Shell } from "@/components/site/shell";
import { CookieSettings } from "@/components/site/cookie-settings";
import { meta } from "@/lib/seo";
export const generateMetadata = () =>
  meta(
    "Cookie policy",
    "Manage essential cookies and optional analytics on the BelofteBos website.",
    "/cookie-policy",
  );
export default function Page() {
  return (
    <Shell>
      <main id="main" className="legal">
        <h1>Cookies & your choices</h1>
        <h2>Essential cookies</h2>
        <p>
          The administrator session cookie keeps authorised staff signed in
          securely for up to eight hours. The private review hosting platform
          may also require its own sign-in cookies.
        </p>
        <h2>Optional analytics</h2>
        <p>
          Your analytics preference is stored in your browser. When analytics is
          configured and you consent, visit and interaction events may be sent
          to Google Analytics. The website does not load optional analytics when
          you choose essential cookies only.
        </p>
        <h2>Embedded maps</h2>
        <p>
          Google Maps is loaded only after you choose “Load interactive map”.
          Google then receives connection information and may use cookies under
          its own policies.
        </p>
        <CookieSettings />
      </main>
    </Shell>
  );
}
