export type PackageChoice =
  | "song_audio"
  | "song_audio_lyrics"
  | "video"
  | "video_lyrics"
  | "everything_bundle";

export const PACKAGE_PRICES: Record<PackageChoice, number> = {
  song_audio: 119,
  song_audio_lyrics: 139,
  video: 239,
  video_lyrics: 259,
  everything_bundle: 299,
};

export const PACKAGE_LABELS: Record<PackageChoice, string> = {
  song_audio: "Custom Song (Audio)",
  song_audio_lyrics: "Custom Song + Printable Lyrics Sheet",
  video: "Custom Song + Photo Music Video",
  video_lyrics: "Photo Music Video + Printable Lyrics Sheet",
  everything_bundle: "Everything Bundle",
};

export function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
