import React from 'react';
import { CodeShoebox } from './components/CodeShoebox';
import { themes, Theme } from './theme';
import { useSandboxState } from './hooks/useSandboxState';

// A custom theme defined locally for the "Matrix" demo
const matrixTheme: Theme = {
  name: "Matrix",
  light: { 
     primary: "120 100% 25%", 
     primaryForeground: "0 0% 100%", 
     ring: "120 100% 25%", 
     sidebarPrimary: "120 100% 25%",
     sidebarPrimaryForeground: "0 0% 100%", 
     sidebarRing: "120 100% 25%",
     background: "0 0% 95%", 
     foreground: "120 100% 15%"
  },
  dark: {
    primary: "120 100% 50%", 
    primaryForeground: "0 0% 0%",
    ring: "120 100% 50%",
    sidebarPrimary: "120 100% 50%",
    sidebarPrimaryForeground: "0 0% 0%", 
    sidebarRing: "120 100% 50%",
    background: "0 0% 0%", 
    foreground: "120 100% 50%",
    card: "0 0% 5%",
    muted: "120 50% 10%"
  }
};

export const Demo: React.FC = () => {
    // We use isolated sandbox states for the demos so they don't interfere with the main app
    const matrixState = useSandboxState('demo_matrix');

    const quizCode = "const secret = 42;\nconsole.log('The secret is: ' + secret);";
    const matrixCode = "// Wake up, Neo...\n// The Matrix has you.\n\nfunction followTheWhiteRabbit() {\n  console.log('Knock, knock, Neo.');\n}\n\nfollowTheWhiteRabbit();";
    
    return (
        <div className="h-full w-full overflow-y-auto">
            <div className="max-w-5xl mx-auto py-12 px-6 space-y-16">
                
                <header>
                    <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                        Cookbook Demos
                    </h1>
                    <p className="text-lg opacity-70 max-w-2xl">
                        A collection of example configurations showing the versatility of the CodeShoebox component.
                    </p>
                </header>

                {/* Example 1 */}
                <section>
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                             <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
                             <h2 className="text-2xl font-semibold">The "Pop Quiz"</h2>
                        </div>
                        <p className="pl-11 opacity-70 max-w-3xl">
                             Use <code>prediction_prompt</code> to lock the editor and blur the output. 
                             This pedagogical pattern forces students to trace code mentally before executing it.
                        </p>
                    </div>
                    <div className="h-[400px] border rounded-xl overflow-hidden shadow-2xl dark:border-white/10">
                        <CodeShoebox 
                            code={quizCode}
                            onCodeChange={() => {}} // Read only
                            environmentMode="dom"
                            theme={themes[0]}
                            themeMode="dark"
                            prediction_prompt="What will be logged to the console?"
                        />
                    </div>
                </section>

                {/* Example 2 */}
                <section>
                    <div className="mb-6">
                         <div className="flex items-center gap-3 mb-2">
                             <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 font-bold text-sm">2</span>
                             <h2 className="text-2xl font-semibold">Custom Branding</h2>
                        </div>
                        <p className="pl-11 opacity-70 max-w-3xl">
                            Complete visual control using HSL color variables in the <code>theme</code> prop.
                        </p>
                    </div>
                    <div className="h-[500px] border rounded-xl overflow-hidden shadow-2xl dark:border-green-500/30">
                        <CodeShoebox 
                            code={matrixState.code || matrixCode}
                            onCodeChange={matrixState.setCode}
                            environmentMode="dom"
                            theme={matrixTheme}
                            themeMode="dark"
                        />
                    </div>
                </section>
                
                <footer className="pt-12 pb-6 text-center opacity-40 text-sm">
                    Built for the CodeShoebox Library
                </footer>
            </div>
        </div>
    );
}