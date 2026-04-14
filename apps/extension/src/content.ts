const selectorCandidates = [
  "article",
  "main",
  "[data-test-id='job-details']",
  "[data-testid='job-details']",
  ".jobs-description",
  ".description",
  ".jobsearch-JobComponent-description",
  "#job-details",
  "[class*='description']"
];

const getVisibleText = (element: Element | null) => {
  if (!element) {
    return "";
  }

  return element.textContent?.replace(/\s+/g, " ").trim() ?? "";
};

const getFallbackText = () => {
  const blocks = Array.from(document.querySelectorAll("p, li, h1, h2, h3"));
  return blocks
    .map((node) => getVisibleText(node))
    .filter((text) => text.length > 30)
    .slice(0, 80)
    .join("\n");
};

const extractJobPayload = () => {
  const description =
    selectorCandidates.map((selector) => getVisibleText(document.querySelector(selector))).find((text) => text.length > 500) ??
    getFallbackText();

  const title =
    getVisibleText(document.querySelector("h1")) ||
    getVisibleText(document.querySelector("[data-test-id='job-title']")) ||
    document.title;

  const company =
    getVisibleText(document.querySelector("[data-test-id='company-name']")) ||
    getVisibleText(document.querySelector("[class*='company']")) ||
    "Unknown company";

  return {
    title,
    company,
    sourceUrl: window.location.href,
    description
  };
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "EXTRACT_JOB_DESCRIPTION") {
    sendResponse(extractJobPayload());
  }
});
