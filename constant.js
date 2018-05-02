const USER_ROLES = {
  ROLE_STAFF: "ROLE_STAFF",
  ROLE_MANAGER: "ROLE_MANAGER",
  ROLE_ADMIN: "ROLE_ADMIN"
}

const FrequencyType = {
  Weekly: "weekly",
  TwiceAWeek: "twiceAWeek",
  Fortnightly: "fortnightly",
  Monthly: "monthly",
  WhenNeed: "whenNeed",
}

const PaymentType = {
  Cash: "cash",
  Cheque: "cheque",
  Debt: "debt",
}

const KeyKeepingType = {
  KeptByUs: "keptByUs",
  Original: "original",
  Kitchen: "kitchen",
}
const PetKeepingType = {
  DoesNotMatter: "doesNotMatter",
  KeptInDoor: "keptInDoor",
  KeptOutDoor: "keptOutDoor",
}

const ServiceStatus = {
  Pending: 0,
  Completed: 1,
  Cancelled: 2,
}

const InvoiceStatus = {
  Pending: 0,
  Sent: 1,
}

module.exports = {
  USER_ROLES: USER_ROLES,
  FrequencyType: FrequencyType,
  PaymentType: PaymentType,
  KeyKeepingType: KeyKeepingType,
  PetKeepingType: PetKeepingType,
  ServiceStatus: ServiceStatus,
  InvoiceStatus: InvoiceStatus,
}