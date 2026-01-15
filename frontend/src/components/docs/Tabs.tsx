'use client';

import { useState, useEffect, createContext, useContext, Children, isValidElement, type ReactNode, type ReactElement } from 'react';
import { cn } from '@/lib/utils';

// Context for syncing tabs across the page
interface TabSyncContextType {
  values: Record<string, string>;
  setValue: (group: string, value: string) => void;
}

const TabSyncContext = createContext<TabSyncContextType | null>(null);

export function TabSyncProvider({ children }: { children: ReactNode }) {
  const [values, setValues] = useState<Record<string, string>>({});

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedValues: Record<string, string> = {};
    const groups = ['package-manager', 'language', 'framework'];
    
    groups.forEach(group => {
      const saved = localStorage.getItem(`docs-tab-${group}`);
      if (saved) {
        savedValues[group] = saved;
      }
    });
    
    if (Object.keys(savedValues).length > 0) {
      setValues(savedValues);
    }
  }, []);

  const setValue = (group: string, value: string) => {
    setValues(prev => ({ ...prev, [group]: value }));
    localStorage.setItem(`docs-tab-${group}`, value);
  };

  return (
    <TabSyncContext.Provider value={{ values, setValue }}>
      {children}
    </TabSyncContext.Provider>
  );
}

function useTabSync() {
  return useContext(TabSyncContext);
}

// Tabs component
interface TabsProps {
  items: string[];
  children: ReactNode;
  defaultValue?: string;
  className?: string | undefined;
  syncGroup?: 'package-manager' | 'language' | 'framework' | string;
}

interface TabProps {
  value?: string;
  children: ReactNode;
}

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}

export function Tabs({ items, children, defaultValue, className, syncGroup }: TabsProps) {
  const tabSync = useTabSync();
  const [activeTab, setActiveTab] = useState<string>(defaultValue ?? items[0] ?? '');
  
  // Sync with global tab state if syncGroup is provided
  useEffect(() => {
    if (syncGroup && tabSync?.values[syncGroup]) {
      const syncedValue = tabSync.values[syncGroup];
      if (items.includes(syncedValue)) {
        setActiveTab(syncedValue);
      }
    }
  }, [syncGroup, tabSync?.values, items]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (syncGroup && tabSync) {
      tabSync.setValue(syncGroup, value);
    }
  };

  // Get tab content based on active tab
  const getActiveContent = () => {
    const childArray = Children.toArray(children);
    const activeIndex = items.indexOf(activeTab);
    
    if (activeIndex >= 0 && activeIndex < childArray.length) {
      return childArray[activeIndex];
    }
    
    // Fallback: look for Tab component with matching value
    for (const child of childArray) {
      if (isValidElement(child)) {
        const element = child as ReactElement<TabProps>;
        if (element.props.value === activeTab) {
          return element.props.children;
        }
      }
    }
    
    return childArray[0];
  };

  return (
    <div className={cn('my-6', className)}>
      {/* Tab buttons */}
      <div className="flex overflow-x-auto border-b border-zinc-800">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => handleTabChange(item)}
            className={cn(
              'relative px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
              'hover:text-zinc-200',
              activeTab === item
                ? 'text-indigo-400'
                : 'text-zinc-500'
            )}
          >
            {item}
            {activeTab === item && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
            )}
          </button>
        ))}
      </div>
      
      {/* Tab content */}
      <div className="mt-0">
        {getActiveContent()}
      </div>
    </div>
  );
}

// Package manager tabs preset
interface PackageManagerTabsProps {
  npm: ReactNode;
  yarn?: ReactNode;
  pnpm?: ReactNode;
  bun?: ReactNode;
  className?: string;
}

export function PackageManagerTabs({ npm, yarn, pnpm, bun, className }: PackageManagerTabsProps) {
  const items: string[] = ['npm'];
  const children: ReactNode[] = [npm];
  
  if (yarn) {
    items.push('yarn');
    children.push(yarn);
  }
  if (pnpm) {
    items.push('pnpm');
    children.push(pnpm);
  }
  if (bun) {
    items.push('bun');
    children.push(bun);
  }

  return (
    <Tabs items={items} syncGroup="package-manager" className={className}>
      {children}
    </Tabs>
  );
}

// Framework tabs preset
interface FrameworkTabsProps {
  react?: ReactNode;
  vue?: ReactNode;
  vanilla?: ReactNode;
  nextjs?: ReactNode;
  className?: string;
}

export function FrameworkTabs({ react, vue, vanilla, nextjs, className }: FrameworkTabsProps) {
  const items: string[] = [];
  const children: ReactNode[] = [];
  
  if (react) {
    items.push('React');
    children.push(react);
  }
  if (nextjs) {
    items.push('Next.js');
    children.push(nextjs);
  }
  if (vue) {
    items.push('Vue');
    children.push(vue);
  }
  if (vanilla) {
    items.push('Vanilla JS');
    children.push(vanilla);
  }

  return (
    <Tabs items={items} syncGroup="framework" className={className}>
      {children}
    </Tabs>
  );
}
