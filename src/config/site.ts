export const siteConfig = {
  name: "EduEarn",
  tagline: "Learn. Teach. Earn.",
  description: "An AI-powered peer learning marketplace where anyone can learn and young students can teach and earn.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://eduearn.com",
  ogImage: "https://eduearn.com/og-image.png",
  contact: {
    email: "support@eduearn.com",
    phone: "+91 98765 43210",
    address: "Bangalore, Karnataka, India",
  },
  links: {
    twitter: "https://twitter.com/eduearn",
    github: "https://github.com/eduearn",
    instagram: "https://instagram.com/eduearn",
    linkedin: "https://linkedin.com/company/eduearn",
  },
};

export type SiteConfig = typeof siteConfig;
