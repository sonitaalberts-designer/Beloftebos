import { Shell } from "@/components/site/shell";
export default function NotFound() {
  return (
    <Shell>
      <main id="main" className="page-error">
        <span className="eyebrow">A little off the path · 404</span>
        <h1>
          Let’s get you back
          <br />
          to the farmhouse.
        </h1>
        <p>This page could not be found.</p>
        <a className="button" href="/">
          Back to BelofteBos
        </a>
      </main>
    </Shell>
  );
}
