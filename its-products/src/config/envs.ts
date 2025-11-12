// its-products/src/config/envs.ts
import * as dotenv from 'dotenv';
import * as Joi from 'joi';

dotenv.config();

const schema = Joi.object({
  PORT: Joi.number().default(3002),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(3306),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
}).unknown(true);

const { error, value } = schema.validate(process.env);
if (error) throw new Error(`Config validation error: ${error.message}`);

export const envs = {
  port: value.PORT,
  database: {
    host: value.DB_HOST,
    port: value.DB_PORT,
    username: value.DB_USERNAME,
    password: value.DB_PASSWORD,
    database: value.DB_DATABASE,
  },
};