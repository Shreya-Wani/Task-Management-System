import Joi from "joi";

export const createProjectSchema = Joi.object({
    name: Joi.string().trim().min(3).max(100).required(),
    description: Joi.string().trim().allow("").optional(),
});

export const updateProjectSchema = Joi.object({
    name: Joi.string().trim().min(3).max(100).optional(),
    description: Joi.string().trim().allow("").optional(),
});