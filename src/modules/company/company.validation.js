import Joi from "joi";

export const createCompanySchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).required(),
  description: Joi.string().trim().allow("").optional(),
});

export const updateCompanySchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).optional(),
  description: Joi.string().trim().allow("").optional(),
});