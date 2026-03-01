import { Job, CreateJobPayload, SubmitAppPayload } from './types';

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL || '';

export async function fetchJobs(): Promise<Job[]> {
  if (!GAS_URL) {
    console.error('Missing NEXT_PUBLIC_GAS_URL environment variable');
    return [];
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${GAS_URL}?action=GET_JOBS`, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Request to GAS timed out after 15 seconds.');
    } else {
      console.error('Error fetching jobs:', error);
    }
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Submits data to GAS via a hidden form and iframe.
 * This completely bypasses CORS issues when GAS redirects a POST request.
 */
export function submitToGAS(payload: CreateJobPayload | SubmitAppPayload): Promise<boolean> {
  return new Promise((resolve) => {
    if (!GAS_URL) {
      console.error('Missing NEXT_PUBLIC_GAS_URL environment variable');
      resolve(false);
      return;
    }

    const iframeName = `gas_iframe_${Date.now()}`;
    const iframe = document.createElement('iframe');
    iframe.name = iframeName;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = GAS_URL;
    form.target = iframeName;
    form.style.display = 'none';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'data';
    input.value = JSON.stringify(payload);

    form.appendChild(input);
    document.body.appendChild(form);

    let isResolved = false;

    // Timeout safety net (15 seconds)
    const timeoutId = setTimeout(() => {
      if (!isResolved) {
        console.error('Form submission to GAS timed out after 15 seconds.');
        cleanup();
        resolve(false);
      }
    }, 15000);

    const cleanup = () => {
      isResolved = true;
      clearTimeout(timeoutId);
      setTimeout(() => {
        if (form.parentNode) form.parentNode.removeChild(form);
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 100); // Small delay to allow browser to finish processing
    };

    iframe.onload = () => {
      // It's opaque because of cross-origin, but the load event firing
      // generally means the redirect chain finished successfully.
      cleanup();
      resolve(true); // Assume success on load
    };

    form.submit();
  });
}
