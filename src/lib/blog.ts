export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  excerpt: string;
  content: { heading?: string; body: string }[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "how-often-should-you-see-a-dentist",
    title: "How Often Should You Really See a Dentist?",
    description:
      "The classic 'twice a year' rule is a starting point, not a one-size-fits-all answer. Here's how to know what's right for you.",
    author: "Dr. Sarah Mitchell, DDS",
    date: "April 24, 2026",
    readTime: "6 min read",
    category: "Preventive Care",
    excerpt:
      "Most adults grew up hearing the 'every six months' rule, but modern dental research suggests visit frequency should be tailored to individual risk factors.",
    content: [
      {
        body: "For decades, the answer was reflexively 'every six months.' But that recommendation traces back to a 1950s toothpaste advertising campaign more than to clinical research. Modern dental medicine takes a more personalized approach.",
      },
      {
        heading: "The risk-based model",
        body: "The American Dental Association now recommends visit frequency based on individual risk factors: smoking history, diabetes, oral hygiene habits, and history of cavities or gum disease. A low-risk patient with great home care may only need annual visits. A higher-risk patient may benefit from visits every three to four months.",
      },
      {
        heading: "Who should still go twice a year",
        body: "Patients with active gum disease, a recent history of cavities, smokers, pregnant patients, and anyone with conditions that affect immune response should plan on cleanings every six months at minimum. Your dentist can help calibrate the schedule that works for you.",
      },
      {
        heading: "Why skipping visits is risky",
        body: "Many dental conditions are painless in their early stages. By the time you feel something, the treatment is usually more expensive and more invasive. Regular checkups exist to catch problems before they become problems.",
      },
      {
        heading: "The bottom line",
        body: "Talk to your dentist about your personal risk profile and let that guide your visit schedule. If you haven't been in over a year, now is a good time to schedule a checkup.",
      },
    ],
  },
  {
    slug: "invisalign-vs-braces",
    title: "Invisalign vs. Traditional Braces: Which is Right for You?",
    description:
      "Clear aligners and metal braces both work — but the right choice depends on your case, lifestyle, and budget. We break down the differences.",
    author: "Dr. James Rodriguez, DDS, MS",
    date: "April 12, 2026",
    readTime: "8 min read",
    category: "Orthodontics",
    excerpt:
      "Both treatments can produce excellent results, but they're not interchangeable. Here's a practical comparison from an orthodontist who uses both.",
    content: [
      {
        body: "When patients walk into my office asking 'should I get Invisalign or braces?', I always start the same way: it depends on your teeth, your timeline, and your lifestyle. Both work — but they work differently.",
      },
      {
        heading: "How each one works",
        body: "Traditional braces use brackets bonded to your teeth and a wire that the orthodontist adjusts every few weeks. Clear aligners (Invisalign and similar systems) use a series of custom-molded plastic trays that you swap out roughly every one to two weeks. Each tray moves your teeth a small amount.",
      },
      {
        heading: "When braces are the better choice",
        body: "Severe rotations, significant bite corrections, and cases involving missing or impacted teeth often respond better to braces. The fine-grained control of a wire-and-bracket system is hard to match. Braces also remove the compliance question — they're working 24/7 whether you want them to or not.",
      },
      {
        heading: "When clear aligners shine",
        body: "Mild to moderate crowding and spacing, adult patients concerned about appearance at work, and patients who want to remove the appliance to eat and clean their teeth normally are great candidates for aligners. Treatment time is comparable for cases that fall within their capability.",
      },
      {
        heading: "The compliance factor",
        body: "Aligners only work if you wear them 20 to 22 hours per day. Patients who don't will see slower progress and worse results. Be honest with yourself about whether you'll stick to the schedule.",
      },
      {
        heading: "Cost considerations",
        body: "Costs are similar in many markets, though aligners can run higher for complex cases. Insurance often covers both equivalently. Ask your orthodontist for an itemized treatment plan before deciding.",
      },
    ],
  },
  {
    slug: "what-to-do-dental-emergency",
    title: "What to Do in a Dental Emergency: A 5-Minute Guide",
    description:
      "Chipped tooth, knocked-out tooth, or sudden severe pain? Here's exactly what to do in the first hour — and what not to do.",
    author: "Dr. Benjamin Harris, DMD",
    date: "March 30, 2026",
    readTime: "5 min read",
    category: "Emergency Care",
    excerpt:
      "Dental emergencies are stressful, but the first hour matters more than most people realize. Knowing the right response can save a tooth.",
    content: [
      {
        body: "Dental emergencies happen at inconvenient times — late nights, weekends, on vacation. The actions you take in the first hour can determine whether a tooth is saved or lost. Here's the field guide every household should know.",
      },
      {
        heading: "Knocked-out tooth (avulsion)",
        body: "Find the tooth and pick it up by the crown — the white part, not the root. Gently rinse it with milk or saline (not water). If you can, place it back in the socket and bite down on a clean cloth. If not, store it in a cup of milk or saliva. Get to a dentist within 30 to 60 minutes. The faster you act, the higher the chance the tooth survives.",
      },
      {
        heading: "Cracked or chipped tooth",
        body: "Rinse your mouth with warm water. Save any pieces you can find. Apply a cold compress to the outside of your face to reduce swelling. Call your dentist for a same-day appointment. Avoid chewing on that side and skip very hot or cold foods until you're seen.",
      },
      {
        heading: "Severe toothache",
        body: "Floss gently around the painful tooth to remove anything trapped between teeth. Rinse with warm salt water. Take an over-the-counter pain reliever per the package directions. Do not place aspirin directly on the gum — that can burn tissue. See your dentist within 24 hours; severe pain usually indicates infection or significant decay.",
      },
      {
        heading: "Lost filling or crown",
        body: "Keep the area clean and avoid chewing on that side. If a crown came off, dental cement from any pharmacy can temporarily re-secure it. Don't use household glue. See your dentist within a few days.",
      },
      {
        heading: "When to go to the ER instead",
        body: "Facial swelling that's spreading toward the eye or down the neck, difficulty swallowing or breathing, and trauma involving the jaw all warrant the emergency room, not a dental office. These can be life-threatening.",
      },
    ],
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
