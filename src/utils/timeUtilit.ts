export function generateTimeSlots(
  start: string,
  end: string,
  durationMinutes: number,
): string[] {
  const slots: string[] = [];
  let [hr, mi] = start.split(":").map(Number);
  const [endHr, endMi] = end.split(":").map(Number);

  while (hr < endHr || (hr === endHr && mi < endMi)) {
    slots.push(`${String(hr).padStart(2, "0")}:${String(mi).padStart(2, "0")}`);
    mi += durationMinutes;
    if (mi >= 60) {
      hr += Math.floor(mi / 60);
      mi %= 60;
    }
  }
  return slots;
}
