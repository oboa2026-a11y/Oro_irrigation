import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// KoboToolbox API Proxy Route
app.post('/api/kobo/sync', async (req, res) => {
  const { koboUrl = 'https://kf.kobotoolbox.org', username = 'oboa2026', password = 'Oboa@2019', assetUid, syncAll = false } = req.body;
  try {
    const authHeader = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
    
    // Always fetch asset list to get live deployed forms
    const assetsResp = await fetch(`${koboUrl.replace(/\/+$/, '')}/api/v2/assets.json`, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
      },
    });

    let liveAssets: any[] = [];
    if (assetsResp.ok) {
      const assetsData = await assetsResp.json();
      liveAssets = assetsData?.results || [];
    }

    // If syncAll is true or assetUid === 'ALL', fetch data from all 8 survey assets
    if (syncAll || assetUid === 'ALL') {
      const allSubmissions: Record<string, any[]> = {};
      let totalSubmissionsCount = 0;

      await Promise.all(
        liveAssets.map(async (asset: any) => {
          try {
            const subResp = await fetch(`${koboUrl.replace(/\/+$/, '')}/api/v2/assets/${asset.uid}/data.json`, {
              headers: { Authorization: authHeader, Accept: 'application/json' },
            });
            if (subResp.ok) {
              const subData = await subResp.json();
              allSubmissions[asset.uid] = subData?.results || [];
              totalSubmissionsCount += subData?.count || (subData?.results?.length ?? 0);
            }
          } catch (e) {
            console.error(`Error fetching data for asset ${asset.uid}:`, e);
          }
        })
      );

      return res.json({
        success: true,
        isAllSync: true,
        assets: liveAssets,
        submissionsByAsset: allSubmissions,
        totalCount: totalSubmissionsCount,
        message: `Successfully synchronized all ${liveAssets.length} Kobo forms with ${totalSubmissionsCount} total field records.`,
      });
    }

    // If no specific assetUid provided and not syncAll, return asset list
    if (!assetUid) {
      return res.json({
        success: true,
        count: liveAssets.length,
        assets: liveAssets,
      });
    }

    // Fetch submissions for a specific assetUid
    const resp = await fetch(`${koboUrl.replace(/\/+$/, '')}/api/v2/assets/${assetUid}/data.json`, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
      },
    });

    if (!resp.ok) {
      return res.status(resp.status).json({
        success: false,
        statusText: resp.statusText,
        message: `KoboToolbox data API responded with status ${resp.status}`,
        fallbackToMock: true,
      });
    }

    const data = await resp.json();
    return res.json({
      success: true,
      submissions: data?.results || [],
      count: data?.count || (data?.results?.length ?? 0),
      assets: liveAssets,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message,
      fallbackToMock: true,
    });
  }
});

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'Oromia BOA Wheat Analytics Server', time: new Date().toISOString() });
});

// Setup Vite in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Oromia BOA Wheat Analytics Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
