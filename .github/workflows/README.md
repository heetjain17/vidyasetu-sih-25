# GitHub Actions Workflows

## Keep Qdrant Cluster Alive

**File**: `keep-qdrant-alive.yml`

### Purpose
Pings the Qdrant vector database cluster periodically to prevent it from going idle or being shut down due to inactivity.

### Schedule
- Runs automatically every **6 hours**
- Can be triggered manually via GitHub Actions UI

### What It Does
1. **Health Check**: Pings the `/health` endpoint to verify cluster is responsive
2. **Collections Info**: Fetches list of all collections and their point counts
3. **Verify Embeddings**: Specifically checks the `college_career_knowledge_gemini` collection
4. **Logging**: Provides detailed logs of cluster status

### Setup Instructions

#### 1. Add GitHub Secrets
Go to your repository: **Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:

- **`QDRANT_URL`**
  ```
  https://b4f753e8-eba4-4a88-9799-4564eda285d0.us-east4-0.gcp.cloud.qdrant.io
  ```

- **`QDRANT_API_KEY`**
  ```
  Your Qdrant API key from the cluster dashboard
  ```

#### 2. Enable GitHub Actions
1. Go to **Actions** tab in your repository
2. Enable workflows if not already enabled
3. The workflow will start running automatically on schedule

#### 3. Manual Trigger (Optional)
To manually trigger the workflow:
1. Go to **Actions** tab
2. Select "Keep Qdrant Cluster Alive" workflow
3. Click "Run workflow" button
4. Select branch and click "Run workflow"

### Monitoring

#### Check Workflow Status
- Go to **Actions** tab
- Click on "Keep Qdrant Cluster Alive"
- View recent runs and their logs

#### Expected Output
```
✅ Qdrant cluster is alive and healthy
✅ Collections fetched successfully
✅ Collection verified
🎉 Qdrant cluster ping successful at Thu Mar 13 14:30:00 UTC 2026
```

#### If Workflow Fails
- Check if Qdrant cluster is still active
- Verify API key is correct in GitHub secrets
- Check Qdrant cluster dashboard for any issues
- Review workflow logs for specific error messages

### Adjusting Schedule

To change how often the workflow runs, edit the cron expression in `keep-qdrant-alive.yml`:

```yaml
schedule:
  - cron: '0 */6 * * *'  # Every 6 hours
```

Common schedules:
- Every 3 hours: `'0 */3 * * *'`
- Every 12 hours: `'0 */12 * * *'`
- Every day at midnight: `'0 0 * * *'`
- Every hour: `'0 * * * *'`

### Free Tier Limits

Qdrant Cloud free tier typically:
- Shuts down after **7 days of inactivity**
- Has **1GB storage limit**
- Supports **1 cluster**

This workflow helps prevent the 7-day inactivity shutdown by regularly accessing the cluster.

### Troubleshooting

#### Issue: Workflow not running
- **Solution**: Check if GitHub Actions are enabled for your repository

#### Issue: 401 Unauthorized
- **Solution**: Verify `QDRANT_API_KEY` secret is set correctly

#### Issue: 404 Not Found
- **Solution**: Check if `QDRANT_URL` secret is correct and cluster still exists

#### Issue: Collection not found
- **Solution**: Run the embedding generation script to recreate the collection:
  ```bash
  cd backend-vidyasetu/backend
  python scripts/create_embeddings_gemini.py
  ```

### Cost Considerations

- GitHub Actions free tier: **2,000 minutes/month** for public repos
- This workflow uses ~1 minute per run
- Running every 6 hours = 4 runs/day = 120 runs/month
- **Total usage**: ~120 minutes/month (well within free tier)

### Additional Notes

- The workflow uses `jq` to parse JSON responses (pre-installed on GitHub runners)
- All sensitive data (URLs, API keys) are stored as GitHub secrets
- Workflow logs are retained for 90 days
- You can disable the workflow anytime from the Actions tab
