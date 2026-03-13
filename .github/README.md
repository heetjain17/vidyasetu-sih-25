# GitHub Actions & Workflows

This directory contains automation workflows for the Margadarshaka project.

## 🟢 Supabase Keep-Alive (`keep_alive.yml`)

We use a free-tier Supabase database, which automatically pauses itself after 7 days of inactivity. To prevent this, the `keep_alive.yml` workflow runs a cron job every 3 days to ping the database and keep it continually active.

### ⚠️ Required Repository Secrets

For this action to work on the target repository after merging a Pull Request, the repository owner **must** configure the following secrets. 

**How to add them:**
1. Navigate to your repository on GitHub.
2. Go to **Settings** > **Secrets and variables** > **Actions**.
3. Click on the **New repository secret** button.
4. Add the following two keys exactly as named:

| Secret Name | Value Example | Description |
|-------------|---------------|-------------|
| `SUPABASE_URL` | `https://your-project.supabase.co` | Find this in Supabase: Project Settings > API > Project URL |
| `SUPABASE_KEY` | `eyJhb...` | Find this in Supabase: Project Settings > API > `anon` / `public` |

### Manual Triggering
You can test if the keep-alive script is working without waiting 3 days:
1. Go to the **Actions** tab in GitHub.
2. Select **Keep Supabase Alive** on the left menu.
3. Click the **Run workflow** dropdown and run it on the `main` branch.
