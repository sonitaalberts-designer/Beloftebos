import { Photo } from "@/components/site/photo";
import { Shell, PageIntro, FinalCTA } from "@/components/site/shell";
import { settings, content } from "@/lib/public-data";
import { photos } from "@/lib/content";
import { meta } from "@/lib/seo";
export const generateMetadata = () =>
  meta(
    "Eat & drink",
    "Meals by arrangement, the Tea Garden, deli and bar at BelofteBos Farmhouse Inn. Contact Heidi to plan meals for your stay.",
    "/eat-drink",
  );
export default async function Page() {
  const s = await settings(),
    menu = await content("menu_items");
  return (
    <Shell settings={s}>
      <main id="main">
        <PageIntro
          eyebrow="Pull up a chair"
          title="Good food. Better company."
          text={String(s.meal_text)}
        />
        <div className="page-body">
          <Photo
            src={photos.food}
            alt="Fruit platter and flowers at the farmhouse"
            className="w-full h-[450px] object-cover rounded-lg mb-12"
          />
          <div className="contact-layout">
            <div>
              <h2>A place at our table.</h2>
              <p>
                Tea Garden, deli, bar, braai and boma — ask us about what’s
                available during your visit. Meals should be arranged in
                advance.
              </p>
              <a className="button" href="/contact?subject=Meal%20arrangements">
                Arrange your meals
              </a>
            </div>
            <div>
              {menu.length ? (
                menu.map((m) => (
                  <div className="border-b py-5" key={m.id}>
                    <span className="eyebrow">{String(m.category)}</span>
                    <h3>{m.name}</h3>
                    <p>{m.description}</p>
                    {m.price != null && (
                      <strong>R {Number(m.price).toFixed(2)}</strong>
                    )}
                  </div>
                ))
              ) : (
                <div className="notice">
                  For current menus, dietary requirements and meal arrangements,
                  please speak to Heidi before your visit.
                </div>
              )}
            </div>
          </div>
        </div>
        <FinalCTA />
      </main>
    </Shell>
  );
}
