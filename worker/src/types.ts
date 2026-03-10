export type Bindings = {
  DB: D1Database;
  DEV_API_KEY: string;
  TZP_REGION: string;
};

export type Variables = {
  agent_id: string;
};

export type AppEnv = { Bindings: Bindings; Variables: Variables };

export interface PayloadRecord {
  trex_id: string;
  payload: string;
  metadata: string;
  checksum_sha256: string;
  expires_at: string;
  created_at: string;
}
