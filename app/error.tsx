"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="page-error">
      <h1>Something needs a moment.</h1>
      <p>Please try again, or contact Heidi on +27 83 409 1170.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
