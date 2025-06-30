import { test, expect, type Page } from '@playwright/test';
import {
  navigateToApp,
  getMemoryUsage,
  forceGarbageCollection,
  calculateMemoryIncrease,
  enterWordViaKeyboard,
  clearWordViaKeyboard,
  enterWordViaButtons,
  clearWord,
  submitWord,
  rapidButtonClicking,
  getDOMNodeCount,
  simulateReload,
  type MemoryInfo
} from './utils/test-helpers';

test.describe('Memory Leak Tests for Wordle App', () => {
  let baselineMemory: number;

  test.beforeEach(async ({ page }) => {
    await navigateToApp(page);

    // Get baseline memory usage
    const performanceInfo = await getMemoryUsage(page);
    baselineMemory = performanceInfo?.usedJSHeapSize || 0;
    console.log('Baseline memory usage:', baselineMemory);
  });

  test('Memory usage during rapid keyboard interactions', async ({ page }) => {
    const initialMemory = await getMemoryUsage(page);
    console.log('Initial memory:', initialMemory?.usedJSHeapSize);

    // Simulate rapid keyboard typing (potential event listener leaks)
    for (let i = 0; i < 100; i++) {
      await page.keyboard.press('a');
      await page.keyboard.press('Backspace');

      if (i % 20 === 0) {
        await page.waitForTimeout(10);
      }
    }

    await forceGarbageCollection(page);
    const afterTypingMemory = await getMemoryUsage(page);
    console.log('Memory after typing:', afterTypingMemory?.usedJSHeapSize);

    // Check for significant memory increase
    if (initialMemory && afterTypingMemory) {
      const { increase, percentage } = calculateMemoryIncrease(initialMemory, afterTypingMemory);

      console.log(`Memory increase: ${increase} bytes (${percentage.toFixed(2)}%)`);

      // Alert if memory increased by more than 50%
      if (percentage > 50) {
        console.warn('⚠️  Potential memory leak detected: Memory increased by', percentage.toFixed(2), '%');
      }
    }
  });

  test('Memory usage during repeated word submissions', async ({ page }) => {
    const initialMemory = await getMemoryUsage(page);
    console.log('Initial memory:', initialMemory?.usedJSHeapSize);

    // Simulate repeated word submissions
    for (let round = 0; round < 20; round++) {
      // Type a word using shared utility
      await enterWordViaKeyboard(page, 'hello');

      // Submit word using shared utility
      await submitWord(page);
      await page.waitForTimeout(100);

      // Clear word using shared utility
      await clearWordViaKeyboard(page);

      if (round % 5 === 0) {
        await forceGarbageCollection(page);
        const currentMemory = await getMemoryUsage(page);
        console.log(`Round ${round} memory:`, currentMemory?.usedJSHeapSize);
      }
    }

    await forceGarbageCollection(page);
    const finalMemory = await getMemoryUsage(page);
    console.log('Final memory:', finalMemory?.usedJSHeapSize);

    if (initialMemory && finalMemory) {
      const { increase, percentage } = calculateMemoryIncrease(initialMemory, finalMemory);

      console.log(`Memory increase: ${increase} bytes (${percentage.toFixed(2)}%)`);

      if (percentage > 30) {
        console.warn('⚠️  Potential memory leak detected in word submissions: Memory increased by', percentage.toFixed(2), '%');
      }
    }
  });

  test('Memory usage during mouse click interactions', async ({ page }) => {
    const initialMemory = await getMemoryUsage(page);
    console.log('Initial memory:', initialMemory?.usedJSHeapSize);

    // Rapid clicking on keyboard buttons using shared utility
    const buttons = ['Q', 'W', 'R', 'T', 'Y', 'Enter', 'Delete'];

    await rapidButtonClicking(page, buttons, 50);

    await forceGarbageCollection(page);
    const finalMemory = await getMemoryUsage(page);
    console.log('Final memory after clicks:', finalMemory?.usedJSHeapSize);

    if (initialMemory && finalMemory) {
      const { increase, percentage } = calculateMemoryIncrease(initialMemory, finalMemory);

      console.log(`Memory increase: ${increase} bytes (${percentage.toFixed(2)}%)`);

      if (percentage > 40) {
        console.warn('⚠️  Potential memory leak detected in click handlers: Memory increased by', percentage.toFixed(2), '%');
      }
    }
  });

  test('Check for DOM node leaks', async ({ page }) => {
    const initialNodes = await getDOMNodeCount(page);
    console.log('Initial DOM nodes:', initialNodes);

    // Perform interactions that might create DOM nodes
    for (let i = 0; i < 20; i++) {
      // Type and delete words using shared utilities
      await enterWordViaKeyboard(page, 'abcde');
      await submitWord(page);
      await page.waitForTimeout(50);
      await clearWordViaKeyboard(page);
    }

    await page.waitForTimeout(1000);
    const finalNodes = await getDOMNodeCount(page);
    console.log('Final DOM nodes:', finalNodes);

    const nodeIncrease = finalNodes - initialNodes;
    console.log(`DOM node increase: ${nodeIncrease}`);

    if (nodeIncrease > 50) {
      console.warn('⚠️  Potential DOM node leak detected: Added', nodeIncrease, 'nodes');
    }
  });

  test('Event listener leak detection', async ({ page }) => {
    // Check for event listeners being properly cleaned up
    const initialListeners = await page.evaluate(() => {
      const proto = EventTarget.prototype;
      let addCount = 0;
      let removeCount = 0;

      const originalAdd = proto.addEventListener;
      const originalRemove = proto.removeEventListener;

      proto.addEventListener = function (...args) {
        addCount++;
        return originalAdd.apply(this, args);
      };

      proto.removeEventListener = function (...args) {
        removeCount++;
        return originalRemove.apply(this, args);
      };

      return { addCount, removeCount };
    });

    // Perform actions that should add and remove event listeners
    for (let i = 0; i < 10; i++) {
      // Navigate away and back using shared utility
      await simulateReload(page);

      // Interact with the app
      await page.keyboard.press('a');
      await page.keyboard.press('Backspace');
    }

    const finalListeners = await page.evaluate(() => {
      return {
        addCount: (window as any).addCount || 0,
        removeCount: (window as any).removeCount || 0
      };
    });

    console.log('Event listeners - Added:', finalListeners.addCount, 'Removed:', finalListeners.removeCount);

    // Check if listeners are being properly removed
    const listenerDiff = finalListeners.addCount - finalListeners.removeCount;
    if (listenerDiff > 20) {
      console.warn('⚠️  Potential event listener leak detected:', listenerDiff, 'listeners not removed');
    }
  });

  test('Zustand store memory leak check', async ({ page }) => {
    const initialMemory = await getMemoryUsage(page);

    // Stress test the Zustand store
    await page.evaluate(() => {
      // Access the store multiple times
      for (let i = 0; i < 100; i++) {
        // Simulate store state changes
        const event = new KeyboardEvent('keydown', { key: 'a' });
        document.dispatchEvent(event);

        const deleteEvent = new KeyboardEvent('keydown', { key: 'Backspace' });
        document.dispatchEvent(deleteEvent);
      }
    });

    await forceGarbageCollection(page);
    const finalMemory = await getMemoryUsage(page);

    if (initialMemory && finalMemory) {
      const { increase, percentage } = calculateMemoryIncrease(initialMemory, finalMemory);

      console.log(`Store stress test - Memory increase: ${increase} bytes (${percentage.toFixed(2)}%)`);

      if (percentage > 25) {
        console.warn('⚠️  Potential Zustand store memory leak detected: Memory increased by', percentage.toFixed(2), '%');
      }
    }
  });

  test('Overall memory stability test', async ({ page }) => {
    const memoryReadings = [];

    // Take initial reading
    let currentMemory = await getMemoryUsage(page);
    if (currentMemory) {
      memoryReadings.push(currentMemory.usedJSHeapSize);
    }

    // Simulate normal app usage
    for (let round = 0; round < 5; round++) {
      // Play a few rounds of the game using shared utilities
      for (let game = 0; game < 3; game++) {
        await enterWordViaKeyboard(page, 'hello');
        await submitWord(page);
        await page.waitForTimeout(100);
        await clearWordViaKeyboard(page);
      }

      await forceGarbageCollection(page);
      currentMemory = await getMemoryUsage(page);
      if (currentMemory) {
        memoryReadings.push(currentMemory.usedJSHeapSize);
        console.log(`Round ${round + 1} memory:`, currentMemory.usedJSHeapSize);
      }
    }

    // Analyze memory trend
    if (memoryReadings.length >= 3) {
      const firstReading = {
        usedJSHeapSize: memoryReadings[0],
        jsHeapSizeLimit: 0,
        totalJSHeapSize: 0
      };
      const lastReading = {
        usedJSHeapSize: memoryReadings[memoryReadings.length - 1],
        jsHeapSizeLimit: 0,
        totalJSHeapSize: 0
      };
      const { increase, percentage } = calculateMemoryIncrease(firstReading, lastReading);

      console.log('Memory stability analysis:');
      console.log('- Initial:', firstReading.usedJSHeapSize);
      console.log('- Final:', lastReading.usedJSHeapSize);
      console.log('- Increase:', increase, 'bytes');
      console.log('- Percentage:', percentage.toFixed(2), '%');

      // Check for consistent memory growth
      let consistentGrowth = true;
      for (let i = 1; i < memoryReadings.length; i++) {
        if (memoryReadings[i] < memoryReadings[i - 1] * 0.95) { // Allow for some fluctuation
          consistentGrowth = false;
          break;
        }
      }

      if (consistentGrowth && percentage > 20) {
        console.warn('⚠️  Memory appears to be growing consistently - potential leak detected');
      } else if (percentage < 5) {
        console.log('✅ Memory usage appears stable');
      }
    }
  });
}); 