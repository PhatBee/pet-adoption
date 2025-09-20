const orderStatusHistory = new Schema({
  order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
  fromStatus: String,
  toStatus: String,
  changedBy: { type: Schema.Types.ObjectId, ref: "User" }, // hoặc null = system
  actorRole: { type: String, enum: ['user','admin'], default: 'user' },
  reason: String
}, { timestamps: true });