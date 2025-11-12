// its-users/src/config/envs.ts
import * as dotenv from 'dotenv';
import * as Joi from 'joi';

dotenv.config();

const schema = Joi.object({
  PORT: Joi.number().default(3001),
  DB_URL: Joi.string().required(),
  GATEWAY_HOST: Joi.string().default('localhost'),
  GATEWAY_PORT: Joi.number().default(3000),
}).unknown(true);

const { error, value } = schema.validate(process.env);
if (error) throw new Error(`Config validation error: ${error.message}`);

export const envs = {
  port: value.PORT,
  dbUrl: value.DB_URL,
  gateway: {                    
    host: value.GATEWAY_HOST,
    port: value.GATEWAY_PORT,
  },
};