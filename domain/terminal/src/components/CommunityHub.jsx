import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Github,
  MessageCircle,
  Users,
  Star,
  GitFork,
  TrendingUp,
  Calendar,
  ExternalLink,
  Heart,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';

const CommunityHub = () => {
  const [githubStats, setGithubStats] = useState({
    stars: 0,
    forks: 0,
    issues: 0,
    contributors: 0,
  });

  const [discordStats, setDiscordStats] = useState({
    members: 0,
    online: 0,
    channels: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);

  // Mock data for demonstration
  useEffect(() => {
    // In a real app, fetch from GitHub API and Discord API
    setGithubStats({
      stars: 1247,
      forks: 89,
      issues: 23,
      contributors: 15,
    });

    setDiscordStats({
      members: 5432,
      online: 234,
      channels: 12,
    });

    setRecentActivity([
      {
        type: 'github',
        action: 'New issue opened',
        title: 'Feature request: Dark mode themes',
        author: 'developer123',
        time: '2 hours ago',
      },
      {
        type: 'discord',
        action: 'New discussion',
        title: 'Best practices for AI integration',
        author: 'terminal_guru',
        time: '4 hours ago',
      },
      {
        type: 'github',
        action: 'Pull request merged',
        title: 'Add support for custom keybindings',
        author: 'contributor_xyz',
        time: '1 day ago',
      },
    ]);
  }, []);

  const communityFeatures = [
    {
      icon: Github,
      title: 'Open Source',
      description: 'Contribute to the project on GitHub',
      link: 'https://github.com/rinawarp/terminal',
      color: 'hover:text-gray-900',
    },
    {
      icon: MessageCircle,
      title: 'Discord Community',
      description: 'Join our Discord for real-time support',
      link: 'https://discord.gg/rinawarp',
      color: 'hover:text-indigo-600',
    },
    {
      icon: Users,
      title: 'Community Forum',
      description: 'Discuss features and get help',
      link: '/community',
      color: 'hover:text-blue-600',
    },
  ];

  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Join Our <span className="gradient-text">Community</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Connect with developers, contributors, and users worldwide. Share
            ideas, get help, and contribute to the future of RinaWarp Terminal
            Pro.
          </p>
        </motion.div>

        {/* Community stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 text-center"
          >
            <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">
              {githubStats.stars.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">GitHub Stars</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 text-center"
          >
            <GitFork className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">
              {githubStats.forks.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Forks</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 text-center"
          >
            <Users className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">
              {discordStats.members.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Community Members</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 text-center"
          >
            <MessageCircle className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">
              {githubStats.contributors}
            </div>
            <div className="text-sm text-gray-400">Contributors</div>
          </motion.div>
        </div>

        {/* Community features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {communityFeatures.map((feature, index) => (
            <motion.a
              key={index}
              href={feature.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={'group bg-gray-800/30 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-gray-600 transition-all hover:-translate-y-1'}
            >
              <feature.icon
                className={`w-12 h-12 mb-4 text-gray-400 group-hover:text-blue-400 transition-colors ${feature.color}`}
              />
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400 mb-4">{feature.description}</p>
              <div className="flex items-center text-blue-400 group-hover:text-blue-300">
                <span className="text-sm">Join now</span>
                <ExternalLink className="w-4 h-4 ml-2" />
              </div>
            </motion.a>
          ))}
        </div>

        {/* Recent activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-8"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
            Recent Community Activity
          </h3>

          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'github'
                        ? 'bg-gray-700'
                        : 'bg-indigo-600'
                    }`}
                  >
                    {activity.type === 'github' ? (
                      <Github className="w-5 h-5 text-white" />
                    ) : (
                      <MessageCircle className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {activity.title}
                    </div>
                    <div className="text-sm text-gray-400">
                      {activity.action} by {activity.author} • {activity.time}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {activity.type === 'github' ? (
                    <>
                      <button className="p-2 text-gray-400 hover:text-green-400 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button className="p-2 text-gray-400 hover:text-purple-400 transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-xl">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Join?
            </h3>
            <p className="text-blue-100 mb-6">
              Be part of the growing RinaWarp community. Share your ideas,
              contribute code, and help shape the future of terminal interfaces.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com/rinawarp/terminal"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                View on GitHub
              </a>
              <a
                href="https://discord.gg/rinawarp"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
              >
                Join Discord
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CommunityHub;
