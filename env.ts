import { z } from 'zod';

export const envSch = z.object({
  AWS_REGION: z.string().min(1, 'AWS_REGION is required'),
  AWS_PROFILE: z.string().min(1, 'AWS_PROFILE is required'),
  AWS_IAM_ROLE: z.string().min(1, 'AWS_IAM_ROLE is required'),
});
export type Env = z.infer<typeof envSch>;

let serverlessEnv: Env;

try {
  serverlessEnv = envSch.parse(process.env);
} catch (err) {
  console.error('❌ Invalid environment variables:', err);
  process.exit(1);
}

export { serverlessEnv as env };
export default serverlessEnv;
