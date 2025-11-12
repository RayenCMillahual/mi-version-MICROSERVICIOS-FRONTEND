import * as dotenv from 'dotenv';
import * as Joi from 'joi';

dotenv.config();

const schema = Joi.object({
  MONGODB_URI: Joi.string().uri().required(),
  PORT: Joi.number().required(),
  GATEWAY_HOST: Joi.string().required(),
  GATEWAY_PORT: Joi.number().required(),
}).unknown(true);

const { error, value } = schema.validate(process.env);
if (error) throw new Error(`Config validation error: ${error.message}`);

export const envs = {
  uri: value.MONGODB_URI,
  port: value.PORT,
  gateway: {
    host: value.GATEWAY_HOST,
    port: value.GATEWAY_PORT,
  },
};