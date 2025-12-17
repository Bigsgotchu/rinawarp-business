import React, { useState, useEffect } from 'react';
import {
  TerminalHeader,
  TerminalButton,
  StatCard,
  LoadingSpinner,
} from './TerminalComponents';

const ProjectHealthDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for demonstration
  const mockProjects = [
    {
      id: 'rinawarp-platform',
      name: 'RinaWarp Platform',
      path: '/home/karina/Documents/Rinawarp-Platforms',
      status: 'healthy',
      lastAnalyzed: new Date(),
      issues: 3,
      tasks: 12,
      progress: 75,
    },
    {
      id: 'terminal-pro',
      name: 'Terminal Pro',
      path: '/home/karina/Documents/Rinawarp-Platforms/apps/terminal',
      status: 'warning',
      lastAnalyzed: new Date(Date.now() - 3600000),
      issues: 7,
      tasks: 8,
      progress: 45,
    },
    {
      id: 'website',
      name: 'Website',
      path: '/home/karina/Documents/Rinawarp-Platforms/apps/website',
      status: 'critical',
      lastAnalyzed: new Date(Date.now() - 86400000),
      issues: 15,
      tasks: 20,
      progress: 20,
    },
  ];

  useEffect(() => {
    setProjects(mockProjects);
    if (mockProjects.length > 0) {
      setSelectedProject(mockProjects[0]);
      analyzeProject(mockProjects[0]);
    }
  }, []);

  const analyzeProject = async (project) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockAnalysis = {
        overview: {
          healthScore:
            project.status === 'healthy'
              ? 95
              : project.status === 'warning'
                ? 70
                : 40,
          totalFiles: 245,
          linesOfCode: 15420,
          lastCommit: new Date(Date.now() - 1800000),
          branch: 'main',
        },
        issues: {
          critical: project.status === 'critical' ? 3 : 0,
          warning:
            project.status === 'warning'
              ? 5
              : project.status === 'critical'
                ? 8
                : 2,
          info:
            project.issues -
            (project.status === 'warning'
              ? 5
              : project.status === 'critical'
                ? 11
                : 2),
        },
        tasks: [
          {
            id: 1,
            title: 'Fix security vulnerabilities',
            priority: 'high',
            status: 'pending',
            assignee: 'Developer',
          },
          {
            id: 2,
            title: 'Update dependencies',
            priority: 'medium',
            status: 'in_progress',
            assignee: 'Auto',
          },
          {
            id: 3,
            title: 'Optimize performance',
            priority: 'low',
            status: 'pending',
            assignee: 'Developer',
          },
          {
            id: 4,
            title: 'Add tests',
            priority: 'medium',
            status: 'pending',
            assignee: 'QA',
          },
          {
            id: 5,
            title: 'Update documentation',
            priority: 'low',
            status: 'pending',
            assignee: 'Tech Writer',
          },
        ],
        metrics: {
          testCoverage: Math.floor(Math.random() * 30) + 60,
          performance: Math.floor(Math.random() * 20) + 75,
          maintainability: Math.floor(Math.random() * 15) + 80,
          security: Math.floor(Math.random() * 10) + 85,
        },
        recommendations: [
          'Consider updating to latest Node.js version',
          'Add more unit tests for critical paths',
          'Review and optimize database queries',
          'Implement proper error monitoring',
        ],
      };

      setAnalysis(mockAnalysis);
    } catch (error) {
      console.error('Error analyzing project:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalysis = async () => {
    if (selectedProject) {
      setRefreshing(true);
      await analyzeProject(selectedProject);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
    case 'healthy':
      return 'text-mermaid-cyan';
    case 'warning':
      return 'text-yellow-400';
    case 'critical':
      return 'text-red-400';
    default:
      return 'text-mermaid-text';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
    case 'healthy':
      return '🟢';
    case 'warning':
      return '🟡';
    case 'critical':
      return '🔴';
    default:
      return '⚪';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <div className="flex-1 flex flex-col p-6">
      <TerminalHeader
        title="Project Health Dashboard"
        subtitle="Monitor and manage your project health"
        className="mb-6"
      />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project List */}
        <div className="bg-mermaid-ocean/80 backdrop-blur-md border border-mermaid-cyan/30 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-mermaid-cyan mb-4">
            Projects
          </h3>
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => {
                  setSelectedProject(project);
                  analyzeProject(project);
                }}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedProject?.id === project.id
                    ? 'bg-mermaid-cyan/20 border border-mermaid-cyan'
                    : 'bg-mermaid-ocean/50 hover:bg-mermaid-ocean/70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-mermaid-text">
                    {project.name}
                  </h4>
                  <span className="text-sm">
                    {getStatusIcon(project.status)}{' '}
                    {getStatusColor(project.status)}
                  </span>
                </div>
                <div className="text-xs text-mermaid-text/60 mb-2">
                  {project.path}
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-mermaid-text/60">
                    {project.issues} issues
                  </span>
                  <span className="text-mermaid-text/60">
                    {project.tasks} tasks
                  </span>
                  <span className="text-mermaid-text/60">
                    {formatTimeAgo(project.lastAnalyzed)}
                  </span>
                </div>
                <div className="mt-2 bg-mermaid-ocean/50 rounded-full h-2">
                  <div
                    className="bg-mermaid-cyan h-2 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Results */}
        <div className="lg:col-span-2 space-y-6">
          {selectedProject && (
            <>
              {/* Project Overview */}
              <div className="bg-mermaid-ocean/80 backdrop-blur-md border border-mermaid-cyan/30 rounded-xl p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-mermaid-cyan">
                      {selectedProject.name}
                    </h3>
                    <p className="text-mermaid-text/60 text-sm">
                      {selectedProject.path}
                    </p>
                  </div>
                  <TerminalButton
                    variant="ghost"
                    size="sm"
                    onClick={refreshAnalysis}
                    disabled={refreshing || loading}
                  >
                    {refreshing ? <LoadingSpinner size="sm" /> : '🔄 Refresh'}
                  </TerminalButton>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="lg" />
                    <span className="ml-3 text-mermaid-text">
                      Analyzing project...
                    </span>
                  </div>
                ) : (
                  analysis && (
                    <>
                      {/* Health Score */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-mermaid-text/80">
                            Health Score
                          </span>
                          <span
                            className={`text-2xl font-bold ${getStatusColor(selectedProject.status)}`}
                          >
                            {analysis.overview.healthScore}%
                          </span>
                        </div>
                        <div className="bg-mermaid-ocean/50 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              analysis.overview.healthScore >= 80
                                ? 'bg-mermaid-cyan'
                                : analysis.overview.healthScore >= 60
                                  ? 'bg-yellow-400'
                                  : 'bg-red-400'
                            }`}
                            style={{
                              width: `${analysis.overview.healthScore}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <StatCard
                          title="Files"
                          value={analysis.overview.totalFiles}
                          icon="📁"
                          color="cyan"
                        />
                        <StatCard
                          title="Lines"
                          value={analysis.overview.linesOfCode.toLocaleString()}
                          icon="📝"
                          color="coral"
                        />
                        <StatCard
                          title="Test Coverage"
                          value={`${analysis.metrics.testCoverage}%`}
                          icon="🧪"
                          color="cyan"
                        />
                        <StatCard
                          title="Security"
                          value={`${analysis.metrics.security}%`}
                          icon="🔒"
                          color="coral"
                        />
                      </div>

                      {/* Issues Breakdown */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-red-400">
                            {analysis.issues.critical}
                          </div>
                          <div className="text-sm text-red-400/80">
                            Critical
                          </div>
                        </div>
                        <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-yellow-400">
                            {analysis.issues.warning}
                          </div>
                          <div className="text-sm text-yellow-400/80">
                            Warnings
                          </div>
                        </div>
                        <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-blue-400">
                            {analysis.issues.info}
                          </div>
                          <div className="text-sm text-blue-400/80">Info</div>
                        </div>
                      </div>

                      {/* Tasks */}
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-mermaid-cyan mb-3">
                          Actionable Tasks
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {analysis.tasks.slice(0, 5).map((task) => (
                            <div
                              key={task.id}
                              className="flex items-center justify-between p-3 bg-mermaid-ocean/50 rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-mermaid-text">
                                  {task.title}
                                </div>
                                <div className="text-sm text-mermaid-text/60">
                                  Assigned to: {task.assignee}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`px-2 py-1 rounded text-xs ${
                                    task.priority === 'high'
                                      ? 'bg-red-500/20 text-red-400'
                                      : task.priority === 'medium'
                                        ? 'bg-yellow-500/20 text-yellow-400'
                                        : 'bg-blue-500/20 text-blue-400'
                                  }`}
                                >
                                  {task.priority}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded text-xs ${
                                    task.status === 'completed'
                                      ? 'bg-mermaid-cyan/20 text-mermaid-cyan'
                                      : task.status === 'in_progress'
                                        ? 'bg-yellow-500/20 text-yellow-400'
                                        : 'bg-mermaid-ocean/50 text-mermaid-text/60'
                                  }`}
                                >
                                  {task.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <h4 className="text-lg font-semibold text-mermaid-cyan mb-3">
                          Recommendations
                        </h4>
                        <div className="space-y-2">
                          {analysis.recommendations.map((rec, index) => (
                            <div
                              key={index}
                              className="flex items-start space-x-3 p-3 bg-mermaid-ocean/50 rounded-lg"
                            >
                              <span className="text-mermaid-cyan mt-1">💡</span>
                              <span className="text-sm text-mermaid-text">
                                {rec}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )
                )}
              </div>
            </>
          )}

          {!selectedProject && (
            <div className="bg-mermaid-ocean/80 backdrop-blur-md border border-mermaid-cyan/30 rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">📊</div>
              <div className="text-mermaid-text/60">
                Select a project to view its health analysis
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectHealthDashboard;
