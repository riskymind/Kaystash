import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ScrollReveal from './ScrollReveal';

const CHECKLIST = [
  {
    title: 'Auto-tagging',
    description: 'AI analyzes your content and suggests relevant tags automatically.',
  },
  {
    title: 'Code Explanation',
    description: 'Paste any snippet and get a clear, concise explanation instantly.',
  },
  {
    title: 'Prompt Optimizer',
    description: 'Refine your AI prompts for better, more consistent results.',
  },
  {
    title: 'Smart Summaries',
    description: 'Generate concise summaries of long code blocks and documents.',
  },
];

export default function AISection() {
  return (
    <section id="ai" className="py-24 bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <ScrollReveal>
            <Badge variant="outline" className="mb-6 text-violet-400 border-violet-400/30">
              Pro Feature
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
              AI-powered knowledge management
            </h2>
            <ul className="flex flex-col gap-6">
              {CHECKLIST.map((item) => (
                <li key={item.title} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={12} className="text-violet-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold mb-1">{item.title}</div>
                    <div className="text-zinc-400 text-sm leading-relaxed">{item.description}</div>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollReveal>

          <ScrollReveal>
            <div className="rounded-xl overflow-hidden border border-white/5 bg-zinc-900">
              <div className="flex items-center gap-2 px-4 py-3 bg-zinc-800/50 border-b border-white/5">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-3 text-xs text-zinc-500">typescript</span>
              </div>
              <div className="p-5 font-mono text-sm leading-relaxed overflow-x-auto">
                <pre className="text-zinc-300">
                  <span className="text-blue-400">const</span>{' '}
                  <span className="text-yellow-300">useAuth</span>{' '}
                  <span className="text-zinc-500">= () =&gt;</span>{' '}
                  <span className="text-zinc-400">{'{'}</span>{'\n'}
                  {'  '}<span className="text-blue-400">const</span>{' '}
                  <span className="text-zinc-300">[user, setUser]</span>{' '}
                  <span className="text-zinc-500">= </span>
                  <span className="text-yellow-300">useState</span>
                  <span className="text-zinc-400">(</span>
                  <span className="text-blue-400">null</span>
                  <span className="text-zinc-400">);</span>{'\n\n'}
                  {'  '}<span className="text-blue-400">const</span>{' '}
                  <span className="text-yellow-300">login</span>{' '}
                  <span className="text-zinc-500">= </span>
                  <span className="text-blue-400">async</span>
                  <span className="text-zinc-400">{' (credentials) => {'}</span>{'\n'}
                  {'    '}<span className="text-blue-400">const</span>{' '}
                  <span className="text-zinc-300">res</span>{' '}
                  <span className="text-zinc-500">= </span>
                  <span className="text-blue-400">await</span>{' '}
                  <span className="text-yellow-300">fetch</span>
                  <span className="text-zinc-400">(</span>
                  <span className="text-green-400">{`'/api/auth'`}</span>
                  <span className="text-zinc-400">{', {'}</span>{'\n'}
                  {'      '}<span className="text-zinc-300">{'method: '}</span>
                  <span className="text-green-400">{`'POST'`}</span>
                  <span className="text-zinc-400">,</span>{'\n'}
                  {'    '}<span className="text-zinc-400">{'});'}</span>{'\n'}
                  {'    '}<span className="text-yellow-300">setUser</span>
                  <span className="text-zinc-400">(</span>
                  <span className="text-blue-400">await</span>{' '}
                  <span className="text-zinc-300">res</span>
                  <span className="text-zinc-400">.</span>
                  <span className="text-yellow-300">json</span>
                  <span className="text-zinc-400">());</span>{'\n'}
                  {'  '}<span className="text-zinc-400">{'};'}</span>{'\n\n'}
                  {'  '}<span className="text-blue-400">return</span>
                  <span className="text-zinc-400">{' { user, login };'}</span>{'\n'}
                  <span className="text-zinc-400">{'};'}</span>
                </pre>
              </div>
              <div className="px-5 py-4 border-t border-white/5 bg-zinc-800/30">
                <div className="text-xs text-zinc-500 mb-3">✨ AI Generated Tags</div>
                <div className="flex flex-wrap gap-2">
                  {['react', 'hooks', 'authentication', 'typescript', 'api'].map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded-md bg-zinc-700/50 text-zinc-300 text-xs border border-white/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
