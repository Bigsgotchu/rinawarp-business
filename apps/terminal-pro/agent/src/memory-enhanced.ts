/**
 * Enhanced Memory Store - MVR-2: Memory Moment implementation
 * Adds "Rina remembers this project" toast once per session
 */

import { kvGet, kvSet } from "./memory/store.js";

let memoryToastShown = false;

export function rememberProject(cwd: string, lastCommand: string): void {
  // Store project memory
  const projectKey = `project:${cwd}`;
  const projectData = {
    cwd,
    lastCommand,
    timestamp: Date.now(),
  };
  
  kvSet(projectKey, JSON.stringify(projectData));
  
  // Show toast only once per session
  if (!memoryToastShown) {
    showMemoryToast();
    memoryToastShown = true;
    
    // Update session state
    if (typeof window !== 'undefined' && (window as any).sessionState) {
      (window as any).sessionState.memoryWrites++;
    }
  }
}

function showMemoryToast(): void {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'memory-toast';
  toast.textContent = 'Rina remembers this project';
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #2563eb;
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    z-index: 10000;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

export function resetMemorySession(): void {
  memoryToastShown = false;
}
