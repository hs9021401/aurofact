// profile-view.js - Explicit public projection for profile data

(function (root) {
  "use strict";

  function hasApiKey(profile) {
    return typeof profile?.apiKey === "string" && profile.apiKey.trim().length > 0;
  }

  function parseEndpoint(apiUrl) {
    if (typeof apiUrl !== "string" || apiUrl.trim() === "") return null;

    try {
      return new URL(apiUrl.trim());
    } catch (error) {
      return null;
    }
  }

  function isHttpEndpoint(apiUrl) {
    const endpoint = parseEndpoint(apiUrl);
    return endpoint?.protocol === "http:";
  }

  function isSupportedEndpoint(apiUrl) {
    const endpoint = parseEndpoint(apiUrl);
    return endpoint?.protocol === "http:" || endpoint?.protocol === "https:";
  }

  function getEndpointPermissionPattern(apiUrl) {
    const endpoint = parseEndpoint(apiUrl);
    if (!endpoint || !isSupportedEndpoint(apiUrl)) return "";
    return `${endpoint.origin}/*`;
  }

  function isLocalEndpoint(apiUrl) {
    const endpoint = parseEndpoint(apiUrl);
    if (!endpoint || !isSupportedEndpoint(apiUrl)) return false;
    const hostname = endpoint?.hostname.toLowerCase();
    return hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      hostname === "::1";
  }

  function isLocalProfile(profile) {
    return isLocalEndpoint(profile?.apiUrl);
  }

  function toPublicProfile(profile) {
    const source = profile && typeof profile === "object" ? profile : {};

    // Use an allowlist. Do not spread the source object so future secret fields
    // cannot accidentally cross the content-script boundary.
    return {
      id: typeof source.id === "string" ? source.id : "",
      name: typeof source.name === "string" ? source.name : "",
      model: typeof source.model === "string" ? source.model : "",
      apiFormat: source.apiFormat === "anthropic" ? "anthropic" : "openai",
      hasKey: hasApiKey(source),
      isLocal: isLocalProfile(source)
    };
  }

  function toPublicProfilePayload(data) {
    const profiles = Array.isArray(data?.profiles) ? data.profiles : [];
    const activeProfile = data?.activeProfile || null;

    return {
      profiles: profiles.map(toPublicProfile),
      activeProfileId: typeof data?.activeProfileId === "string" ? data.activeProfileId : "",
      activeProfile: activeProfile ? toPublicProfile(activeProfile) : null
    };
  }

  root.AurofactProfileView = Object.freeze({
    isHttpEndpoint,
    isSupportedEndpoint,
    getEndpointPermissionPattern,
    isLocalEndpoint,
    isLocalProfile,
    toPublicProfile,
    toPublicProfilePayload
  });
})(typeof self !== "undefined" ? self : globalThis);
