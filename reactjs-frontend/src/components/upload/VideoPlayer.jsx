import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getStreamingUrlApi } from '../../api/upload.api';

export default function VideoPlayer({ keyId }) {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!keyId) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const signedUrl = await getStreamingUrlApi({ key: keyId });
        if (!mounted) return;
        setUrl(signedUrl);
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || err.message || 'Failed to get streaming URL');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [keyId]);

  const goBack = () => {
    // prefer history back, but if there is no history, navigate to overview
    if (window.history.state !== null) {
      window.history.back();
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="video-shell card">
      <div className="video-header">
        <button className="icon-button back-button" onClick={goBack} aria-label="Back to overview">
          <ArrowLeft size={18} />
        </button>
        <div className="video-title">Video Preview</div>
      </div>

      {loading && <div className="video-placeholder">Loading stream…</div>}
      {error && <div className="video-error">Error: {error}</div>}

      {!loading && !error && url && (
        <div className="video-wrap">
          <video className="video-player" controls src={url} />
        </div>
      )}

      {!loading && !error && !url && (
        <div className="video-placeholder">No stream available.</div>
      )}
    </div>
  );
}
