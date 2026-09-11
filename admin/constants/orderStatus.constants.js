export const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

export const STATUS_LABEL = {
  pending: "PENDING",
  confirmed: "CONFIRMED",
  shipped: "SHIPPED",
  delivered: "DELIVERED",
  cancelled: "CANCELLED",
};

export const STATUS_TEXT_COLOR = {
  pending: "text-yellow-600",
  confirmed: "text-blue-600",
  shipped: "text-purple-600",
  delivered: "text-green-600",
  cancelled: "text-red-600",
};

export const STATUS_BADGE_COLOR = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  shipped: "bg-purple-100 text-purple-700 border-purple-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};
