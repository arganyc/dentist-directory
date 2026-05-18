export type Review = {
  author: string;
  rating: number;
  date: string;
  title: string;
  body: string;
};

const REVIEW_POOL: Review[] = [
  {
    author: "Jennifer L.",
    rating: 5,
    date: "2 weeks ago",
    title: "Best dental experience I've had",
    body: "The entire staff was warm and professional from check-in to checkout. They explained every step of the cleaning and never made me feel rushed. Highly recommend!",
  },
  {
    author: "Marcus T.",
    rating: 5,
    date: "1 month ago",
    title: "Genuinely cares about patients",
    body: "I came in nervous about a procedure I had been putting off for years. The team made me feel completely at ease. Painless and quick — wish I'd come sooner.",
  },
  {
    author: "Priya S.",
    rating: 4,
    date: "3 weeks ago",
    title: "Great care, slight wait",
    body: "Excellent quality of care and modern equipment. Only minor complaint is that I waited about 15 minutes past my appointment time, but the visit itself was worth it.",
  },
  {
    author: "Robert K.",
    rating: 5,
    date: "2 months ago",
    title: "Finally found my forever dentist",
    body: "After moving to the area I tried a few different practices before finding this one. The level of detail in the exam and the friendliness of the staff is unmatched.",
  },
  {
    author: "Sarah M.",
    rating: 5,
    date: "5 days ago",
    title: "Brought all three of my kids",
    body: "My kids actually look forward to dental visits now. The team is incredible with children and turns what could be a stressful appointment into a fun experience.",
  },
  {
    author: "David R.",
    rating: 4,
    date: "1 month ago",
    title: "Solid practice, fair pricing",
    body: "Insurance was handled smoothly and the pricing for items not covered was reasonable and explained upfront. No surprise bills, which I really appreciate.",
  },
  {
    author: "Emily C.",
    rating: 5,
    date: "3 months ago",
    title: "Beautiful results on my veneers",
    body: "I had been self-conscious about my smile for years. The consultation was thorough and the final result exceeded my expectations. I cannot stop smiling.",
  },
  {
    author: "Anthony G.",
    rating: 5,
    date: "6 weeks ago",
    title: "Same-day crown was amazing",
    body: "Came in expecting two visits and a temporary crown, walked out the same day with a permanent crown that fits perfectly. Modern tech makes a real difference.",
  },
  {
    author: "Linda H.",
    rating: 4,
    date: "2 weeks ago",
    title: "Knowledgeable and patient",
    body: "Took the time to answer every one of my questions about treatment options. I never felt pressured into anything I didn't want or need.",
  },
  {
    author: "Tom B.",
    rating: 5,
    date: "1 week ago",
    title: "Painless wisdom teeth removal",
    body: "I was dreading this for months. The procedure was quick, recovery was easier than expected, and the follow-up call the next day was a nice touch.",
  },
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getReviewsForDentist(dentistId: string, count = 4): Review[] {
  const start = hash(dentistId) % REVIEW_POOL.length;
  const reviews: Review[] = [];
  for (let i = 0; i < count; i++) {
    reviews.push(REVIEW_POOL[(start + i) % REVIEW_POOL.length]);
  }
  return reviews;
}
