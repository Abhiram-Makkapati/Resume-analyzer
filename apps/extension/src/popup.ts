import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User
} from "firebase/auth";
import { extensionAuth, getFunctionBaseUrl } from "./lib/firebase";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Popup root not found.");
}

const state = {
  user: null as User | null,
  title: "",
  company: "",
  sourceUrl: "",
  description: "",
  status: "",
  error: ""
};

const fetchCurrentTabPayload = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id) {
    throw new Error("No active tab found.");
  }

  const payload = await chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_JOB_DESCRIPTION" });
  state.title = payload.title ?? "";
  state.company = payload.company ?? "";
  state.sourceUrl = payload.sourceUrl ?? "";
  state.description = payload.description ?? "";
};

const render = () => {
  app.innerHTML = "";

  if (!state.user) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <label class="label">Sign in with your email</label>
      <input id="email" type="email" placeholder="Email address" />
      <div style="height: 10px"></div>
      <input id="password" type="password" placeholder="Password" />
      <div style="height: 12px"></div>
      <button class="primary" id="login">Continue</button>
      ${state.error ? `<p class="error">${state.error}</p>` : ""}
    `;
    app.appendChild(card);

    card.querySelector<HTMLButtonElement>("#login")?.addEventListener("click", async () => {
      const email = card.querySelector<HTMLInputElement>("#email")?.value ?? "";
      const password = card.querySelector<HTMLInputElement>("#password")?.value ?? "";

      try {
        state.error = "";
        await signInWithEmailAndPassword(extensionAuth, email, password);
      } catch (error) {
        state.error = error instanceof Error ? error.message : "Unable to sign in.";
        render();
      }
    });

    return;
  }

  const userBanner = document.createElement("div");
  userBanner.className = "banner";
  userBanner.innerHTML = `
    <div>
      <strong>${state.user.email ?? "Signed in"}</strong>
      <p class="muted">Ready to import this role</p>
    </div>
    <button class="secondary" id="logout">Sign out</button>
  `;
  app.appendChild(userBanner);

  const statusBanner = state.status
    ? `<p class="${state.error ? "error" : "success"}">${state.status}</p>`
    : "";

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <div class="pill-row">
      <span class="pill">Live job page</span>
      <span class="pill">${state.company || "Company"}</span>
    </div>
    <div style="height: 12px"></div>
    <label class="label">Job title</label>
    <input id="title" value="${state.title}" />
    <div style="height: 10px"></div>
    <label class="label">Company</label>
    <input id="company" value="${state.company}" />
    <div style="height: 10px"></div>
    <label class="label">Job description</label>
    <textarea id="description">${state.description}</textarea>
    <div style="height: 12px"></div>
    <button class="primary" id="import">Import to dashboard</button>
    <div style="height: 10px"></div>
    <button class="secondary" id="open-dashboard">Open web app</button>
    ${statusBanner}
  `;
  app.appendChild(card);

  app.querySelector<HTMLButtonElement>("#logout")?.addEventListener("click", async () => {
    await signOut(extensionAuth);
  });

  app.querySelector<HTMLButtonElement>("#open-dashboard")?.addEventListener("click", () => {
    chrome.runtime.sendMessage({
      type: "OPEN_DASHBOARD",
      url: process.env.EXT_WEB_APP_URL || "https://your-web-app-url.com/dashboard"
    });
  });

  app.querySelector<HTMLButtonElement>("#import")?.addEventListener("click", async () => {
    try {
      state.error = "";
      state.status = "Importing…";
      render();

      const title = app.querySelector<HTMLInputElement>("#title")?.value ?? state.title;
      const company = app.querySelector<HTMLInputElement>("#company")?.value ?? state.company;
      const description = app.querySelector<HTMLTextAreaElement>("#description")?.value ?? state.description;
      const token = await state.user?.getIdToken();

      const response = await fetch(`${getFunctionBaseUrl()}/importJobDescription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          company,
          sourceUrl: state.sourceUrl || window.location.href,
          description
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to import job description.");
      }

      state.status = "Imported successfully. Open the dashboard to run a scan.";
      state.error = "";
      render();
    } catch (error) {
      state.error = error instanceof Error ? error.message : "Import failed.";
      state.status = state.error;
      render();
    }
  });
};

onAuthStateChanged(extensionAuth, async (user) => {
  state.user = user;
  state.error = "";
  state.status = "";

  if (user) {
    try {
      await fetchCurrentTabPayload();
    } catch (error) {
      state.status = error instanceof Error ? error.message : "Unable to inspect this page.";
    }
  }

  render();
});
