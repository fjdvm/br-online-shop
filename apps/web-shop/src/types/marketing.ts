export interface ActiveContent {
  campaignId: string;
  channel: "Banner" | "Popup";
  html: string;
  dismissible: boolean;
}
