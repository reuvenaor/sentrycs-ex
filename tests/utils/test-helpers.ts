import { type Page, expect } from '@playwright/test';

// ==========================================
// NAVIGATION & SETUP UTILITIES
// ==========================================

export async function navigateToApp(page: Page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

// ==========================================
// MEMORY MONITORING UTILITIES 
// ==========================================

export interface MemoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

export async function getMemoryUsage(page: Page): Promise<MemoryInfo | null> {
  return await page.evaluate(() => {
    if ((performance as any).memory) {
      return {
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize
      };
    }
    return null;
  });
}

export async function forceGarbageCollection(page: Page) {
  // Force garbage collection if available
  await page.evaluate(() => {
    if ((window as any).gc) {
      (window as any).gc();
    }
  });

  // Wait for potential cleanup
  await page.waitForTimeout(1000);
}

export function calculateMemoryIncrease(initial: MemoryInfo, final: MemoryInfo) {
  const increase = final.usedJSHeapSize - initial.usedJSHeapSize;
  const percentage = (increase / initial.usedJSHeapSize) * 100;
  return { increase, percentage };
}

// ==========================================
// WORD INPUT UTILITIES
// ==========================================

export async function enterWordViaButtons(page: Page, word: string) {
  for (const letter of word.toUpperCase()) {
    await page.getByRole('button', { name: letter, exact: true }).click();
    await page.waitForTimeout(50); // Small delay for stability
  }
}

export async function enterWordViaKeyboard(page: Page, word: string) {
  for (const letter of word.toLowerCase()) {
    await page.keyboard.press(letter);
    await page.waitForTimeout(100); // Slightly longer delay for keyboard input
  }
}

export async function clearWord(page: Page, letterCount: number = 5) {
  for (let i = 0; i < letterCount; i++) {
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await page.waitForTimeout(50);
  }
}

export async function clearWordViaKeyboard(page: Page, letterCount: number = 5) {
  for (let i = 0; i < letterCount; i++) {
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(50);
  }
}

export async function submitWord(page: Page) {
  await page.getByRole('button', { name: 'Enter', exact: true }).click();
}

export async function submitWordViaKeyboard(page: Page) {
  await page.keyboard.press('Enter');
}

// ==========================================
// BUTTON INTERACTION UTILITIES
// ==========================================

export async function clickButton(page: Page, buttonName: string) {
  await page.getByRole('button', { name: buttonName, exact: true }).click();
}



// ==========================================
// ASSERTION UTILITIES
// ==========================================

export function getWordSquares(page: Page) {
  return page.locator('[class*="border-4"][class*="rounded-md"]');
}

export async function verifyWordInSquares(page: Page, word: string) {
  const squares = getWordSquares(page);
  const letters = word.toUpperCase().split('');

  for (let i = 0; i < letters.length; i++) {
    await expect(squares.nth(i)).toHaveText(letters[i]);
  }
}

export async function verifySquareEmpty(page: Page, index: number) {
  const squares = getWordSquares(page);
  await expect(squares.nth(index)).toHaveText('');
}

export async function verifyUIElements(page: Page) {
  // Verify main heading
  await expect(page.getByRole('heading', { name: 'WORDLE', exact: true })).toBeVisible();

  // Verify instructions
  await expect(page.getByText('Guess the 5-letter word')).toBeVisible();
  await expect(page.getByText('Use your keyboard or click the buttons above')).toBeVisible();

  // Verify key keyboard buttons
  await expect(page.getByRole('button', { name: 'Q', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enter', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Delete', exact: true })).toBeVisible();
}

export async function verifyErrorMessage(page: Page, shouldBeVisible: boolean = true) {
  const errorMessage = page.getByText('Word not found in dictionary');
  if (shouldBeVisible) {
    await expect(errorMessage).toBeVisible();
  } else {
    await expect(errorMessage).not.toBeVisible();
  }
}

// ==========================================
// API & NETWORK UTILITIES
// ==========================================

export async function waitForDictionaryAPI(page: Page, word: string, timeout: number = 10000) {
  try {
    await page.waitForResponse(response =>
      response.url().includes('api.dictionaryapi.dev') &&
      response.url().includes(word.toLowerCase()),
      { timeout }
    );
  } catch (error) {
    console.log(`API call timeout for word "${word}", but test can continue`);
  }
}

// ==========================================
// STRESS TESTING UTILITIES
// ==========================================

export async function stressTestKeyboardInput(page: Page, iterations: number = 10) {
  for (let i = 0; i < iterations; i++) {
    await enterWordViaButtons(page, 'HELLO');
    await clearWord(page);

    if (i % 5 === 0) {
      await page.waitForTimeout(100); // Periodic pause
    }
  }
}

export async function stressTestWordSubmissions(page: Page, word: string, iterations: number = 10) {
  for (let i = 0; i < iterations; i++) {
    await enterWordViaButtons(page, word);
    await submitWord(page);
    await page.waitForTimeout(100);
    await clearWord(page);

    if (i % 3 === 0) {
      await page.waitForTimeout(200); // Periodic pause
    }
  }
}

// ==========================================
// PERFORMANCE TEST UTILITIES
// ==========================================



export async function rapidButtonClicking(page: Page, buttons: string[], iterations: number = 50) {
  for (let i = 0; i < iterations; i++) {
    for (const buttonName of buttons) {
      await clickButton(page, buttonName);
      await page.waitForTimeout(10);
    }

    if (i % 10 === 0) {
      await page.waitForTimeout(50); // Periodic pause
    }
  }
}

// ==========================================
// DOM UTILITIES
// ==========================================

export async function getDOMNodeCount(page: Page): Promise<number> {
  return await page.evaluate(() => document.querySelectorAll('*').length);
}

export async function simulateReload(page: Page) {
  await page.reload();
  await page.waitForLoadState('networkidle');
}

// ==========================================
// BROWSER-SPECIFIC UTILITIES
// ==========================================

export function skipTestForBrowser(testContext: any, browserName: string, reason: string) {
  testContext.skip(testContext.browserName === browserName, reason);
}

// ==========================================
// COMMON TEST PATTERNS
// ==========================================

export async function playCompleteWordGame(page: Page, word: string) {
  await clearWordViaKeyboard(page); // Clear any existing input
  await enterWordViaButtons(page, word);
  await submitWord(page);
  await waitForDictionaryAPI(page, word);
}

export async function testWordInputAndClear(page: Page, word: string) {
  await enterWordViaButtons(page, word);
  await verifyWordInSquares(page, word);
  await clearWord(page);

  // Verify all squares are empty
  for (let i = 0; i < word.length; i++) {
    await verifySquareEmpty(page, i);
  }
} 