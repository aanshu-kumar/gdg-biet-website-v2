export type EventStatus = "upcoming" | "past";

export type GdgEvent = {
  id: string;
  title: string;
  description: string;
  date: string | null;
  location: string | null;
  status: EventStatus;
  image: string | null;
  tags: string[];
  registerUrl: string | null;
  resourcesUrl: string | null;
};

export type Member = {
  id: string;
  name: string;
  role: string;
  year: number;
  image: string | null;
  linkedin: string | null;
  twitter: string | null;
  lead: boolean;
  order: number;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  tags: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  order: number;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  order: number;
};

export type Sponsor = {
  id: string;
  name: string;
  logo: string;
  url: string | null;
  order: number;
};

export type Story = {
  id: string;
  quote: string;
  name: string;
  role: string | null;
  image: string | null;
};
