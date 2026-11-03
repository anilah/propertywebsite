// CloudFront Function (viewer-request) — SPA rewrite.
// /sale, /rent, /tradies, … → /index.html so S3 returns a real 200 (not a
// custom-error document). That lets viewer-response attach Clear-Site-Data
// and no-cache headers, which custom-error responses were skipping.
function handler(event) {
  var request = event.request;
  var uri = request.uri || '/';

  // Keep real files (assets, sw, icons, manifest, etc.)
  if (uri.indexOf('.') !== -1) {
    return request;
  }

  // API passthrough if ever same-origin
  if (uri.indexOf('/api') === 0) {
    return request;
  }

  request.uri = '/index.html';
  return request;
}
