import type { TrendRange } from "../dto/dashboard/dashboardDTO";
import { addDays, addMonths, todayKey, startOfDay } from "./dateKeys";


export interface TrendWindow {

    keys: string[],
    granularity: "day" | "month";
    keyLength: 7 | 10;
    format: "%Y-%m-%d" | "%Y-%m";
    fromKey: string;
    toKey: string;
    fromDate: Date;
    toDate: Date;

}

export function buildTrendWindow( range:TrendRange):TrendWindow {

    const today = todayKey() 

    if(range === "week"){ 

        const keys = Array.from({ length: 7}, (_,i)=> addDays(today,i-6))
        return { 

            keys,
            granularity: "day",
            keyLength: 10,
            format: "%Y-%m-%d",
            fromKey: keys[0],
            toKey: today,
            fromDate: startOfDay(keys[0]),
            toDate: startOfDay(addDays(today, 1)),
        }
    }

    const thisMonth = today.slice(0,7)
    const keys = Array.from({ length:6}, (_,i)=> addMonths( thisMonth,i-5))
    return {

        keys,
        granularity: "month", 
        keyLength: 7,
        format: "%Y-%m", 
        fromKey: `${keys[0]}-01`,
        toKey: `${thisMonth}-31`,
        fromDate: startOfDay(`${keys[0]}-01`),
        toDate: startOfDay(`${addMonths(thisMonth, 1)}-01`),
    }
}