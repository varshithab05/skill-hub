import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GrowthChart,
  SkillsDistributionChart,
  RevenueChart,
  EngagementChart,
} from "./graphs";

const FeaturesPage = () => {
  const features = [
    {
      category: "Platform Features",
      items: [
        {
          icon: "🌟",
          title: "Top Global Talent",
          description:
            "Connect with verified professionals from around the world, ensuring quality work delivery.",
        },
        {
          icon: "💼",
          title: "Secure Payments",
          description:
            "Built-in payment protection system keeps your transactions safe and worry-free.",
        },
        {
          icon: "🤝",
          title: "24/7 Support",
          description:
            "Round-the-clock dedicated support team to assist you with any queries.",
        },
      ],
    },
    {
      category: "Service Types",
      items: [
        {
          icon: "👨‍💻",
          title: "Freelancer Account",
          description:
            "Perfect for professionals looking to offer services with just 0.5% commission.",
          highlight: "0.5% Commission",
        },
        {
          icon: "🏢",
          title: "Hybrid Account",
          description:
            "Flexibility to both hire and work as a freelancer with comprehensive features.",
          highlight: "1.5% Commission",
        },
        {
          icon: "🌐",
          title: "Enterprise Account",
          description:
            "Ideal for businesses seeking top talent for long-term projects.",
          highlight: "1% Commission",
        },
      ],
    },
    {
      category: "Collaboration Tools",
      items: [
        {
          icon: "💬",
          title: "Real-time Chat",
          description: "Seamless communication with built-in messaging system.",
        },
        {
          icon: "📊",
          title: "Project Management",
          description:
            "Track progress, set milestones, and manage deadlines efficiently.",
        },
        {
          icon: "📝",
          title: "Contract Management",
          description: "Legally-binding contracts with e-signature support.",
        },
      ],
    },
    {
      category: "Advanced Features",
      items: [
        {
          icon: "🔒",
          title: "Escrow Payment",
          description: "Secure payment holding until project completion.",
          highlight: "100% Safe",
        },
        {
          icon: "📈",
          title: "Analytics Dashboard",
          description:
            "Comprehensive insights into your performance and earnings.",
          highlight: "Real-time Data",
        },
        {
          icon: "🎯",
          title: "Smart Matching",
          description:
            "AI-powered project recommendations based on your skills.",
          highlight: "AI Powered",
        },
      ],
    },
  ];

  const categories = [
    {
      title: "Development",
      skills: [
        "Website Design",
        "Mobile Apps",
        "Android Apps",
        "iPhone Apps",
        "Software Architecture",
      ],
    },
    {
      title: "Design",
      skills: [
        "Graphic Design",
        "Logo Design",
        "UI/UX Design",
        "Brand Identity",
        "Illustration",
      ],
    },
    {
      title: "Writing",
      skills: [
        "Content Writing",
        "Copywriting",
        "Technical Writing",
        "Translation",
        "Proofreading",
      ],
    },
  ];

  return (
    <div className="bg-dark text-light min-h-screen">
      {/* Hero Section with Enhanced Background */}
      <section className="min-h-[100vh] flex flex-col justify-center items-center relative overflow-hidden px-4">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-grey to-dark animate-gradient-xy opacity-70"></div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute h-32 w-32 bg-cyan-blue/5 rounded-full -top-16 -left-16 animate-float-slow"></div>
          <div className="absolute h-48 w-48 bg-cyan-blue/5 rounded-full top-1/2 -right-24 animate-float"></div>
          <div className="absolute h-24 w-24 bg-cyan-blue/5 rounded-full bottom-12 left-1/4 animate-float-fast"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2358c4dc' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Powerful Features for
            <span className="block bg-gradient-to-r from-cyan-blue via-light to-cyan-blue text-transparent bg-clip-text animate-gradient">
              Every Professional
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto mb-8"
          >
            Discover the tools and features that make SkillHub the perfect
            platform for your professional journey.
          </motion.p>
        </div>
      </section>

      {/* Animated Graphs Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            Platform Statistics
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Growth Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gray-800 p-6 rounded-xl"
            >
              <h3 className="text-xl font-semibold mb-2 text-cyan-blue">
                Platform Growth
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Monthly growth of users and completed projects
              </p>
              <GrowthChart />
              <p className="text-gray-400 text-xs mt-4 text-center">
                Data represents the last 6 months of platform activity
              </p>
            </motion.div>
            {/* Skills Distribution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gray-800 p-6 rounded-xl"
            >
              <h3 className="text-xl font-semibold mb-2 text-cyan-blue">
                Skills Distribution
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Breakdown of skills across different categories
              </p>
              <SkillsDistributionChart />
              <p className="text-gray-400 text-xs mt-4 text-center">
                Based on active projects and user specializations
              </p>
            </motion.div>

            {/* Revenue Growth Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gray-800 p-6 rounded-xl mt-8"
            >
              <h3 className="text-xl font-semibold mb-2 text-cyan-blue">
                Revenue Growth
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Monthly revenue distribution across account types
              </p>
              <RevenueChart />
              <p className="text-gray-400 text-xs mt-4 text-center">
                Monthly revenue breakdown between freelancer and enterprise
                accounts
              </p>
            </motion.div>

            {/* User Engagement Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gray-800 p-6 rounded-xl mt-8"
            >
              <h3 className="text-xl font-semibold mb-2 text-cyan-blue">
                User Engagement Metrics
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Platform engagement and user retention rates
              </p>
              <EngagementChart />
              <p className="text-gray-400 text-xs mt-4 text-center">
                Monthly user engagement and retention rates in percentages
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Existing Features Grid */}
      {features.map((section, idx) => (
        <section key={idx} className="py-16 bg-gray-900">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-center mb-12"
            >
              {section.category}
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {section.items.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-blue-500/30 transition-all duration-200 group"
                >
                  <div className="bg-gray-700 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-4xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 mb-4">{feature.description}</p>
                  {feature.highlight && (
                    <span className="inline-block bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-sm font-medium">
                      {feature.highlight}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Categories Section with Enhanced Styling */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            Explore Categories
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-gray-900 p-8 rounded-xl border border-gray-800 hover:border-blue-500/30 transition-all duration-200"
              >
                <h3 className="text-xl font-semibold mb-4 text-blue-400">
                  {category.title}
                </h3>
                <div className="space-y-3">
                  {category.skills.map((skill, idx) => (
                    <p key={idx} className="text-gray-400">
                      {skill}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-16 bg-gradient-to-tr from-blue-500 via-cyan-500 to-teal-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 0C6.716 0 0 6.716 0 15c0 8.284 6.716 15 15 15 8.284 0 15-6.716 15-15 0-8.284-6.716-15-15-15zm0 27C8.373 27 3 21.627 3 15S8.373 3 15 3s12 5.373 12 12-5.373 12-12 12z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-8">
              Ready to Experience These Features?
            </h2>
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-4 rounded-lg font-medium bg-white text-blue-600 hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
            >
              Get Started Now
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
