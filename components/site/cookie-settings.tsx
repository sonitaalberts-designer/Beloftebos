"use client";
export function CookieSettings() {
  return (
    <div className="flex gap-4 flex-wrap">
      <button
        className="button"
        onClick={() => {
          localStorage.setItem("bb_analytics", "no");
          location.reload();
        }}
      >
        Use essential cookies only
      </button>
      <button
        className="button outline"
        onClick={() => {
          localStorage.setItem("bb_analytics", "yes");
          location.reload();
        }}
      >
        Allow optional analytics
      </button>
    </div>
  );
}
