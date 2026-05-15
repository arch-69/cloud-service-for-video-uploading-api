import mongoose from "mongoose";

// -----------------------------------
// UPLOADED PART SCHEMA
// -----------------------------------

const uploadedPartSchema = new mongoose.Schema(
  {
    partNumber: {
      type: Number,
      required: true,
    },

    etag: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

// -----------------------------------
// FAILED PART SCHEMA
// -----------------------------------

const failedPartSchema = new mongoose.Schema(
  {
    partNumber: {
      type: Number,
      required: true,
    },

    reason: {
      type: String,
    },

    failedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

// -----------------------------------
// MAIN UPLOAD SCHEMA
// -----------------------------------

const uploadSchema = new mongoose.Schema(
  {
    // -----------------------------------
    // USER
    // -----------------------------------

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // -----------------------------------
    // FILE INFO
    // -----------------------------------

    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
    },

    fileUrl: {
      type: String,
    },

    fileType: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    fileExtension: {
      type: String,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    formattedFileSize: {
      type: String,
    },

    // -----------------------------------
    // FILE CATEGORY
    // -----------------------------------

    category: {
      type: String,

      enum: ["VIDEO", "IMAGE", "DOCUMENT", "OTHER"],

      default: "OTHER",
    },

    // -----------------------------------
    // MULTIPART UPLOAD INFO
    // -----------------------------------

    uploadId: {
      type: String,
      required: true,
      unique: true,
    },

    totalParts: {
      type: Number,
      required: true,
    },

    uploadedParts: [uploadedPartSchema],

    failedParts: [failedPartSchema],

    // -----------------------------------
    // PROGRESS TRACKING
    // -----------------------------------

    uploadedBytes: {
      type: Number,
      default: 0,
    },

    uploadProgress: {
      type: Number,
      default: 0,
    },

    uploadedPartsCount: {
      type: Number,
      default: 0,
    },

    // -----------------------------------
    // STATUS
    // -----------------------------------

    status: {
      type: String,

      enum: [
        "PENDING",
        "UPLOADING",
        "PARTIAL",
        "COMPLETED",
        "FAILED",
        "ABORTED",
        "PROCESSING",
      ],

      default: "PENDING",
    },

    // -----------------------------------
    // FLAGS
    // -----------------------------------

    isCompleted: {
      type: Boolean,
      default: false,
    },

    isAborted: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    // -----------------------------------
    // VIDEO SPECIFIC
    // -----------------------------------

    duration: {
      type: Number,
    },

    resolution: {
      width: Number,
      height: Number,
    },

    thumbnailUrl: {
      type: String,
    },

    // -----------------------------------
    // STREAMING
    // -----------------------------------

    streamingUrl: {
      type: String,
    },

    hlsMasterPlaylist: {
      type: String,
    },

    // -----------------------------------
    // STORAGE INFO
    // -----------------------------------

    bucket: {
      type: String,
    },

    region: {
      type: String,
    },

    // -----------------------------------
    // ERROR HANDLING
    // -----------------------------------

    errorMessage: {
      type: String,
    },

    // -----------------------------------
    // TIMESTAMPS
    // -----------------------------------

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
    },

    abortedAt: {
      type: Date,
    },

    // -----------------------------------
    // AUTO DELETE / EXPIRY
    // -----------------------------------

    // expiresAt: {
    //   type: Date,
    //   // FIX: Wrapped in an arrow function so it runs dynamically on every insert
    //   default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    // },
  },
  {
    timestamps: true,
  },
);

// -----------------------------------
// INDEXES
// -----------------------------------

uploadSchema.index({ status: 1 });

// FIX: Target explicitly which statuses are temporary instead of using $ne
uploadSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 3600, // 24 hours (86400 seconds)
    partialFilterExpression: {
      status: { $in: ["PENDING", "UPLOADING", "PARTIAL", "FAILED"] },
    },
  },
);

const Upload = mongoose.model("Upload", uploadSchema);
export default Upload;
