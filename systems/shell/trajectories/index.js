import paladin from "@vivalence/paladin"
import auth from "./auth.js"

export default function trajectory(client) {
  client.lighthouseUrl = paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")

  auth(client.trajectory, client)

  client.trajectory.open("/status", () => ({
    lighthouse: client.lighthouseUrl,
    isAgent: client.isAgent,
  }))
}
