import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getStreamingUrlApi } from '../../api/upload.api';

export default function VideoPlayer({ keyId }) {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [mediaCategory, setMediaCategory] = useState(null); // 'video'|'image'|'audio'|'pdf'|'other'

  useEffect(() => {
    if (!keyId) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const resp = await getStreamingUrlApi({ key: keyId });

        // backend may return different shapes: a string (url) or an object { url, contentType, filename }
        let payload = resp;
        // handle possible wrapper
        if (payload && payload.data) payload = payload.data;

        let resolvedUrl = null;
        let resolvedMime = null;
        let resolvedName = null;

        if (typeof payload === 'string') {
          resolvedUrl = payload;
        } else if (payload && typeof payload === 'object') {
          resolvedUrl = payload.url || payload.signedUrl || payload.path || null;
          resolvedMime = payload.contentType || payload.content_type || payload.mime || null;
          resolvedName = payload.filename || payload.name || null;
        }

        if (!resolvedUrl) {
          throw new Error('No URL returned from server');
        }

        // infer type if mime not provided
        const inferTypeFromUrl = (u) => {
          const ext = (u || '').split('?')[0].split('.').pop().toLowerCase();
          if (!ext) return 'other';
          const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'mkv'];
          const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
          const audioExts = ['mp3', 'wav', 'aac', 'm4a', 'ogg'];
          if (videoExts.includes(ext)) return 'video';
          if (imageExts.includes(ext)) return 'image';
          if (audioExts.includes(ext)) return 'audio';
          if (ext === 'pdf') return 'pdf';
          return 'other';
        };

  let category = 'other';
        if (resolvedMime) {
          if (resolvedMime.startsWith('video/')) category = 'video';
          else if (resolvedMime.startsWith('image/')) category = 'image';
          else if (resolvedMime.startsWith('audio/')) category = 'audio';
          else if (resolvedMime === 'application/pdf') category = 'pdf';
        } else {
          category = inferTypeFromUrl(resolvedUrl);
        }

        if (!mounted) return;
        setUrl(resolvedUrl);
        setFileName(resolvedName);
        setMediaCategory(category);
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
          <span className="back-label">Overview</span>
        </button>
        <div className="video-title">{fileName || 'Preview'}</div>
      </div>

      {loading && <div className="video-placeholder">Loading…</div>}
      {error && <div className="video-error">Error: {error}</div>}

      {!loading && !error && url && mediaCategory === 'video' && (
        <div className="video-wrap">
          <video className="video-player" controls src={url} />
        </div>
      )}

      {!loading && !error && url && mediaCategory === 'audio' && (
        <div className="video-wrap">
          <audio className="audio-player" controls src={url} />
        </div>
      )}

      {!loading && !error && url && mediaCategory === 'image' && (
        <div className="video-wrap">
          <img className="media-image" src={url} alt={fileName || 'image'} />
        </div>
      )}

      {!loading && !error && url && mediaCategory === 'pdf' && (
        <div className="video-wrap">
          <iframe title={fileName || 'document'} src={url} style={{ width: '100%', height: '70vh', border: 0 }} />
        </div>
      )}

      {!loading && !error && url && mediaCategory === 'other' && (
        <div className="video-wrap">
          <p className="muted">Preview not available for this file type.</p>
          <a className="primary-button" href={url} target="_blank" rel="noreferrer">Open / Download</a>
        </div>
      )}

      {!loading && !error && !url && (
        <div className="video-placeholder">No preview available.</div>
      )}
    </div>
  );
}
