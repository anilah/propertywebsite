// CloudFront Function (viewer-response) — auto-heal stuck PWA clients.
// Clear-Site-Data ONLY on top-level HTML navigations. Never on /sw.js or
// credentialsless fetch() probes (those log console noise and cannot apply CSD).
function handler(event) {
  var request = event.request;
  var response = event.response;
  var uri = request.uri || '';
  var headers = (request.headers) || {};
  var ct =
    (response.headers &&
      response.headers['content-type'] &&
      response.headers['content-type'].value) ||
    '';

  var isHtml = ct.indexOf('text/html') !== -1;
  var isSw = uri === '/sw.js' || uri.indexOf('/sw.js') === 0;
  if (!isHtml && !isSw) {
    return response;
  }

  if (!response.headers) response.headers = {};
  response.headers['cache-control'] = { value: 'no-cache, no-store, must-revalidate' };

  // SW script: cache-bust headers only — never Clear-Site-Data
  if (isSw || !isHtml) {
    return response;
  }

  // Only top-level document navigations (not fetch/?_kh_probe= or XHR)
  var dest = (headers['sec-fetch-dest'] && headers['sec-fetch-dest'].value) || '';
  var mode = (headers['sec-fetch-mode'] && headers['sec-fetch-mode'].value) || '';
  var accept = (headers.accept && headers.accept.value) || '';
  var isDocumentNav =
    dest === 'document' ||
    mode === 'navigate' ||
    (accept.indexOf('text/html') !== -1 && accept.indexOf('*/*') === -1);

  if (!isDocumentNav) {
    return response;
  }

  var cookies = request.cookies || {};
  // Bump cookie name whenever we need another forced heal wave
  if (cookies['kaboo_csr4'] && cookies['kaboo_csr4'].value === '1') {
    return response;
  }

  response.headers['clear-site-data'] = { value: '"cache", "executionContexts"' };
  response.cookies = response.cookies || {};
  response.cookies['kaboo_csr4'] = {
    value: '1',
    attributes: 'Path=/; Max-Age=31536000; SameSite=Lax; Secure',
  };

  return response;
}
