export const site = {
  name: "Mithila Taxi",
  title: "Mithila Taxi — Reliable & Fast Ride Booking",
  description:
    "Mithila Taxi offers safe, reliable, and comfortable transportation services. Book your next ride easily with our clear pricing and experienced drivers.",
  url: "https://mithila-taxi.vercel.app",
  ogImage: "/images/og.png",
  twitterHandle: "@MithilaTaxi",
  phone: "+91 7070702021",
  email: "websidharth@gmail.com",
  address: "Jaganpura, Patna, Bihar, India",
};

export const absoluteUrl = (path: string) => {
  const base = site.url.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
};
