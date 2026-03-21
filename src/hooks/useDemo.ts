import { useSearchParams } from "react-router-dom";

export function useIsDemo(): boolean {
  const [searchParams] = useSearchParams();
  return searchParams.get("demo") === "true";
}
