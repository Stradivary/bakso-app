import { usePoke } from "@/shared/hooks/usePoke";
import { Card, Stack, Group, Avatar, Badge, Button, Text } from "@mantine/core";

export function PokeRequests() {
  const { activePoke, handlePokeResponse } = usePoke();

  if (!activePoke) {
    return (
      <Text ta="center" c="dimmed" p="xl">
        No active requests
      </Text>
    );
  }

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Group>
            <Avatar radius="xl" />
            <div>
              <Text fw={500}>{activePoke.sellerName}</Text>
              {/* <Text size="sm" c="dimmed">
                {(activePoke.status / 1000).toFixed(1)} km away
              </Text> */}
            </div>
          </Group>
          <Badge color="blue">Pending</Badge>
        </Group>

        <Group grow>
          <Button
            color="red"
            variant="light"
            onClick={() => handlePokeResponse(activePoke.id, "rejected")}
          >
            Decline
          </Button>
          <Button
            color="green"
            onClick={() => handlePokeResponse(activePoke.id, "accepted")}
          >
            Accept
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
