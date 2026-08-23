/**
 * Checks supported video mime types in the current browser
 */
export function getSupportedVideoMimeType() {
  if (typeof window === "undefined" || !window.MediaRecorder) {
    return null;
  }

  const candidateMimeTypes = [
    "video/mp4;codecs=avc1",
    "video/mp4",
    "video/webm;codecs=h264",
    "video/webm;codecs=vp9",
    "video/webm",
  ];

  for (const mimeType of candidateMimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  return null;
}

export function isMp4EncodingSupported() {
  if (typeof window === "undefined" || !window.MediaRecorder) {
    return false;
  }
  return (
    MediaRecorder.isTypeSupported("video/mp4;codecs=avc1") ||
    MediaRecorder.isTypeSupported("video/mp4")
  );
}
