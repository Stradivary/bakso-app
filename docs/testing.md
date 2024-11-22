---
title: Testing
nav_order: 11
---

# Testing 🧪

Testing ensures the reliability and quality of the application.

## **Running Tests**

Navigate to the project root and run:

```bash
cd src
npm run test
```

## Testing Variants

1. Snapshot (view)
2. Integration Test (view)
3. Unit Testing

### Snapshot Testing

Snapshot tests ensure that the UI does not change unexpectedly. Here is an example of a snapshot test for the `LoginView` component:

```tsx
import { MantineProvider } from "@mantine/core";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LoginView } from "../login/LoginView";

describe("LoginView", () => {
  it("renders login form correctly", () => {
    const { container } = render(
      <MantineProvider>
        <MemoryRouter>
          <LoginView />
        </MemoryRouter>
      </MantineProvider>,
    );

    expect(container).toMatchSnapshot();
  });
});
```

### Integration Testing

Integration tests ensure that different parts of the application work together as expected. Here is an example of an integration test for the `useBroadcastMapViewModel` hook:

```tsx
import { modals } from "@mantine/modals";
import { notifications as notify } from "@mantine/notifications";
import { act, renderHook } from "@testing-library/react";
import L from "leaflet";
import { useBroadcastMapViewModel } from "../map/useBroadcastMapViewModel";

describe("useBroadcastMapViewModel", () => {
  it("handles marker click for seller with location", () => {
    const { result } = renderHook(() =>
      useBroadcastMapViewModel({ latitude: 0, longitude: 0 }),
    );
    const seller = {
      user_id: "seller-id",
      userName: "Seller",
      role: "seller" as const,
      location: { lat: 2, lng: 2 },
    };

    act(() => {
      result.current.handleMarkerClick(seller);
    });

    expect(modals.openConfirmModal).toHaveBeenCalled();
  });
});
```

### Unit Testing

Unit tests ensure that individual functions and components work as expected. Here is an example of a unit test for the `useRequestLocation` hook:

```tsx
import { act, renderHook } from "@testing-library/react";
import { useRequestLocation } from "../useRequestLocation";

describe("useRequestLocation", () => {
  it("should handle successful location request", async () => {
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
      },
    };

    global.navigator.geolocation.getCurrentPosition = vi.fn((success) =>
      success(mockPosition),
    );

    const { result } = renderHook(() => useRequestLocation());

    act(() => {
      result.current.requestLocation();
    });

    expect(result.current).toMatchSnapshot();
  });
});
```