import { registerTool } from "./registry";
import { kvGet, kvSet, getRecentMessages } from "../memory/store";

registerTool({
  name: "memory:get",
  description: "Get a value from persistent key-value storage",
  requires: [],
  schema: {
    type: "object",
    properties: {
      key: { type: "string" }
    },
    required: ["key"]
  },
  async run({ key }) {
    return kvGet(key);
  }
});

registerTool({
  name: "memory:put",
  description: "Store a key-value pair in persistent storage",
  requires: [],
  schema: {
    type: "object",
    properties: {
      key: { type: "string" },
      value: { type: "string" }
    },
    required: ["key", "value"]
  },
  async run({ key, value }) {
    kvSet(key, value);
    return { ok: true };
  }
});

registerTool({
  name: "memory:recent",
  description: "Get recent messages from a conversation",
  requires: [],
  schema: {
    type: "object",
    properties: {
      convoId: { type: "string" },
      limit: { type: "number", default: 30 }
    },
    required: ["convoId"]
  },
  async run({ convoId, limit = 30 }) {
    return getRecentMessages(convoId, limit);
  }
});
