import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ActiveBanner } from "@/components/features/home/ActiveBanner";
import { ActivePopup } from "@/components/features/home/ActivePopup";
import type { ActiveContent } from "@/types/marketing";

describe("ActiveBanner renders real formatted content, not raw JSON", () => {
  it("renders the pre-rendered HTML as real elements", () => {
    const content: ActiveContent = {
      campaignId: "c1",
      channel: "Banner",
      html: '<h2 style="font-size:20px;">Big <strong>Sale</strong> Event</h2><div><a href="https://shop.example.com">Shop Now</a></div>',
      dismissible: false,
    };

    render(<ActiveBanner content={content} />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Big Sale Event");
    expect(screen.getByText("Sale").tagName).toBe("STRONG");
    expect(screen.getByRole("link", { name: "Shop Now" })).toHaveAttribute(
      "href",
      "https://shop.example.com"
    );
  });
});

describe("ActivePopup renders real formatted content, not raw JSON", () => {
  it("renders the pre-rendered HTML as real elements", () => {
    const content: ActiveContent = {
      campaignId: "c2",
      channel: "Popup",
      html: '<div><h2>Special Announcement</h2><p>Everything is <em>on sale</em> this week only.</p><a href="https://shop.example.com">Shop Now</a></div>',
      dismissible: true,
    };

    render(<ActivePopup content={content} />);

    expect(screen.getByText("Special Announcement")).toBeInTheDocument();
    expect(screen.getByText("on sale").tagName).toBe("EM");
    expect(screen.getByRole("link", { name: "Shop Now" })).toHaveAttribute(
      "href",
      "https://shop.example.com"
    );
  });
});
