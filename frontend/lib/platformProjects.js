import { serverFetch } from "./serverApi";

export async function getProjectPageUrl() {
  try {
    const data = await serverFetch("/platform-projects", { revalidate: 60 });
    return typeof data?.projectPageUrl === "string" ? data.projectPageUrl : "";
  } catch {
    return "";
  }
}
