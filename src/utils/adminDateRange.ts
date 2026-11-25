
export type TrendRange = "week" | "month"; 

const IST_OFFSET_MS = 330 * 60 * 1000;

export interface TrendBucket {

    _id:string;
    value:number

}

export interface TrendWindow { 

    start: Date;
    keys: string[];
    labels:string[];
    format:string
}

export const getMonthBoundaries = (now: Date) => {
  const ist = new Date(now.getTime() + IST_OFFSET_MS); 
  const y = ist.getUTCFullYear();
  const m = ist.getUTCMonth();
  return {
    monthStart: new Date(Date.UTC(y, m, 1) - IST_OFFSET_MS),
    lastMonthStart: new Date(Date.UTC(y, m - 1, 1) - IST_OFFSET_MS),
  };
};

export const buildTrendWindow = (range: TrendRange, now = new Date()): TrendWindow => {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  const y = ist.getUTCFullYear();
  const m = ist.getUTCMonth();
  const d = ist.getUTCDate();

  if (range === "week") {
    const days = [6, 5, 4, 3, 2, 1, 0].map((i) => new Date(Date.UTC(y, m, d - i)));
    return {
      start: new Date(Date.UTC(y, m, d - 6) - IST_OFFSET_MS),
      keys: days.map((x) => x.toISOString().slice(0, 10)),
      labels: days.map((x) => x.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })),
      format: "%Y-%m-%d",
    };
  }

  const months = [5, 4, 3, 2, 1, 0].map((i) => new Date(Date.UTC(y, m - i, 1)));
  return {
    start: new Date(Date.UTC(y, m - 5, 1) - IST_OFFSET_MS),
    keys: months.map((x) => x.toISOString().slice(0, 7)),
    labels: months.map((x) => x.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })),
    format: "%Y-%m",
  };
};

export const fillBuckets = (keys: string[], buckets: TrendBucket[]): number[] => {
  const byKey = new Map(buckets.map((b) => [b._id, b.value]));
  return keys.map((k) => byKey.get(k) ?? 0);
};


export const percentChange = ( current: number, previous:number):number | null => 
    previous === 0 ?null :((current - previous)/previous)  * 100