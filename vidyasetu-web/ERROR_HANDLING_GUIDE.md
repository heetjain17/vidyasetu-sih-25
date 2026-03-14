# Error Handling Implementation Guide

## Overview

Comprehensive error handling has been implemented across the frontend to provide better user experience and debugging capabilities.

## Components Added

### 1. Error Handler Utility (`src/utils/errorHandler.ts`)

Centralized error handling utility with the following functions:

- **`getErrorMessage(error)`**: Extracts user-friendly messages from any error type
- **`parseError(error)`**: Converts errors into structured format
- **`handleError(error, options)`**: Main error handler with logging and callbacks
- **`isNetworkError(error)`**: Checks if error is network-related
- **`isAuthError(error)`**: Checks if error is authentication-related
- **`logError(error, context)`**: Logs errors in development mode

### 2. Error Boundary Component (`src/components/ErrorBoundary.tsx`)

React Error Boundary that catches component errors and displays a fallback UI:

- Shows user-friendly error message
- Displays error details in development mode
- Provides "Try Again" and "Go Home" buttons
- Prevents entire app from crashing

### 3. useErrorHandler Hook (`src/hooks/useErrorHandler.ts`)

Custom React hook for consistent error handling:

```tsx
const { showError, showSuccess } = useErrorHandler();

// In your component
try {
  await someApiCall();
  showSuccess("Operation completed successfully!");
} catch (error) {
  showError(error, "API Call Context");
}
```

### 4. Enhanced API Client (`src/api/client.ts`)

Improved axios interceptors with:

- **Network error detection**: Shows clear message when server is unreachable
- **Better error logging**: Detailed logs in development mode
- **Enhanced error messages**: Extracts meaningful messages from API responses
- **Timeout handling**: User-friendly timeout messages
- **Auth error handling**: Auto-redirect to login on 401 errors

## Error Types Handled

### Network Errors
- **Message**: "Cannot connect to server. Please check your internet connection."
- **When**: Server is unreachable or network is down
- **User Action**: Check internet connection, verify backend is running

### Authentication Errors (401)
- **Message**: "Your session has expired. Please log in again."
- **When**: Token is invalid or expired
- **User Action**: Automatically redirected to login page

### Validation Errors (400, 422)
- **Message**: "Invalid request. Please check your input and try again."
- **When**: Invalid data sent to API
- **User Action**: Review form inputs

### Not Found Errors (404)
- **Message**: "The requested resource was not found."
- **When**: Endpoint or resource doesn't exist
- **User Action**: Check if feature is available

### Server Errors (500, 502, 503, 504)
- **Message**: "Server error. Please try again later."
- **When**: Backend has internal errors
- **User Action**: Wait and retry

### Timeout Errors
- **Message**: "Request timed out. The server is taking too long to respond."
- **When**: Request exceeds 120 second timeout
- **User Action**: Retry or check server performance

## Usage Examples

### In API Calls

```tsx
import { useErrorHandler } from "@/hooks/useErrorHandler";

function MyComponent() {
  const { showError, showSuccess } = useErrorHandler();
  
  const handleSubmit = async () => {
    try {
      const result = await apiClient.post("/endpoint", data);
      showSuccess("Data saved successfully!");
    } catch (error) {
      showError(error, "Submit Form");
    }
  };
}
```

### In Components with Try-Catch

```tsx
import { getErrorMessage } from "@/utils/errorHandler";

async function fetchData() {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch (error) {
    console.error(getErrorMessage(error));
    // Handle error appropriately
  }
}
```

### With React Query

```tsx
import { useQuery } from "@tanstack/react-query";
import { useErrorHandler } from "@/hooks/useErrorHandler";

function MyComponent() {
  const { showError } = useErrorHandler();
  
  const { data, error } = useQuery({
    queryKey: ["data"],
    queryFn: fetchData,
    onError: (error) => showError(error, "Data Fetch"),
  });
}
```

## Configuration

### API Base URL

Set in `.env` file:
```env
VITE_API_URL=http://127.0.0.1:8000
```

For production:
```env
VITE_API_URL=https://your-api-domain.com
```

### Timeout Settings

Default timeout is 120 seconds (configured in `src/api/client.ts`):

```typescript
timeout: 120000, // 120 seconds
```

Adjust as needed for your API response times.

## Debugging

### Development Mode

In development, errors are logged with full details:

```javascript
console.error("[API Error]:", {
  url: "/api/endpoint",
  method: "POST",
  status: 500,
  message: "Internal Server Error",
  data: { detail: "..." }
});
```

### Production Mode

In production, only user-friendly messages are shown. Full error details are hidden for security.

## Common Issues & Solutions

### Issue: "Cannot connect to server"

**Causes:**
- Backend server is not running
- Wrong API URL in `.env`
- Network/firewall blocking connection
- CORS issues

**Solutions:**
1. Start backend server: `cd backend && uvicorn app.main:app --reload`
2. Verify `VITE_API_URL` in `.env`
3. Check browser console for CORS errors
4. Ensure backend allows frontend origin

### Issue: Network errors everywhere

**Causes:**
- Backend not running on expected port
- Environment variable not loaded
- Proxy/firewall blocking requests

**Solutions:**
1. Check backend is running: `curl http://127.0.0.1:8000/docs`
2. Restart frontend dev server to reload `.env`
3. Check browser Network tab for actual request URLs
4. Verify no proxy/VPN interfering

### Issue: Errors not showing toast notifications

**Causes:**
- Toaster component not added to layout
- useToast hook not available

**Solutions:**
1. Ensure `<Toaster />` is in your root layout
2. Check shadcn/ui toast is properly installed
3. Verify `useErrorHandler` hook is imported correctly

## Testing Error Handling

### Test Network Errors

```typescript
// Stop backend server and try API calls
// Should show: "Cannot connect to server..."
```

### Test Timeout Errors

```typescript
// Create slow endpoint in backend
// Should show: "Request timed out..."
```

### Test Auth Errors

```typescript
// Use invalid token
// Should redirect to /auth
```

### Test Component Errors

```typescript
// Throw error in component render
// Should show ErrorBoundary fallback UI
```

## Best Practices

1. **Always use try-catch** for async operations
2. **Use useErrorHandler hook** for consistent error display
3. **Provide context** when calling `showError(error, "Context")`
4. **Don't expose sensitive data** in error messages
5. **Log errors** in development for debugging
6. **Test error scenarios** during development
7. **Handle specific errors** when needed (auth, validation, etc.)

## Migration Guide

### Before (Direct fetch with no error handling)

```tsx
const response = await fetch(`${API_URL}/endpoint`);
const data = await response.json();
```

### After (With proper error handling)

```tsx
import { useErrorHandler } from "@/hooks/useErrorHandler";

const { showError } = useErrorHandler();

try {
  const response = await apiClient.get("/endpoint");
  const data = response.data;
} catch (error) {
  showError(error, "Fetch Endpoint");
}
```

## Files Modified

1. **`src/utils/errorHandler.ts`** - New error handling utilities
2. **`src/components/ErrorBoundary.tsx`** - New error boundary component
3. **`src/hooks/useErrorHandler.ts`** - New error handler hook
4. **`src/api/client.ts`** - Enhanced with better error handling
5. **`src/main.tsx`** - Wrapped app with ErrorBoundary

## Next Steps

1. **Update remaining fetch calls** to use `apiClient`
2. **Add error handling** to all async operations
3. **Test error scenarios** thoroughly
4. **Monitor errors** in production
5. **Improve error messages** based on user feedback
