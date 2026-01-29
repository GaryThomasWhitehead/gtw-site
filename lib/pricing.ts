export type PackageChoice =
  | "song_audio"
  | "song_audio_lyrics"
  | "video"
  | "video_lyrics"
  | "everything_bundle";

export const PACKAGE_PRICES: Record<PackageChoice, number> = {
  song_audio: 119,
  song_audio_lyrics: 149,
  video: 369,
  video_lyrics: 399,
  everything_bundle: 469,
};

export function priceFor(choice?: PackageChoice) {
  if (!choice) return null;
  return PACKAGE_PRICES[choice] ?? null;
}
