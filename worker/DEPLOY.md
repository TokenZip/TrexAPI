# Deploying to Cloudflare Workers

## If you see "A request to the Cloudflare API ... failed"

1. **Get the full error**  
   Run with debug logging to see the HTTP status and body:
   ```bash
   WRANGLER_LOG=debug npx wrangler deploy
   ```

2. **Check API token permissions**  
   After `npx wrangler login`, your OAuth token must allow:
   - **Workers Scripts: Edit**
   - **Account Settings: Read** (for account id)
   - **D1: Edit** if you use D1

   If you use an API token (e.g. in CI), create one under **My Profile → API Tokens** with the same scopes.

3. **Worker name unique**  
   The script name in `wrangler.toml` (`name = "trexapi-investor-demo"`) must be unique in your account. If you get a conflict, change it (e.g. `trexapi-demo-yourname`).

4. **D1 database_id (required; error 10021 if missing)**  
   Create the database and get a real UUID:
   ```bash
   npx wrangler d1 create trexapi
   ```
   Copy the `database_id` from the output (e.g. `a1b2c3d4-e5f6-7890-abcd-ef1234567890`) and set it in `wrangler.toml`:
   ```toml
   database_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
   ```
   Then run the migration on the **remote** DB:
   ```bash
   npx wrangler d1 execute trexapi --remote --file=migrations/0001_init.sql
   ```

5. **Deploy**
   ```bash
   npx wrangler deploy
   ```

After a successful deploy, open `https://trexapi-investor-demo.<your-subdomain>.workers.dev/demo` (the subdomain is shown in the deploy output).
