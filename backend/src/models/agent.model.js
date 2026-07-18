const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    isBuiltIn:{
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    thumbnail: {
      type: String,
      default: "",
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    version: {
      type: Number,
      default: 1,
    },

    graph: {
      nodes: {
        type: [mongoose.Schema.Types.Mixed],
        default: [],
      },

      edges: {
        type: [mongoose.Schema.Types.Mixed],
        default: [],
      },
    },
    tools: {
    type: [String],
    default: [],
},

    settings: {
      model: {
        type: String,
        default: "llama-3.3-70b-versatile",
      },

      temperature: {
        type: Number,
        default: 0.7,
      },

      maxTokens: {
        type: Number,
        default: 2048,
      },

      topP: {
        type: Number,
        default: 1,
      },

      frequencyPenalty: {
        type: Number,
        default: 0,
      },

      presencePenalty: {
        type: Number,
        default: 0,
      },

      stopSequences: {
        type: [String],
        default: [],
      },

      systemPrompt: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

    const Agent = mongoose.model("Agent", agentSchema);

    module.exports = Agent;