const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FrequencyType = require('../constant').FrequencyType;
const KeyKeepingType = require('../constant').KeyKeepingType;
const PetKeepingType = require('../constant').PetKeepingType;

const RotationItemSchema = new Schema({
  key: String,
  value: String,
});

const JobDetailItemSchema = new Schema({
  name: String,
  amount: Number,
  request: String,
});

const RotationItem = mongoose.model('rotationItem', RotationItemSchema);
const JobDetailItem = mongoose.model('JobDetailItem', JobDetailItemSchema);

const JobDetailSchema = new Schema({
  frequency: { type: String, default: FrequencyType.Weekly },
  key: {
    has: Boolean,
    notes: { type: String, default: KeyKeepingType.KeptByUs }
  },
  alarm: {
    has: Boolean,
    alarmIn: { type: String, default: "09:00" },
    alarmOut: { type: String, default: "17:00" },
  },
  pet: {
    has: Boolean,
    notes: { type: String, default: PetKeepingType.DoesNotMatter }
  },
  important: String,
  rotations: {
    type: Array,
    default: [
      new RotationItem({ key: "week 1", value: "" }),
      new RotationItem({ key: "week 2", value: "" }),
      new RotationItem({ key: "week 3", value: "" }),
      new RotationItem({ key: "week 4", value: "" }),
    ]
  },
  items: {
    type: Array,
    default: [
      new JobDetailItem({ name: "Formal lounge", amount: 1, request: "" }),
      new JobDetailItem({ name: "Family room", amount: 1, request: "" }),
    ]
  }
});

module.exports = JobDetailSchema;