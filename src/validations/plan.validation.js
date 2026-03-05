import Joi from "joi";

export const createPlanSchema = Joi.object({
  name: Joi.string().required(),

  price: Joi.number().required(),

  duration: Joi.number().required(),

  maxUsers: Joi.number().required(),

  maxProjects: Joi.number().required(),

  maxTasks: Joi.number().required(),

  isUnlimited: Joi.boolean()
});