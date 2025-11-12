// its-facturas/src/config/envs.ts
import * as dotenv from 'dotenv';
import * as Joi from 'joi';

dotenv.config();

const schema = Joi.object({
  MONGODB_URI: Joi.string().uri().required(),
  PORT: Joi.number().required(),
  // ✅ RENOMBRADO para claridad
  MS_USER_HOST: Joi.string().required(),
  MS_USER_PORT: Joi.number().required(),
}).unknown(true);

const { error, value } = schema.validate(process.env);
if (error) throw new Error(`Config validation error: ${error.message}`);

export const envs = {
  uri: value.MONGODB_URI,
  port: value.PORT,
  // ✅ RENOMBRADO de 'gateway' a 'msUser'
  msUser: {
    host: value.MS_USER_HOST,
    port: value.MS_USER_PORT,
  },
};