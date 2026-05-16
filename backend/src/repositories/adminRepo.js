import Plan from "../models/plan.js";

const createPlan = (data) => Plan.create(data);

const getPlan = () => Plan.find();

const updatePlan = ({ _id, data }) => {
  if (data == null) return;
  let updateFields = {};

  if (data.name !== undefined) updateFields.name = data.name;
  if (data.storageLimit !== undefined)
    updateFields.storageLimit = data.storageLimit;
  if (data.bandwidthLimit !== undefined)
    updateFields.bandwidthLimit = data.bandwidthLimit;
  if (data.maxFileSize !== undefined)
    updateFields.maxFileSize = data.maxFileSize;
  if (data.monthlyPrice !== undefined)
    updateFields.monthlyPrice = data.monthlyPrice;

  return Plan.findByIdAndUpdate(
    _id,
    {
      $set: updateFields,
    },
    { returnDocument: "after" },
  );
};

const findByName = ({ name }) => Plan.findOne({ name });

export default {
  createPlan,
  getPlan,
  updatePlan,
  findByName,
};
