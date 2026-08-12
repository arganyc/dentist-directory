export type Review = {
  author: string;
  rating: number;
  date: string;
  title: string;
  body: string;
};

export function getReviewsForDentist(dentistId: string, count = 4): Review[] {
  void dentistId;
  void count;
  return [];
}
