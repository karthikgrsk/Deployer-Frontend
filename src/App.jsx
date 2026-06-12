
import { useState } from 'react';

function App() {

  const Backend_URL = import.meta.env.VITE_API_URL;

  //console.log("url:"+Backend_URL);

  const [status, setStatus] = useState("");
  const [id, setId] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [deployed, setDeployed] = useState(false);

  const handleButtonClick = async (event) => {
    event.preventDefault();
    const deployId = await handleDeploy()
    pollStatus(deployId)
    
  }

  async function handleDeploy() {
    alert("This platform currently supports deployment for React and static HTML/CSS/JavaScript projects only. Deployment initialization may takesome time depending on server availability.");
    setStatus("uploading")

    let response = await fetch(`${Backend_URL}/deploy`, {
      method: 'POST',
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ repoUrl })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Deployment failed");
    }

    let data = await response.json();

    //console.log("Deploy Response:", data);

    setId(data.id);
    setStatus(data.status);

    //console.log(`ID: ${data.id} status: ${data.status}`);

    return data.id;

  }

  async function pollStatus(deployId) {
    if (!deployId) return;

    while (true) {
      const response = await fetch(`${Backend_URL}/status?id=${deployId}`);
      let data;
      try {
        data = await response.json();
      } catch (err) {
        console.error('Failed to parse status response', err);
        break;
      }

      const statusText = data.status;

      //console.log('status: ', data);
      setStatus(statusText);

      if (!response.ok) {
        console.error('Status fetch failed', response.status);
        break;
      }

      if (statusText === 'deployed') {
        alert("Congrats! You've deployed your first project")
        setDeployed(true);
        break;
      }

      if (statusText === 'failed') {
        alert("Deployment failed. Check repo structure, package.json, or npm version.")
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }



  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white/5 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-800 p-8">
        <h1 className="text-3xl font-semibold text-white mb-4">Deployer</h1>

        <form className="space-y-4" onSubmit={handleButtonClick}>
          <label className="block text-sm text-slate-300">Enter the GitHub Repo URL</label>
          <input
            type="url"
            name="repoUrl"
            placeholder="https://github.com/user/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-transparent px-4 py-3 shadow-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />

          <div className="flex items-center gap-3">
            <button className="px-5 py-2 bg-sky-600 text-white rounded-lg shadow hover:bg-sky-700 transition" type="submit">Deploy</button>
            <div className="text-sm text-slate-300">Deployment ID: <span className="font-mono text-white">{id || '—'}</span></div>
            <div className="ml-auto text-sm">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${status === 'deployed' ? 'bg-emerald-900 text-emerald-300' : status === 'failed' ? 'bg-rose-900 text-rose-300' : 'bg-slate-800 text-slate-300'}`}>
                {status || 'idle'}
              </span>
            </div>
          </div>
        </form>

        {deployed && (
          <div className="mt-6 border-t border-slate-800 pt-4 flex items-center justify-between gap-4">
            <div className="text-sm text-slate-300">{`Preview: ${Backend_URL}/${id}/index.html`}</div>
            <a
              href={`${Backend_URL}/${id}/index.html`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 shadow text-sky-300 hover:bg-slate-700"
            >
              Visit Website
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
