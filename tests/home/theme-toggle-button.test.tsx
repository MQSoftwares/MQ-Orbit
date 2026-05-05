import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggleButton } from "@/components/theme-toggle-button";

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggleButton />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove("dark");
  document.documentElement.removeAttribute("data-theme");
});

describe("ThemeToggleButton", () => {
  it("starts in dark when the page loads with dark theme active", () => {
    window.localStorage.setItem("mqorbit-theme", "light");
    document.documentElement.classList.add("dark");
    document.documentElement.dataset.theme = "dark";

    const { container } = renderToggle();

    expect(screen.getByRole("button", { name: "Ativar tema claro" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "/svgs/sidebar/theme/toggle/dark-mode-toggle.svg",
    );
  });

  it("starts in light when the page loads with light theme active", () => {
    window.localStorage.setItem("mqorbit-theme", "dark");
    document.documentElement.classList.remove("dark");
    document.documentElement.dataset.theme = "light";

    const { container } = renderToggle();

    expect(screen.getByRole("button", { name: "Ativar tema escuro" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "/svgs/sidebar/theme/toggle/light-mode-toggle.svg",
    );
  });

  it("toggles the theme and updates the persisted value", async () => {
    document.documentElement.classList.remove("dark");
    document.documentElement.dataset.theme = "light";

    renderToggle();

    fireEvent.click(screen.getByRole("button", { name: "Ativar tema escuro" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Ativar tema claro" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(document.documentElement.dataset.theme).toBe("dark");
      expect(window.localStorage.getItem("mqorbit-theme")).toBe("dark");
    });
  });

  it("restores the persisted theme when the document theme is not present", () => {
    window.localStorage.setItem("mqorbit-theme", "dark");

    const { container } = renderToggle();

    expect(screen.getByRole("button", { name: "Ativar tema claro" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "/svgs/sidebar/theme/toggle/dark-mode-toggle.svg",
    );
  });
});
