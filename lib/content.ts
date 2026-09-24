export type Entry = {
  id: string;
  name?: string;
  title?: string;
  slug?: string;
  description?: string;
  image?: string;
  published?: boolean;
  sort_order?: number;
  [key: string]: unknown;
};
export type Room = Entry & {
  name: string;
  description: string;
  capacity: number;
  beds: string;
  bathroom: string;
  amenities: string;
  price: number | null;
  featured: boolean;
  published: boolean;
};
export const brand = {
  name: "BelofteBos Farmhouse Inn",
  phone: "+27 83 409 1170",
  email: "reservations@beloftebos.net",
  location: "Bandelierkop, Limpopo, South Africa",
  lekker:
    "https://www.lekkeslaap.co.za/accommodation/belofte-bos-farmhouse-inn",
  booking:
    "https://www.booking.com/hotel/za/beloftebos-farmhouse-inn.en-gb.html",
  maps: "https://www.google.com/maps/search/?api=1&query=BelofteBos+Farmhouse+Inn+Bandelierkop",
};
export const photos = {
  hero: "/images/farmhouse-hero.avif",
  garden: "/images/garden.avif",
  pool: "/images/pool.avif",
  room: "/images/room.avif",
  food: "/images/food.avif",
  nature: "/images/nature.avif",
};
export const defaults: Record<string, unknown> = {
  hero_heading: "Your peaceful escape in the heart of the Limpopo bushveld.",
  hero_description: "A peaceful countryside stay in the heart of Limpopo.",
  intro_heading: "A little place.\nA lot of heart.",
  intro_text:
    "Just off the rhythm of the N1, a different pace awaits. Welcome to BelofteBos Farmhouse Inn: a countryside retreat in Bandelierkop, near Louis Trichardt / Makhado.\nWhether you’re stopping for the night, travelling for work or bringing the family for a slower escape, settle in and make yourself at home.",
  phone: brand.phone,
  email: brand.email,
  contact_name: "Heidi Alberts",
  lekker_url: brand.lekker,
  booking_url: brand.booking,
  meal_text:
    "Breakfast, lunch and dinner are available by arrangement. Please book your meals ahead with Heidi so we can make you feel at home.",
  direct_booking_enabled: false,
  footer_text: "A peaceful farmhouse stay. A warm Limpopo welcome.",
  social_instagram: "",
  social_facebook: "",
  whatsapp_enabled: false,
  checkin_time: "",
  checkout_time: "",
  analytics_id: "",
  meta_pixel_id: "",
};
export const initialFaqs: Entry[] = [
  {
    id: "location",
    title: "Where will you find us?",
    description:
      "BelofteBos Farmhouse Inn is in Bandelierkop, Limpopo, near the N1 and Louis Trichardt / Makhado.",
    published: true,
  },
  {
    id: "meals",
    title: "Can we arrange meals during our stay?",
    description:
      "Yes. Breakfast, lunch and dinner are available by arrangement. Please contact Heidi before your arrival to discuss meals.",
    published: true,
  },
  {
    id: "channels",
    title: "How can I book a stay?",
    description:
      "Explore our booking options online, or contact Heidi on +27 83 409 1170. You can also book through our LekkeSlaap and Booking.com listings.",
    published: true,
  },
  {
    id: "functions",
    title: "Can we enquire about a private gathering?",
    description:
      "We welcome function enquiries. Tell us your preferred date, group size and plans, and we will discuss what is suitable.",
    published: true,
  },
];
export const experiences = [
  ["Nature", "Birdsong, garden paths and the quiet beauty of the veld."],
  ["Rest", "A comfortable place to pause, unpack and feel at home."],
  ["Eat", "Good company and meals thoughtfully arranged ahead."],
  ["Unwind", "Poolside afternoons and time around the boma."],
  ["Discover", "Follow your curiosity into the Limpopo countryside."],
  ["Connect", "Make room for the people you love — and a slower pace."],
];
export const postSeeds: Entry[] = [
  {
    id: "journal-1",
    slug: "where-to-stay-near-louis-trichardt",
    title: "Where to stay near Louis Trichardt: a farmhouse escape",
    description:
      "Choosing accommodation near Louis Trichardt? Plan a quieter stay in Bandelierkop with practical tips for meals, arrival and onward travel.",
    image: photos.hero,
    category: "Stay a little",
    body: `## Choose the pace of your stay\nLouis Trichardt, also known as Makhado, is a useful reference point when planning a journey through northern Limpopo. Your first accommodation decision is less about a long list of facilities and more about how you want to spend the evening. Do you need to be in town, or would you prefer to finish the day in the countryside?\n\nBelofteBos Farmhouse Inn is in Bandelierkop, near the N1. It offers a farmhouse setting for travellers who would like a quieter pause. If you have an appointment in Makhado, check the exact route and allow time for the drive rather than assuming a town address.\n\n## Ask about the room that suits you\nA couple stopping overnight and a family travelling with children may need very different arrangements. Before confirming, share the number of adults and children, ask about the bed configuration and bathroom, and make sure the room works for your group. Check the final rate and what it includes for your particular dates.\n\n## Plan dinner before you arrive\nBreakfast, lunch and dinner can be arranged at BelofteBos. Contact Heidi in advance about timing and dietary requirements; availability should be confirmed rather than assumed. A little planning means your first evening can be about settling in.\n\n## Make your arrival uncomplicated\nSave the property’s map link, confirm your expected arrival time and keep the contact number handy. On a long N1 journey, update your host if the day runs late. Ask about check-in arrangements before setting off.\n\n## Leave space in the itinerary\nA countryside overnight stop does not need a packed activity list. A garden pause, a conversation over a meal and an unhurried morning can be enough. If you are here on business, confirm any connectivity or workspace needs directly before booking.\n\n[Explore accommodation](/accommodation) or [ask Heidi about your stay](/contact).`,
  },
  {
    id: "journal-2",
    slug: "things-to-do-limpopo-bandelierkop",
    title: "A little exploring around Bandelierkop",
    description:
      "A thoughtful guide to planning time in Limpopo from Bandelierkop, from local town visits to longer days out.",
    image: photos.nature,
    category: "Out & about",
    body: `## Start with the countryside\nThe best starting point for a stay in Bandelierkop may be the place you have already arrived. BelofteBos offers garden and outdoor spaces where you can slow down and look more closely at the countryside. Birdwatching is an invitation to pay attention rather than a promise of a particular sighting.\n\n## Keep a town day simple\nLouis Trichardt / Makhado can form part of a practical day out, especially if you need supplies or have appointments. Build the day around the places you actually want to visit, and confirm opening hours before leaving. A map search is a starting point; calling ahead is often more useful.\n\n## Give longer excursions enough time\nTzaneen, Magoebaskloof and Polokwane are possible themes for a wider Limpopo itinerary. They should not all be treated as quick stops around the corner. Choose one area, check the route from Bandelierkop and decide how much of your day you want to spend driving.\n\n## Let the season shape your plans\nOutdoor days depend on heat, rain and daylight. Look at the forecast close to your trip, carry water and ask local operators whether your chosen activity needs advance booking. For walks, confirm where guests may go and follow the property’s guidance.\n\n## Build in an easy return\nIf you would like dinner at BelofteBos, arrange it before your excursion and agree a realistic return time. There is no need to fill every hour: a shorter outing can leave room for a poolside afternoon or a quiet evening.\n\n## Ask for current local suggestions\nLocal knowledge is most useful when it matches your interests. Tell Heidi whether you are travelling with children, looking for a gentle outing or planning a full day on the road. [Get in touch](/contact) and [explore the BelofteBos experience](/#experience).`,
  },
  {
    id: "journal-3",
    slug: "limpopo-road-trip-bandelierkop-stop",
    title: "The pleasure of a slower N1 stop",
    description:
      "Plan a comfortable N1 overnight stop in Bandelierkop, with useful reminders for arrival, meals and the next leg of your Limpopo road trip.",
    image: photos.garden,
    category: "On the road",
    body: `## Choose an overnight stop before the day gets long\nA Limpopo road trip is easier to enjoy when your overnight plan is settled. Bandelierkop is near the N1, making it a place to consider when planning a journey through the province. BelofteBos Farmhouse Inn offers a countryside setting for a pause between travel days.\n\n## Plan with real driving conditions\nDo not build your day around the fastest possible map estimate. Add time for fuel, rest breaks and road conditions, and check your route again before departure. If you are continuing towards a border crossing, confirm the latest official requirements separately. An accommodation booking does not establish border eligibility or opening arrangements.\n\n## Tell your host how you are travelling\nShare your expected arrival time and let Heidi know if your plans change. If your vehicle or group has particular access or parking needs, ask about them before confirming. Save the directions while you have a reliable connection.\n\n## Arrange a meal, then switch off\nBreakfast, lunch and dinner at BelofteBos are available by arrangement. Discuss your needs ahead so you know what to expect when you arrive. Confirm any dietary requirements and the timing of breakfast if you hope to depart early.\n\n## Make room for a proper pause\nAn overnight stop can be more than a bed between two drives. Put the bags down, spend a little time outdoors and give everyone a chance to settle. Families may appreciate leaving extra time in the morning so the next leg does not begin in a rush.\n\n## Confirm the essentials together\nBefore leaving home, check your dates, room configuration, booking terms, meal arrangements and arrival plan in one place. [Plan your stay](/book) or [contact Heidi](/contact) for help with the details.`,
  },
  {
    id: "journal-4",
    slug: "northern-kruger-trip-planning",
    title: "Planning the northern Kruger part of your journey",
    description:
      "How to think about a farmhouse stop in Limpopo alongside a northern Kruger itinerary, without underestimating travel or park access planning.",
    image: photos.nature,
    category: "Further afield",
    body: `## Separate your farmhouse stay from your park stay\nNorthern Kruger can be part of a broader Limpopo journey. BelofteBos Farmhouse Inn is in Bandelierkop; it is not inside Kruger National Park. Treat a stay here as a countryside stop on your wider route and check the actual drive to your chosen gate before deciding on a park visit.\n\n## Choose the gate around your itinerary\nPunda Maria is one of the names you may encounter while researching northern Kruger. The right entrance depends on where you are going, what you have booked and current access conditions. Consult SANParks directly for gate information rather than relying on an old itinerary or a general travel estimate.\n\n## Check official access information\nBefore travelling, verify opening times, conservation fees, identification requirements and any day-visitor booking requirements on the official SANParks website. These details can change. If you have an overnight reservation inside the park, read its arrival instructions carefully.\n\n## Avoid an overfull driving day\nRoad travel, gate formalities and park driving all take time. Build a plan that leaves room for delays and gets you to your booked destination within its arrival window. An early departure may require breakfast arrangements to be discussed with your host beforehand.\n\n## Enjoy each place for what it offers\nA farmhouse stay has its own rhythm: gardens, meals by arrangement and time to rest. It does not need to imitate a safari experience. Wildlife sightings at any countryside property should be treated as a possibility, never a guarantee.\n\n## Put your route together before booking\nUse current maps alongside [official SANParks information](https://www.sanparks.org/parks/kruger). Then [contact BelofteBos](/contact) with your travel dates and expected arrival, or [explore the farmhouse stay](/accommodation).`,
  },
  {
    id: "journal-5",
    slug: "farm-stay-limpopo-beloftebos",
    title: "Small moments. A proper farmhouse stay.",
    description:
      "What to expect from a countryside stay at BelofteBos in Limpopo, and what to arrange before you arrive.",
    image: photos.pool,
    category: "Farmhouse life",
    body: `## Arrive with a little room in the day\nA farm stay is an opportunity to move at a different pace. At BelofteBos Farmhouse Inn in Bandelierkop, the countryside setting is part of the experience. Leave space between your drive and your next plan so you can settle in instead of immediately setting off again.\n\n## Notice the ordinary things\nThe garden, birdlife and outdoor spaces invite an unhurried kind of attention. Bring binoculars if you enjoy birds, but let sightings be a surprise. The property’s countryside environment is a place to respect: follow guidance around wildlife and ask which paths are appropriate to use.\n\n## Make your comfort requirements clear\nFarmhouse charm should still work for the people travelling. Ask about the available room, beds, bathroom and any specific accessibility or connectivity needs. Do not assume that every room offers the same facilities. Tell the host about your group before committing to a booking.\n\n## Arrange meals in advance\nBreakfast, lunch and dinner can be booked by arrangement. If eating together is an important part of your stay, discuss timing and dietary needs before arrival. Menus and availability should come from the property directly.\n\n## Spend time outdoors thoughtfully\nA swimming pool, braai areas and boma are part of the property experience described in the brief. Ask about current use arrangements, supervise children near water and follow the host’s guidance on fires. A relaxed stay is helped by a few clear expectations.\n\n## Choose your own rhythm\nSome guests are here for one night on the road; others want time with family or a gentle countryside break. There is no single correct way to spend your visit. [Ask about accommodation](/accommodation) and [tell Heidi what would make your stay comfortable](/contact).`,
  },
  {
    id: "journal-6",
    slug: "weekend-getaway-limpopo",
    title: "A weekend with a little less on the list",
    description:
      "Plan a peaceful Limpopo weekend around a farmhouse stay, meals by arrangement and time with the people who matter.",
    image: photos.food,
    category: "Slow weekends",
    body: `## Start with how you want to feel\nA weekend getaway does not need a long list of activities to be worthwhile. If the aim is to rest, make plans that leave enough time to do just that. BelofteBos Farmhouse Inn in Bandelierkop offers a countryside setting for a slower Limpopo escape.\n\n## Agree on the essentials early\nChoose your dates, confirm the accommodation that suits your group and discuss the final rate and booking terms. Couples may want a quiet break; families may need particular beds and meal times. Asking the right questions before booking makes the weekend more comfortable for everyone.\n\n## Let a meal anchor the day\nBreakfast, lunch and dinner are available by arrangement. Choose the meals you would like to share at the property and confirm them ahead. That can be enough structure for a day that otherwise stays open. Do not assume walk-in restaurant hours or a fixed menu.\n\n## Choose one outing, if you want one\nIf you feel like exploring, pick a single area or activity that interests your group. Verify its opening arrangements and route before leaving. You can also stay close: a garden pause and a poolside afternoon may be exactly the change of pace you were looking for.\n\n## Pack for the actual forecast\nCheck the weather before travelling, bring comfortable clothes for time outdoors and take what you personally need for sun or rain. Confirm any activity or facility requirements directly with the property.\n\n## Keep Sunday gentle\nAsk about check-out and breakfast arrangements before planning your return drive. A little preparation keeps the last morning from becoming a rush. [Plan a weekend stay](/book), [browse the gallery](/gallery) or [speak to Heidi](/contact).`,
  },
].map((p) => ({
  ...p,
  author: "BelofteBos Journal",
  published: true,
  published_at: "2026-09-10",
  updated_at: "2026-09-10",
  seo_title: p.title,
  seo_description: p.description,
  alt: "BelofteBos Farmhouse Inn, Bandelierkop, Limpopo",
}));
