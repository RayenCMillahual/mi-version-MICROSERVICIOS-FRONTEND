import * as dotenv from 'dotenv';
import * as Joi from 'joi';

dotenv.config();

const schema = Joi.object({
  PORT: Joi.number().default(3000),
  JWT_SECRET: Joi.string().min(16).required(),  // Mínimo 16 caracteres para seguridad
  JWT_EXPIRES_IN: Joi.string().default('24h'),
  MS_USER_HOST: Joi.string().default('localhost'),
  MS_USER_PORT: Joi.number().default(3001),
  MS_PRODUCT_HOST: Joi.string().default('localhost'),
  MS_PRODUCT_PORT: Joi.number().default(3002),
  MS_INVOICE_HOST: Joi.string().default('localhost'),
  MS_INVOICE_PORT: Joi.number().default(3003),
  FRONTEND_URL: Joi.string().default('http://localhost:3000'),
}).unknown(true);

const { error, value } = schema.validate(process.env);
if (error) throw new Error(`Config validation error: ${error.message}`);

export const envs = {
  port: value.PORT,
  frontendUrl: value.FRONTEND_URL,
  jwt: {
    secret: value.JWT_SECRET,
    expiresIn: value.JWT_EXPIRES_IN,
  },
  microservices: {
    user: { host: value.MS_USER_HOST, port: value.MS_USER_PORT },
    product: { host: value.MS_PRODUCT_HOST, port: value.MS_PRODUCT_PORT },
    invoice: { host: value.MS_INVOICE_HOST, port: value.MS_INVOICE_PORT },
  },
};