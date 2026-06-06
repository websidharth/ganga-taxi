export type Service = {
  id: number;
  title: string;
  description: string;
  icon: string;
  slug: string;
  category: "Email Tools" | "Utilities" | "Design Tools" | "Media Tools" | "SEO Tools" | "Marketing Tools";
  features: string[];
  longDescription: string;
};

export const services: Service[] = [
  {
    id: 1,
    title: "Taxi Booking App",
    description: "Book and manage taxi rides effortlessly.",
    icon: "🚖",
    slug: "/taxi-booking",
    category: "Utilities",
    features: [
      "Real-time ride tracking",
      "Dark mode support",
      "Secure payment options",
    ],
    longDescription:
      "Our Taxi Booking App allows users to easily book and manage their taxi rides. With a user-friendly interface, you can quickly find nearby taxis, compare prices, and schedule rides in advance. The app also provides real-time tracking of your ride and secure payment options for a seamless experience.",
  },
 

];


export const getServiceBySlug = (slug: string) => services.find((s) => s.slug === slug);
