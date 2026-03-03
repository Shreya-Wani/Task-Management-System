import Joi from "joi";

export const createUserSchema = Joi.object({
    name: Joi.string().trim().min(3).max(50).required(),

    email: Joi.string()
        .email()
        .lowercase()
        .required(),

    password: Joi.string()
        .min(6)
        .max(20)
        .required(),

    role: Joi.string()
        .valid("admin", "user")
        .optional(),

    companyId: Joi.string().optional()
});

export const updateUserSchema = Joi.object({
    name: Joi.string().trim().min(3).max(50).optional(),

    email: Joi.string()
        .email()
        .lowercase()
        .optional(),

    role: Joi.string()
        .valid("admin", "user", "superAdmin")
        .optional(),
})