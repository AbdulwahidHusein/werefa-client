import { StatusScreen } from "@/components/StatusScreen";

export default function NotFound() {
  return (
    <StatusScreen
      variant="notFound"
      title="Page not found"
      message="This link doesn't exist or the page was moved. Head back to discover businesses near you."
      primaryAction={{ label: "Go to Discover", href: "/" }}
      secondaryAction={{ label: "Log in", href: "/login" }}
    />
  );
}
