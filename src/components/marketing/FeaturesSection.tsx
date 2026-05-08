import { Code2, Sparkles, Search, Terminal, File, LayoutGrid } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const FEATURES = [
  {
    icon: Code2,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.12)',
    title: 'Code Snippets',
    description: 'Save reusable code with syntax highlighting. Organize by language, tags, and collections.',
  },
  {
    icon: Sparkles,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    title: 'AI Prompts',
    description: 'Build your personal prompt library. Save your best prompts with context and examples.',
  },
  {
    icon: Search,
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.12)',
    title: 'Instant Search',
    description: 'Find anything in milliseconds. Search across titles, content, tags, and type.',
  },
  {
    icon: Terminal,
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.12)',
    title: 'Commands',
    description: 'Never forget a CLI command again. Store with descriptions and usage examples.',
  },
  {
    icon: File,
    color: '#94a3b8',
    bg: 'rgba(100,116,139,0.12)',
    title: 'Files & Docs',
    description: 'Upload context files, documentation, and reference materials. Available on Pro.',
    pro: true,
  },
  {
    icon: LayoutGrid,
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
    title: 'Collections',
    description: 'Group related items into collections. React patterns, AI workflows, DevOps toolkits.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-[#080810]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything a developer needs,{' '}
            <span className="bg-linear-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
              in one place
            </span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Store, organize, and retrieve any kind of developer knowledge instantly.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <ScrollReveal key={feature.title}>
                <div className="rounded-xl border border-white/5 bg-white/2 p-6 hover:bg-white/4 transition-colors h-full">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ background: feature.bg, color: feature.color }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 className="text-white font-semibold mb-2">
                    {feature.title}
                    {feature.pro && (
                      <span className="ml-2 text-xs text-zinc-500 font-normal">(Pro)</span>
                    )}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
