import { normalizeTimelineData } from "./timeline-normalizer.service";

/**
 * Provides an authentic sample journey route across scenic spots in Indonesia (Bandar Lampung to Jakarta & Bandung)
 * for instant demo preview without requiring users to have their own export file ready.
 */
export function getSampleTimelineData() {
  const samplePoints = [
    { lat: -5.4294, lng: 105.2625, time: "2026-05-10T08:00:00.000Z", id: "s_1" },
    { lat: -5.4412, lng: 105.2811, time: "2026-05-10T08:45:00.000Z", id: "s_2" },
    { lat: -5.5123, lng: 105.3456, time: "2026-05-10T09:30:00.000Z", id: "s_3" },
    { lat: -5.7145, lng: 105.5892, time: "2026-05-10T10:45:00.000Z", id: "s_4" },
    { lat: -5.8712, lng: 105.7534, time: "2026-05-10T12:00:00.000Z", id: "s_5" },
    { lat: -5.9245, lng: 105.9912, time: "2026-05-10T13:30:00.000Z", id: "s_6" },
    { lat: -6.0123, lng: 106.0834, time: "2026-05-10T14:45:00.000Z", id: "s_7" },
    { lat: -6.1145, lng: 106.3456, time: "2026-05-10T16:00:00.000Z", id: "s_8" },
    { lat: -6.1754, lng: 106.8272, time: "2026-05-10T17:30:00.000Z", id: "s_9" },
    { lat: -6.2088, lng: 106.8456, time: "2026-05-11T09:00:00.000Z", id: "s_10" },
    { lat: -6.3245, lng: 106.9123, time: "2026-05-11T11:30:00.000Z", id: "s_11" },
    { lat: -6.5950, lng: 106.8166, time: "2026-05-11T13:45:00.000Z", id: "s_12" },
    { lat: -6.7012, lng: 106.9834, time: "2026-05-11T15:30:00.000Z", id: "s_13" },
    { lat: -6.8456, lng: 107.3456, time: "2026-05-11T17:00:00.000Z", id: "s_14" },
    { lat: -6.9175, lng: 107.6191, time: "2026-05-11T18:30:00.000Z", id: "s_15" },
  ];

  const samplePlaces = [
    {
      id: "sp_1",
      name: "Bandar Lampung",
      location: { lat: -5.4294, lng: 105.2625 },
      startTime: "2026-05-10T08:00:00.000Z",
    },
    {
      id: "sp_2",
      name: "Pelabuhan Bakauheni",
      location: { lat: -5.8712, lng: 105.7534 },
      startTime: "2026-05-10T12:00:00.000Z",
    },
    {
      id: "sp_3",
      name: "Monas, Jakarta",
      location: { lat: -6.1754, lng: 106.8272 },
      startTime: "2026-05-10T17:30:00.000Z",
    },
    {
      id: "sp_4",
      name: "Bogor Botanical Garden",
      location: { lat: -6.5950, lng: 106.8166 },
      startTime: "2026-05-11T13:45:00.000Z",
    },
    {
      id: "sp_5",
      name: "Gedung Sate, Bandung",
      location: { lat: -6.9175, lng: 107.6191 },
      startTime: "2026-05-11T18:30:00.000Z",
    },
  ];

  const sampleJourneys = [
    {
      id: "sj_1",
      route: samplePoints.slice(0, 9),
      startTime: "2026-05-10T08:00:00.000Z",
      endTime: "2026-05-10T17:30:00.000Z",
      activityType: "IN_PASSENGER_VEHICLE",
    },
    {
      id: "sj_2",
      route: samplePoints.slice(8),
      startTime: "2026-05-11T09:00:00.000Z",
      endTime: "2026-05-11T18:30:00.000Z",
      activityType: "IN_PASSENGER_VEHICLE",
    },
  ];

  return normalizeTimelineData({
    rawPoints: samplePoints,
    rawPlaces: samplePlaces,
    rawJourneys: sampleJourneys,
    rawActivities: ["IN_PASSENGER_VEHICLE", "WALKING"],
  });
}
