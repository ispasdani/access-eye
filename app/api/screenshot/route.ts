import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import { _electron as electron } from 'playwright-core';

export const runtime = 'nodejs';

async function findChromePath() {
  const defaultPaths = {
    win32: [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    ],
    darwin: [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    ],
    linux: [
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/usr/bin/microsoft-edge',
      '/snap/bin/chromium',
    ],
  };

  const paths = defaultPaths[process.platform as keyof typeof defaultPaths] || defaultPaths.linux;

  for (const path of paths) {
    try {
      const browserFetcher = electron;
      await browserFetcher.launch({ executablePath: path });
      return path;
    } catch (e) {
      continue;
    }
  }

  throw new Error('No compatible browser found. Please install Chrome, Chromium, or Edge.');
}

async function captureWithPuppeteer(url: string) {
  const chromePath = await findChromePath();
  
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
    headless: 'new'
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1200, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigate with timeout and wait for network idle
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // Wait for any lazy-loaded content
    await page.evaluate(() => new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if(totalHeight >= scrollHeight){
          clearInterval(timer);
          resolve(true);
        }
      }, 100);
    }));

    // Take screenshot
    const screenshot = await page.screenshot({ 
      type: 'jpeg',
      quality: 80,
      fullPage: false
    });

    return Buffer.from(screenshot).toString('base64');
  } finally {
    await browser.close();
  }
}

async function captureWithAPIFlash(url: string) {
  const params = new URLSearchParams({
    access_key: process.env.APIFLASH_KEY || 'demo',
    url: url,
    format: 'jpeg',
    quality: '80',
    width: '1200',
    height: '800',
    fresh: 'true',
    response_type: 'json'
  });

  const apiUrl = `https://api.apiflash.com/v1/urltoimage?${params.toString()}`;
  
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to capture screenshot with APIFlash');
    }

    const imageResponse = await fetch(data.url);
    if (!imageResponse.ok) {
      throw new Error('Failed to download screenshot from APIFlash');
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    return Buffer.from(imageBuffer).toString('base64');
  } catch (error) {
    console.error('APIFlash error:', error);
    throw new Error('Failed to capture screenshot with APIFlash');
  }
}

export async function POST(req: Request) {
  try {
    const { url, service } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return NextResponse.json({ error: 'Invalid URL. Must start with http:// or https://' }, { status: 400 });
    }

    let base64Image;
    try {
      if (service === 'puppeteer') {
        base64Image = await captureWithPuppeteer(url);
      } else {
        base64Image = await captureWithAPIFlash(url);
      }
    } catch (error) {
      console.error(`Screenshot error with ${service}:`, error);
      return NextResponse.json(
        { error: `Failed to capture screenshot with ${service}. ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      image: `data:image/jpeg;base64,${base64Image}` 
    });
  } catch (error) {
    console.error('Screenshot error:', error);
    return NextResponse.json(
      { error: 'Failed to capture screenshot' },
      { status: 500 }
    );
  }
}