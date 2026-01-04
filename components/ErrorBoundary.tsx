import { AlertTriangle, RefreshCw } from "lucide-react-native";
import { FallbackProps, ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <View className="bg-background flex-1 items-center justify-center p-5">
      <AlertTriangle size={48} color="#ef4444" />
      <Text className="text-foreground mt-4 text-lg font-semibold">Something went wrong</Text>
      <Text className="text-muted-foreground mt-2 px-8 text-center text-sm">
        We have been notified and are working to fix this issue.
      </Text>
      {error && (
        <Text className="text-destructive mt-4 px-4 text-center text-xs">{error.message}</Text>
      )}
      <Pressable
        className="bg-primary mt-6 flex-row items-center rounded-lg px-6 py-3"
        onPress={resetErrorBoundary}
      >
        <RefreshCw size={20} color="#ffffff" />
        <Text className="text-card ml-2 font-medium">Try Again</Text>
      </Pressable>
    </View>
  );
}

function handleError(error: Error, info: { componentStack?: string | null }) {
  console.error("ErrorBoundary caught an error: ", error, info);
}

export function ErrorBoundary({ children, fallback }: Props) {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback ? () => <>{fallback}</> : ErrorFallback}
      onError={handleError}
    >
      {children}
    </ReactErrorBoundary>
  );
}
