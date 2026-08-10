/**
 * Model providers page — connect/disconnect provider logins.
 */

import { getAppStorage } from "../../../storage/local/app-storage.js";

import { t } from "../../../language/index.js";
import { normalizeOpenRouterPresetSlug, OPENROUTER_PRESET_SETTING } from "../../../models/openrouter.js";
import { VISIBLE_PROVIDERS, buildProviderRow } from "../../../ui/provider-login.js";
import type { SettingsShellPage } from "../../../ui/settings-shell.js";
import { showToast } from "../../../ui/toast.js";

export function createProvidersPage(): SettingsShellPage {
  return {
    id: "providers",
    parentId: "root",
    title: () => t("settings.page.providers"),
    subtitle: () => t("settings.section.providers.hint"),
    render: async (ctx) => {
      const providerList = document.createElement("div");
      providerList.className = "pi-welcome-providers pi-provider-picker-list pi-settings-provider-list";

      const storage = getAppStorage();

      const openRouterSettings = document.createElement("section");
      openRouterSettings.className = "pi-settings-openrouter";

      const presetLabel = document.createElement("label");
      presetLabel.className = "pi-settings-openrouter__label";
      presetLabel.textContent = t("provider.openrouter.preset.label");

      const presetHint = document.createElement("p");
      presetHint.className = "pi-settings-openrouter__hint";
      presetHint.textContent = t("provider.openrouter.preset.hint");

      const presetInput = document.createElement("input");
      presetInput.className = "pi-overlay-input pi-settings-openrouter__input";
      presetInput.type = "text";
      presetInput.placeholder = t("provider.openrouter.preset.placeholder");
      presetInput.autocomplete = "off";
      presetInput.spellcheck = false;
      presetInput.setAttribute("aria-label", t("provider.openrouter.preset.label"));

      try {
        presetInput.value = normalizeOpenRouterPresetSlug(
          await storage.settings.get<string>(OPENROUTER_PRESET_SETTING),
        ) ?? "";
      } catch {
        // Leave the optional setting empty when persistence is unavailable.
      }

      presetInput.addEventListener("change", () => {
        void storage.settings.set(
          OPENROUTER_PRESET_SETTING,
          normalizeOpenRouterPresetSlug(presetInput.value) ?? "",
        );
      });
      openRouterSettings.append(presetLabel, presetInput, presetHint);
      ctx.body.appendChild(openRouterSettings);

      let configuredSet = new Set<string>();
      try {
        const configuredKeys = await storage.providerKeys.list();
        configuredSet = new Set(configuredKeys);
      } catch {
        const warning = document.createElement("p");
        warning.className = "pi-overlay-hint pi-overlay-text-warning";
        warning.textContent = t("settings.warning.provider_state");
        ctx.body.appendChild(warning);
      }

      const expandedRef: { current: HTMLElement | null } = { current: null };

      for (const provider of VISIBLE_PROVIDERS) {
        const row = buildProviderRow(provider, {
          isActive: configuredSet.has(provider.id),
          expandedRef,
          onConnected: (_row: HTMLElement, _id: string, label: string) => {
            document.dispatchEvent(new CustomEvent("pi:providers-changed"));
            showToast(t("settings.toast.connected", { label }));
          },
          onDisconnected: (_row: HTMLElement, _id: string, label: string) => {
            document.dispatchEvent(new CustomEvent("pi:providers-changed"));
            showToast(t("settings.toast.disconnected", { label }));
          },
        });

        providerList.appendChild(row);
      }

      ctx.body.appendChild(providerList);
    },
  };
}
